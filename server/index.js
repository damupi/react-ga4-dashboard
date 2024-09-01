const express = require('express');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const cors = require('cors');

const app = express();
app.use(cors());

const analyticsDataClient = new BetaAnalyticsDataClient();

app.get('/api/ga-data', async (req, res) => {
  const { start, end } = req.query;
  
  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end dates are required' });
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: start,
          endDate: end,
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
      metrics: [
        {
          name: 'totalUsers',
        },
      ],
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Analytics' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const app = express();
const port = 8000;

app.use(cors());

const credentials = require('../../google-credentials-server.json');

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: credentials,
    projectId: credentials.project_id,
});

app.get('/api/ga-data', async (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }

    try {
        const [response] = await analyticsDataClient.batchRunReports({
            property: `properties/${process.env.GA4_PROPERTY_ID}`,
            requests: [
                {
                    dateRanges: [{ startDate: start, endDate: end }],
                    metrics: [{ name: 'totalUsers' }],
                    dimensions: [{ name: 'date' }],
                    orderBys: [{ dimension: { orderType: 'NUMERIC', dimensionName: 'date' }, desc: false }],
                },
                {
                    dateRanges: [{ startDate: start, endDate: end }],
                    metrics: [{ name: 'totalUsers' }],
                    dimensions: [{ name: 'deviceCategory' }],
                },
                {
                    dateRanges: [{ startDate: start, endDate: end }],
                    dimensions: [{ name: 'date' }],
                    metrics: [{ name: 'totalUsers' }, { name:'sessions' }, { name:'screenPageViews' }],
                    orderBys: [{ dimension: { orderType: 'NUMERIC', dimensionName: 'date' }, desc: false }],
                }
            ]
        });

        res.json({ 
            usersData: response.reports[0], 
            deviceData: response.reports[1], 
            comboData: response.reports[2], 
        });
    } catch (error) {
        console.error('Error fetching GA4 data:', error);
        res.status(500).json({ error: 'Failed to fetch data from Google Analytics' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
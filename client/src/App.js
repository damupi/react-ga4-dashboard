// Google Analytics Dashboard - Version 3.0

import React, { useState, useCallback } from 'react';
import { Chart } from 'react-google-charts';
import DatePicker from 'react-datepicker';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Remove this line:
// import './DatePicker.css';

function App() {
  const [lineData, setLineData] = useState([]);
  const [donutData, setDonutData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2024-08-01'));
  const [endDate, setEndDate] = useState(new Date('2024-08-31'));
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const fetchData = useCallback((start, end) => {
    setIsLoading(true);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    fetch(`http://localhost:8000/api/ga-data?start=${startStr}&end=${endStr}`)
      .then(response => response.json())
      .then(data => {
        console.log('Raw data from API:', data);

        if (!data.usersData || !data.usersData.rows || data.usersData.rows.length === 0) {
          console.error('No user data received from API');
          setLineData([]);
          setDonutData([]);
          setIsLoading(false);
          return;
        }

        // Process line chart data
        const dateMap = new Map(data.usersData.rows.map(row => [
          row.dimensionValues[0].value,
          parseInt(row.metricValues[0].value, 10)
        ]));

        const allDates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateString = d.toISOString().split('T')[0].replace(/-/g, '');
          allDates.push([dateString, dateMap.get(dateString) || 0]);
        }

        const lineChartData = [
          ['Date', 'Total Users'],
          ...allDates
        ];

        setLineData(lineChartData);

        // Process donut chart data
        const donutChartData = [
          ['Device Category', 'Total Users'],
          ...data.deviceData.rows.map(row => [
            row.dimensionValues[0].value,
            parseInt(row.metricValues[0].value, 10)
          ])
        ];

        setDonutData(donutChartData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      fetchData(start, end);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <div className="row py-4">
        <div className="col-md-8">
          <header>
            <h1 className="display-3">Google Analytics Dashboard</h1>
          </header>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Select Date Range</h5>
              <button 
                className="btn btn-primary mb-2" 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              >
                {isDatePickerOpen ? 'Close' : 'Open'} Date Picker
              </button>
              {isDatePickerOpen && (
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  className="form-control custom-datepicker"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-8">
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : lineData.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <Chart
                  chartType="LineChart"
                  width="100%"
                  height="400px"
                  data={lineData}
                  options={{
                    title: 'Total Users Over Time',
                    interpolateNulls: false,
                    pointSize: 5,
                    legend: { position: 'bottom' },
                    chartArea: { width: '80%', height: '70%' },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="alert alert-info" role="alert">
              No data available for the selected date range.
            </div>
          )}
        </div>
        <div className="col-md-4">
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : donutData.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="400px"
                  data={donutData}
                  options={{
                    title: 'Users by Device Category',
                    pieHole: 0.4,
                    legend: { position: 'bottom' },
                    chartArea: { width: '80%', height: '70%' },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="alert alert-info" role="alert">
              No device data available for the selected date range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

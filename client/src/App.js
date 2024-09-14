import React, { useState, useCallback, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import IsLoading from './IsLoading';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import ChartComponent from './ChartComponent';

function App() {
  const [lineData, setLineData] = useState({
    labels: [], // Ensuring empty labels array as default
    datasets: [] // Ensuring empty datasets array as default
  });
  const [donutData, setDonutData] = useState({
    labels: [],
    datasets: []
  });
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 29)));
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const fetchData = useCallback((start, end) => {
    setIsLoading(true);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    fetch(`http://localhost:8000/api/ga-data?start=${startStr}&end=${endStr}`)
      .then(response => response.json())
      .then(data => {
        // Ensure that usersData and deviceData exist and have rows
        if (!data || !data.usersData || !data.usersData.rows || !data.deviceData || !data.deviceData.rows) {
          console.error('No valid data received from API');
          setLineData({ labels: [], datasets: [] });
          setDonutData({ labels: [], datasets: [] });
          setIsLoading(false);
          return;
        }

        // Line chart data processing
        const labels = [];
        const totalUsers = [];
        const dateMap = new Map(data.usersData.rows.map(row => [
          row.dimensionValues[0].value,
          parseInt(row.metricValues[0].value, 10)
        ]));

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateString = d.toISOString().split('T')[0].replace(/-/g, '');
          labels.push(dateString);
          totalUsers.push(dateMap.get(dateString) || 0);
        }

        setLineData({
          labels,
          datasets: [{
            label: 'Total Users',
            data: totalUsers,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            pointRadius: 5,
          }]
        });

        // Donut chart data processing
        setDonutData({
          labels: data.deviceData.rows.map(row => row.dimensionValues[0].value),
          datasets: [{
            data: data.deviceData.rows.map(row => parseInt(row.metricValues[0].value, 10)),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          }]
        });

        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData(new Date(new Date().setDate(new Date().getDate() - 29)), new Date(new Date().setDate(new Date().getDate() - 1)));
  }, [fetchData]);

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
            <IsLoading />
          ) : lineData && lineData.datasets.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <Line data={lineData} options={{
                  responsive: true,
                  title: { display: true, text: 'Total Users Over Time' },
                  scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Total Users' } }
                  },
                  elements: { point: { radius: 5 } }
                }} />
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
            <IsLoading />
          ) : donutData && donutData.datasets.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <Pie data={donutData} options={{
                  responsive: true,
                  title: { display: true, text: 'Users by Device Category' },
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} />
              </div>
            </div>
          ) : (
            <div className="alert alert-info" role="alert">
              No device data available for the selected date range.
            </div>
          )}
        </div>
        <div className="row">
          <div className="col-md-12">
            <h1>Data Visualization with React-Chartjs-2 in React</h1>
            <div className="card shadow-sm">
              <div className="card-body">
                <ChartComponent type="Bar" text='Total Users Over Time' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

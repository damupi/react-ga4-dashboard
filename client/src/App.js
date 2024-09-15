import React, { useState, useCallback, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { parseRequest, IsLoading, NoData  } from './Helpers';
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
  const [comboData, setComboData] = useState({
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
        // Ensure that usersData and deviceData, and comboData exist and have rows
        if (!data || !data.usersData || !data.usersData.rows || !data.deviceData || !data.deviceData.rows || !data.comboData || !data.comboData.rows) {
          console.error('No valid data received from API');
          setLineData({ labels: [], datasets: [] });
          setDonutData({ labels: [], datasets: [] });
          setComboData({ labels: [], datasets: [] });
          setIsLoading(false);
          return;
        } 

        // Line chart data processing
        const lineParse =  parseRequest(data.usersData);

        setLineData({
          labels: lineParse.dimension.date,
          datasets: [{
            label: 'Total Users',
            data: lineParse.metric.totalUsers,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            pointRadius: 5,
          }]
        });

        // Donut chart data processing        
        const donutParse =  parseRequest(data.deviceData);

        setDonutData({
          labels: donutParse.dimension.deviceCategory,
          datasets: [{
            data: donutParse.metric.totalUsers,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          }]
        });

        // Combo chart data processing
        const comboParse = parseRequest(data.comboData);
                
        setComboData({
          labels: comboParse.dimension.date,
          datasets: [
            {
              type: 'bar',
              label: 'Total Users',
              data: comboParse.metric.totalUsers,
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
            },
            {
              type: 'bar',
              label: 'Sessions',
              data: comboParse.metric.sessions,
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
            },
            {
              type: 'line',
              label: 'Page Views',
              data: comboParse.metric.screenPageViews,
              fill: false,
              borderColor: 'rgba(153,102,255,1)',
            },
          ]
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
                <ChartComponent type="Line" data={lineData} options={{
                  responsive: true,
                  title: { display: true, text: 'Total Users Over Time' },
                  scales: {
                    x: { title: { display: false, text: 'Date' } },
                    y: { title: { display: false, text: 'Total Users' } }
                  },
                  elements: { point: { radius: 5 } }
                }} />
              </div>
            </div>
          ) : (
           < NoData />
          )}
        </div>

        <div className="col-md-4">
          {isLoading ? (
            <IsLoading />
          ) : donutData && donutData.datasets.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <ChartComponent type="Pie" data={donutData} options={{
                  responsive: true,
                  title: {
                    display: true,
                    text: "Users by Category Device"
                  },
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} />
              </div>
            </div>
          ) : ( < NoData />  )}
        </div>
        <div className="row">
          <div className="col-md-12">
            <h1>Data Visualization with React-Chartjs-2 in React</h1>
            {isLoading ? ( <IsLoading />  ) : lineData && lineData.datasets.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <ChartComponent type="Bar" data={comboData} options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: "Total Users, Sessions and Views"
                    },
                    scales: {
                      x: {
                        type: "category",
                        grid: {
                          display: true
                        }
                      },
                      y: {
                        grid: {
                          display: true
                        },
                        ticks: {
                          beginAtZero: true
                        }
                      }
                    },
                    legend: {
                      position: "top"
                    }
                  }
                }} />
              </div>
            </div>
          ) : ( < NoData />  )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

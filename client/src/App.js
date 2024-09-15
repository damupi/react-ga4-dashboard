import React, { useState, useCallback, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { IsLoading, ParseComboChart } from './Helpers';
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

        // function to parse the date dimension values
        function parseRequest(request) {
          let labels = [];
          let metrics = [];

          const requestMap = new Map(request.rows.map((row) => [
            row.dimensionValues.map((dimensionValue) => dimensionValue.value).join(','),
            row.metricValues.map((metricValue) => parseInt(metricValue.value, 10)).reduce((acc, current) => acc + current)
          ]));

          // console.log('requestMap', requestMap);
        
          // loop that iterates throgh start and end date picker
          // converts the date type to string
          // and pushes the values to the labels array
          // with a default value of 0
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0].replace(/-/g, '');
            labels.push(dateString);
            metrics.push(requestMap.get(dateString) || 0);
          }
          return { labels: labels, data: metrics };

        }

        function parseRequest2(request) {
          const { dimensionHeaders, metricHeaders, rows } = request;
        
          const parseData = {
            dimension: {},
            metric: {}
          };
        
          // Initialize dimension objects with keys from dimensionHeaders
          dimensionHeaders.forEach((header, index) => {
            parseData.dimension[header.name] = [];
          });
        
          // Initialize metric objects with keys from metricHeaders
          metricHeaders.forEach((header, index) => {
            parseData.metric[header.name] = [];
          });
        
          // Populate dimension and metric values from rows
          rows.forEach((row) => {
            row.dimensionValues.forEach((dimensionValue, index) => {
              parseData.dimension[dimensionHeaders[index].name].push(dimensionValue.value);
            });
        
            row.metricValues.forEach((metricValue, index) => {
              parseData.metric[metricHeaders[index].name].push(metricValue.value);
            });
          });
        
          return parseData;
        }
        
        
        // Line chart data processing
        const lineParse =  parseRequest(data.usersData);


        setLineData({
          labels: lineParse.labels,
          datasets: [{
            label: 'Total Users',
            data: lineParse.data,
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

        // Combo chart data processing
        const comboParse = parseRequest2(data.comboData);
        console.log('comboData', data.comboData);
        console.log('comboParse', comboParse);
        
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

  // Test chartdata
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        type: 'bar',
        label: "Sales",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "rgba(75, 192, 192, 0.7)"
      },
      {
        type: 'bar',
        label: 'Expenses',
        data: [8, 10, 6, 4, 3, 2],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        type: 'line',
        label: 'Cumulative Sales',
        data: [12, 31, 34, 38, 40, 43],
        fill: false,
        borderColor: 'rgba(153, 102, 255, 0.9)',
      },
    ]
  };

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
                <ChartComponent type="Pie" data={donutData} options={{
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

          {isLoading ? (
            <IsLoading />
          ) : lineData && lineData.datasets.length > 0 ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <ChartComponent type="Bar" data={comboData} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top"
                    },
                    title: {
                      display: true,
                      text: "Testing title"
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
                    }
                  }
                }} />
              </div>
            </div>
          ) : (
            <div className="alert alert-info" role="alert">
              No data available for the selected date range.
            </div>
          )}


            {/* Old card
            <div className="card shadow-sm">
              <div className="card-body">
                <ChartComponent type="Bar" data={comboData} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top"
                    },
                    title: {
                      display: true,
                      text: "Testing title2"
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
                    }
                  }
                }} />
              </div>
            </div> */}




          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

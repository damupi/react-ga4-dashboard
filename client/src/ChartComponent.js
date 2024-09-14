import React from "react";
import { 
    Chart as ChartJS, 
    ArcElement, 
    CategoryScale, 
    LinearScale,
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    PointElement, 
    LineElement
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar } from "react-chartjs-2";


ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);


const ChartComponent = ({type = "Bar", text = "Chart.js Bar Chart" }) => {
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "rgba(75, 192, 192, 0.7)"
      },
      {
        label: 'Expenses',
        data: [8, 10, 6, 4, 3, 2],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: text
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
  };

  const chartTypes = {
    Bar: Bar,
    Line: Line,
    Pie: Pie,
    Doughnut: Doughnut,
    PolarArea: PolarArea,
    Radar: Radar
  };

  const ChartToRender = chartTypes[type] || Bar; // Default to Bar chart if no type is provided

  return <ChartToRender data={chartData} options={chartOptions} />;
};

export default ChartComponent;
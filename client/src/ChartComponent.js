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


const ChartComponent = ({type = "Bar", data={}, options={} }) => {

  const chartTypes = {
    Bar: Bar,
    Line: Line,
    Pie: Pie,
    Doughnut: Doughnut,
    PolarArea: PolarArea,
    Radar: Radar
  };

  const ChartToRender = chartTypes[type] || Bar; // Default to Bar chart if no type is provided

  return <ChartToRender data={data} options={options} />;
};

export default ChartComponent;
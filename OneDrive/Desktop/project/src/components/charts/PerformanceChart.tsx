import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  type?: 'line' | 'bar' | 'pie';
  data?: any;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ type = 'line', data }) => {
  // Sample data for demonstration
  const sampleLineData = {
    labels: ['Attendance', 'Exams', 'Internships', 'Presentations', 'Projects', 'Symposiums', 'Certifications'],
    datasets: [
      {
        label: 'Average Score',
        data: [78, 65, 81, 72, 85, 68, 90],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Top Performers',
        data: [92, 88, 95, 89, 97, 85, 98],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const sampleBarData = {
    labels: ['Computer Science', 'Electrical Engineering', 'Mechanical', 'Civil Engineering', 'Business'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: [85, 78, 82, 75, 88],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Exam Performance',
        data: [72, 68, 75, 70, 82],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Project Scores',
        data: [80, 75, 78, 72, 85],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const samplePieData = {
    labels: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
    datasets: [
      {
        data: [25, 35, 20, 15, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data || sampleBarData} options={options} height={300} />;
      case 'pie':
        return <Pie data={data || samplePieData} options={options} height={300} />;
      default:
        return <Line data={data || sampleLineData} options={options} height={300} />;
    }
  };

  return (
    <div className="h-[300px]">
      {renderChart()}
    </div>
  );
};

export default PerformanceChart;
import React, { useState } from 'react';
import { LineChart, PieChart, BarChart, ArrowDown, Filter } from 'lucide-react';
import PerformanceChart from '../components/charts/PerformanceChart';

const Analytics = () => {
  const [chartType, setChartType] = useState('overall');
  const [timeRange, setTimeRange] = useState('semester');
  const [department, setDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const metrics = [
    {
      id: 'overall',
      name: 'Overall Performance',
      description: 'Combined metrics across all areas',
      icon: <LineChart className="w-5 h-5" />,
    },
    {
      id: 'attendance',
      name: 'Attendance Analysis',
      description: 'Attendance patterns and trends',
      icon: <BarChart className="w-5 h-5" />,
    },
    {
      id: 'exams',
      name: 'Exam Performance',
      description: 'Detailed exam score analysis',
      icon: <LineChart className="w-5 h-5" />,
    },
    {
      id: 'department',
      name: 'Department Comparison',
      description: 'Performance metrics by department',
      icon: <PieChart className="w-5 h-5" />,
    },
  ];

  const departments = ['all', 'Computer Science', 'Electrical Engineering', 'Mechanical', 'Civil Engineering', 'Business'];
  const timeRanges = ['semester', 'year', 'all'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRanges.map((range) => (
                <option key={range} value={range}>
                  {range === 'semester' ? 'Current Semester' : range === 'year' ? 'Current Year' : 'All Time'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDepartment('all');
                setTimeRange('semester');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            onClick={() => setChartType(metric.id)}
            className={`cursor-pointer rounded-lg p-4 transition-colors duration-300 ${
              chartType === metric.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <div className="flex items-center">
              <div 
                className={`p-2 rounded-full ${
                  chartType === metric.id ? 'bg-blue-600' : 'bg-blue-100'
                }`}
              >
                {React.cloneElement(metric.icon, { 
                  className: `w-5 h-5 ${chartType === metric.id ? 'text-white' : 'text-blue-500'}`
                })}
              </div>
              <div className="ml-3">
                <h3 className="font-medium">{metric.name}</h3>
                <p className={`text-xs mt-1 ${chartType === metric.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {metric.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {metrics.find((m) => m.id === chartType)?.name || 'Analytics'}
          </h2>
        </div>
        <div className="p-6">
          <div className="h-[500px]">
            {chartType === 'overall' && (
              <PerformanceChart type="line" />
            )}
            {chartType === 'attendance' && (
              <PerformanceChart type="bar" />
            )}
            {chartType === 'exams' && (
              <PerformanceChart type="line" />
            )}
            {chartType === 'department' && (
              <PerformanceChart type="pie" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Insights</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <ArrowDown className="w-5 h-5 transform rotate-180" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">High Attendance Impact</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Students with 90%+ attendance show 15% higher exam scores on average.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                <ArrowDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Project Experience Correlation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Students with 3+ projects perform better in practical assessments by 22%.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                <ArrowDown className="w-5 h-5 transform rotate-45" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Certification Advantage</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Students with industry certifications receive 30% more internship offers.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Distribution</h2>
          <div className="h-64">
            <PerformanceChart type="pie" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
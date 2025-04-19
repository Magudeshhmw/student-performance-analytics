import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import PerformanceCard from '../components/PerformanceCard';
import PerformanceChart from '../components/charts/PerformanceChart';
import StudentTable from '../components/StudentTable';
import { getStudents, getStudentPerformance } from '../services/api';

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  year_of_study: number;
  semester: number;
}

const Dashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ department: '', year: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getStudents();
        setStudents(data);
        
        // Extract unique departments and years for filters
        const uniqueDepartments = Array.from(new Set(data.map((student: Student) => student.department)));
        const uniqueYears = Array.from(new Set(data.map((student: Student) => student.year_of_study)));
        
        setDepartments(uniqueDepartments);
        setYears(uniqueYears.sort());
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch students. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filter.department === '' || student.department === filter.department;
    const matchesYear = filter.year === '' || student.year_of_study === parseInt(filter.year);
    
    return matchesSearch && matchesDepartment && matchesYear;
  });

  const clearFilters = () => {
    setFilter({ department: '', year: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Student Performance Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <Link 
            to="/files" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Import Students
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceCard 
          title="Total Students" 
          value={students.length.toString()} 
          change="+5%" 
          color="blue" 
        />
        <PerformanceCard 
          title="Average Attendance" 
          value="82%" 
          change="+2%" 
          color="green" 
        />
        <PerformanceCard 
          title="Average Exam Score" 
          value="76%" 
          change="-1%" 
          color="red" 
        />
        <PerformanceCard 
          title="Total Departments" 
          value={departments.length.toString()} 
          change="0%" 
          color="purple" 
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Overall Performance Metrics</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 mb-6 rounded-md flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department"
                value={filter.department}
                onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year of Study
              </label>
              <select
                id="year"
                value={filter.year}
                onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-700">
            {error}
          </div>
        ) : (
          <StudentTable students={filteredStudents} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Distribution</h2>
          <PerformanceChart />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Departmental Comparison</h2>
          <PerformanceChart type="bar" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
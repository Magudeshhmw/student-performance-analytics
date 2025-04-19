import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, BookOpen, Download, Award, Calendar } from 'lucide-react';
import PerformanceChart from '../components/charts/PerformanceChart';
import { getStudentPerformance } from '../services/api';

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

interface Attendance {
  id: number;
  student_id: number;
  subject: string;
  date: string;
  status: string;
}

interface Exam {
  id: number;
  student_id: number;
  subject: string;
  exam_type: string;
  score: number;
  max_score: number;
  date: string;
}

interface Certification {
  id: number;
  student_id: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
}

interface Project {
  id: number;
  student_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  grade: number;
  max_grade: number;
  subject: string;
}

interface StudentData {
  student: Student;
  attendance: Attendance[];
  exams: Exam[];
  certifications: Certification[];
  projects: Project[];
  performance_metrics: any[];
}

const StudentDetails = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        if (!studentId) return;
        
        const data = await getStudentPerformance(parseInt(studentId));
        setStudentData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch student data. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        {error || 'No student data found.'}
        <Link to="/" className="block mt-4 text-blue-600 hover:underline">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  const { student, attendance, exams, certifications, projects } = studentData;

  // Calculate overall attendance percentage
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendancePercentage = attendance.length > 0 
    ? ((presentCount / attendance.length) * 100).toFixed(1) 
    : '0';

  // Calculate average exam score
  const avgExamScore = exams.length > 0 
    ? (exams.reduce((sum, exam) => sum + (exam.score / exam.max_score) * 100, 0) / exams.length).toFixed(1) 
    : '0';

  // Prepare attendance data for chart
  const attendanceBySubject: { [key: string]: { total: number; present: number } } = {};
  
  attendance.forEach(record => {
    if (!attendanceBySubject[record.subject]) {
      attendanceBySubject[record.subject] = { total: 0, present: 0 };
    }
    attendanceBySubject[record.subject].total += 1;
    if (record.status === 'present') {
      attendanceBySubject[record.subject].present += 1;
    }
  });

  const attendanceChartData = {
    labels: Object.keys(attendanceBySubject),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: Object.values(attendanceBySubject).map(
          ({ total, present }) => (present / total) * 100
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // Prepare exam data for chart
  const examsBySubject: { [key: string]: { total: number; scores: number[] } } = {};
  
  exams.forEach(exam => {
    if (!examsBySubject[exam.subject]) {
      examsBySubject[exam.subject] = { total: 0, scores: [] };
    }
    examsBySubject[exam.subject].total += 1;
    examsBySubject[exam.subject].scores.push((exam.score / exam.max_score) * 100);
  });

  const examChartData = {
    labels: Object.keys(examsBySubject),
    datasets: [
      {
        label: 'Average Score (%)',
        data: Object.values(examsBySubject).map(
          ({ scores }) => scores.reduce((sum, score) => sum + score, 0) / scores.length
        ),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button className="px-4 py-2 flex items-center text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 bg-white rounded-full p-3 text-blue-600 mb-4 sm:mb-0 sm:mr-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{student.first_name} {student.last_name}</h2>
              <p className="mt-1 text-blue-100">Student ID: {student.student_id}</p>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {student.email}
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {student.department}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Year {student.year_of_study}, Semester {student.semester}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'attendance'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'exams'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exams
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'projects'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'certifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Certifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-blue-800">Overall Attendance</h3>
                  <p className="mt-2 text-3xl font-bold">{attendancePercentage}%</p>
                  <p className="mt-1 text-sm text-blue-600">
                    {presentCount} present out of {attendance.length} total classes
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-green-800">Average Exam Score</h3>
                  <p className="mt-2 text-3xl font-bold">{avgExamScore}%</p>
                  <p className="mt-1 text-sm text-green-600">
                    Across {exams.length} exams
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-purple-800">Certifications</h3>
                  <p className="mt-2 text-3xl font-bold">{certifications.length}</p>
                  <p className="mt-1 text-sm text-purple-600">
                    Professional certifications completed
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Performance Overview</h3>
                <div className="h-80">
                  <PerformanceChart 
                    type="line" 
                    data={{
                      labels: ['Attendance', 'Exams', 'Projects', 'Presentations', 'Certifications'],
                      datasets: [
                        {
                          label: 'Performance Scores',
                          data: [
                            parseFloat(attendancePercentage), 
                            parseFloat(avgExamScore),
                            projects.length > 0 ? 75 : 0, // Placeholder for projects
                            65, // Placeholder for presentations
                            certifications.length * 10 > 100 ? 100 : certifications.length * 10
                          ],
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          tension: 0.3,
                        },
                        {
                          label: 'Class Average',
                          data: [80, 70, 75, 65, 40],
                          borderColor: 'rgb(54, 162, 235)',
                          backgroundColor: 'rgba(54, 162, 235, 0.2)',
                          tension: 0.3,
                        }
                      ]
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Attendance by Subject</h3>
                <div className="h-80">
                  <PerformanceChart type="bar" data={attendanceChartData} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : record.status === 'excused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Exam Performance by Subject</h3>
                <div className="h-80">
                  <PerformanceChart type="bar" data={examChartData} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exams.map((exam) => (
                      <tr key={exam.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {exam.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exam.exam_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(exam.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exam.score} / {exam.max_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (exam.score / exam.max_score) * 100 >= 90
                              ? 'bg-green-100 text-green-800'
                              : (exam.score / exam.max_score) * 100 >= 70
                              ? 'bg-blue-100 text-blue-800'
                              : (exam.score / exam.max_score) * 100 >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {((exam.score / exam.max_score) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {exams.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No exam records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              {projects.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
                  No project records found for this student.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-800">{project.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{project.subject}</p>
                        
                        {project.description && (
                          <p className="mt-4 text-sm text-gray-600">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="text-sm font-medium">
                              {new Date(project.start_date).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {project.end_date && (
                            <div>
                              <p className="text-xs text-gray-500">End Date</p>
                              <p className="text-sm font-medium">
                                {new Date(project.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          {project.grade !== null && (
                            <div>
                              <p className="text-xs text-gray-500">Grade</p>
                              <p className="text-sm font-medium">
                                {project.grade} / {project.max_grade} ({((project.grade / project.max_grade) * 100).toFixed(1)}%)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`px-6 py-3 ${
                        project.grade !== null 
                          ? ((project.grade / project.max_grade) * 100 >= 90)
                            ? 'bg-green-50'
                            : ((project.grade / project.max_grade) * 100 >= 70)
                            ? 'bg-blue-50'
                            : 'bg-yellow-50'
                          : 'bg-gray-50'
                      }`}>
                        <p className="text-sm font-medium">
                          {project.grade !== null 
                            ? ((project.grade / project.max_grade) * 100 >= 90)
                              ? 'Excellent'
                              : ((project.grade / project.max_grade) * 100 >= 70)
                              ? 'Good'
                              : 'Satisfactory'
                            : 'In Progress'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-6">
              {certifications.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
                  No certification records found for this student.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{cert.name}</h3>
                            <p className="mt-1 text-sm text-gray-600">{cert.issuing_organization}</p>
                          </div>
                          <Award className="w-6 h-6 text-yellow-500" />
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Issue Date</p>
                            <p className="text-sm font-medium">
                              {new Date(cert.issue_date).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {cert.expiry_date && (
                            <div>
                              <p className="text-xs text-gray-500">Expiry Date</p>
                              <p className="text-sm font-medium">
                                {new Date(cert.expiry_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          {cert.credential_id && (
                            <div>
                              <p className="text-xs text-gray-500">Credential ID</p>
                              <p className="text-sm font-medium">{cert.credential_id}</p>
                            </div>
                          )}
                        </div>
                        
                        {cert.credential_url && (
                          <div className="mt-4">
                            <a 
                              href={cert.credential_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              View Credential
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
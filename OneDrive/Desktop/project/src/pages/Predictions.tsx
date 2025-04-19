import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Award } from 'lucide-react';
import { getPredictions, getImprovements } from '../services/api';

interface Prediction {
  predicted_overall_score: number;
  predicted_metrics: {
    attendance: number;
    exams: number;
    projects: number;
  };
  trends: {
    attendance: {
      trend: number;
      description: string;
    };
    exams: {
      trend: number;
      description: string;
    };
    projects: {
      trend: number;
      description: string;
    };
  };
  outlook: string;
  prediction_confidence: {
    percentage: number;
    level: string;
  };
}

interface Improvement {
  area: string;
  current_score: number | null;
  target_score: number | null;
  recommendation: string;
  details: string;
  priority: string;
}

interface ImprovementData {
  recommendations: Improvement[];
  total_recommendations: number;
}

const Predictions = () => {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [improvements, setImprovements] = useState<ImprovementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch students on component mount (mock data for demo)
  useEffect(() => {
    // In a real app, this would be an API call
    setStudents([
      { id: 1, name: 'John Smith', department: 'Computer Science' },
      { id: 2, name: 'Alice Johnson', department: 'Electrical Engineering' },
      { id: 3, name: 'Michael Brown', department: 'Mechanical Engineering' },
      { id: 4, name: 'Sarah Davis', department: 'Civil Engineering' },
      { id: 5, name: 'David Wilson', department: 'Business Administration' },
    ]);
  }, []);

  const handleStudentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setStudentId(id);
    
    if (id) {
      setLoading(true);
      setError(null);
      
      try {
        // In a real application, these would be API calls
        // const predictionData = await getPredictions(id);
        // const improvementData = await getImprovements(id);
        
        // Mock data for demo
        const predictionData = {
          predicted_overall_score: 82.5,
          predicted_metrics: {
            attendance: 85.3,
            exams: 78.9,
            projects: 88.2,
          },
          trends: {
            attendance: {
              trend: 0.5,
              description: 'Slightly improving',
            },
            exams: {
              trend: -0.2,
              description: 'Slightly declining',
            },
            projects: {
              trend: 1.8,
              description: 'Improving',
            },
          },
          outlook: 'Positive',
          prediction_confidence: {
            percentage: 75.8,
            level: 'Medium',
          },
        };
        
        const improvementData = {
          recommendations: [
            {
              area: 'Exam Performance',
              current_score: 78.9,
              target_score: 85,
              recommendation: 'Focus on improving exam scores',
              details: 'Consider forming study groups or seeking additional help from instructors.',
              priority: 'High',
            },
            {
              area: 'Time Management',
              current_score: null,
              target_score: null,
              recommendation: 'Improve time management skills',
              details: 'Effective time management can help balance academic responsibilities and extracurricular activities.',
              priority: 'Medium',
            },
            {
              area: 'Project Quality',
              current_score: 88.2,
              target_score: 95,
              recommendation: 'Focus on improving project quality',
              details: 'High-quality projects demonstrate your skills and technical abilities.',
              priority: 'Low',
            },
          ],
          total_recommendations: 3,
        };
        
        setPrediction(predictionData);
        setImprovements(improvementData);
      } catch (err) {
        setError('Failed to fetch prediction data. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else {
      setPrediction(null);
      setImprovements(null);
    }
  };

  const renderTrend = (trend: number, description: string) => {
    if (trend > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>{description}</span>
        </div>
      );
    } else if (trend < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="w-4 h-4 mr-1" />
          <span>{description}</span>
        </div>
      );
    } else {
      return <span className="text-gray-600">Stable</span>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">High</span>;
      case 'Medium':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'Low':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Performance Predictions</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Student Performance Forecast</h2>
          <p className="mt-2 text-gray-600">
            Select a student to view predicted performance metrics and improvement recommendations.
          </p>
        </div>
        <div className="p-6">
          <div className="max-w-md">
            <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
              Select Student
            </label>
            <select
              id="student"
              value={studentId || ''}
              onChange={handleStudentChange}
              className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.department}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-100 p-4 rounded-md text-red-700">
              {error}
            </div>
          )}

          {prediction && !loading && (
            <div className="mt-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Projected Overall Performance</h3>
                  <div className="flex items-center">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{prediction.predicted_overall_score}%</span>
                      </div>
                      <svg className="w-32 h-32" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={prediction.predicted_overall_score >= 85 ? "#10B981" : 
                                 prediction.predicted_overall_score >= 70 ? "#3B82F6" : 
                                 prediction.predicted_overall_score >= 50 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="3"
                          strokeDasharray={`${prediction.predicted_overall_score}, 100`}
                        />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-sm text-gray-600 mb-2">
                        Prediction Confidence: <span className="font-medium">{prediction.prediction_confidence.level}</span> ({prediction.prediction_confidence.percentage}%)
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Outlook: 
                        <span className={`font-medium ml-1 ${
                          prediction.outlook === 'Positive' ? 'text-green-600' : 
                          prediction.outlook === 'Negative' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {prediction.outlook}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Metric Predictions</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Attendance</span>
                        <span className="text-sm font-medium text-gray-700">{prediction.predicted_metrics.attendance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${prediction.predicted_metrics.attendance}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs">
                        {renderTrend(prediction.trends.attendance.trend, prediction.trends.attendance.description)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Exam Performance</span>
                        <span className="text-sm font-medium text-gray-700">{prediction.predicted_metrics.exams}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${prediction.predicted_metrics.exams}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs">
                        {renderTrend(prediction.trends.exams.trend, prediction.trends.exams.description)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Project Quality</span>
                        <span className="text-sm font-medium text-gray-700">{prediction.predicted_metrics.projects}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${prediction.predicted_metrics.projects}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs">
                        {renderTrend(prediction.trends.projects.trend, prediction.trends.projects.description)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {improvements && (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Improvement Recommendations</h3>
                  </div>
                  <div className="divide-y">
                    {improvements.recommendations.map((improvement, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                              <Award className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-medium text-gray-900">{improvement.area}</h4>
                              {renderPriorityBadge(improvement.priority)}
                            </div>
                            <p className="mt-1 text-gray-600">{improvement.recommendation}</p>
                            <p className="mt-2 text-sm text-gray-500">{improvement.details}</p>
                            
                            {improvement.current_score !== null && improvement.target_score !== null && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Current: {improvement.current_score}%</span>
                                  <span>Target: {improvement.target_score}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${improvement.current_score}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
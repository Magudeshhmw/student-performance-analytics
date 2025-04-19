import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all students
export const getStudents = async () => {
  try {
    const response = await api.get('/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Get student by ID
export const getStudent = async (id: number) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

// Create new student
export const createStudent = async (studentData: any) => {
  try {
    const response = await api.post('/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Update student
export const updateStudent = async (id: number, studentData: any) => {
  try {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

// Delete student
export const deleteStudent = async (id: number) => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

// Get student performance metrics
export const getStudentPerformance = async (id: number) => {
  try {
    const response = await api.get(`/performance/student/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching performance for student ${id}:`, error);
    throw error;
  }
};

// Add attendance record
export const addAttendance = async (attendanceData: any) => {
  try {
    const response = await api.post('/performance/attendance', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Error adding attendance record:', error);
    throw error;
  }
};

// Add exam result
export const addExamResult = async (examData: any) => {
  try {
    const response = await api.post('/performance/exams', examData);
    return response.data;
  } catch (error) {
    console.error('Error adding exam result:', error);
    throw error;
  }
};

// Get analytics for a student
export const getStudentAnalytics = async (id: number) => {
  try {
    const response = await api.get(`/analytics/overall/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analytics for student ${id}:`, error);
    throw error;
  }
};

// Get attendance analysis for a student
export const getAttendanceAnalysis = async (id: number) => {
  try {
    const response = await api.get(`/analytics/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attendance analysis for student ${id}:`, error);
    throw error;
  }
};

// Get exam analysis for a student
export const getExamAnalysis = async (id: number) => {
  try {
    const response = await api.get(`/analytics/exams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam analysis for student ${id}:`, error);
    throw error;
  }
};

// Get department performance
export const getDepartmentPerformance = async () => {
  try {
    const response = await api.get('/analytics/department-performance');
    return response.data;
  } catch (error) {
    console.error('Error fetching department performance:', error);
    throw error;
  }
};

// Get predictions for a student
export const getPredictions = async (id: number) => {
  try {
    const response = await api.get(`/prediction/future-performance/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching predictions for student ${id}:`, error);
    throw error;
  }
};

// Get improvement recommendations for a student
export const getImprovements = async (id: number) => {
  try {
    const response = await api.get(`/prediction/improvements/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching improvements for student ${id}:`, error);
    throw error;
  }
};

// Upload file
export const uploadFile = async (file: File, type: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Export student data
export const exportStudentData = async (id: number, format: string) => {
  try {
    const response = await api.get(`/files/export/${id}`, {
      params: { format },
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student_${id}_export.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error(`Error exporting data for student ${id}:`, error);
    throw error;
  }
};

// Export all student data
export const exportAllData = async (format: string, filters = {}) => {
  try {
    const response = await api.get('/files/export-all', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students_export.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting all data:', error);
    throw error;
  }
};
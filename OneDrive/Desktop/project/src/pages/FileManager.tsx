import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';

const FileManager = () => {
  const [uploadType, setUploadType] = useState('students');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  
  const [exportType, setExportType] = useState('all');
  const [exportFormat, setExportFormat] = useState('json');
  const [exporting, setExporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadSuccess(false);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    // Check file extension
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'json'].includes(fileExtension || '')) {
      setUploadError('Invalid file format. Please use CSV, XLSX, or JSON files.');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    // Simulate API call
    setTimeout(() => {
      // Mock successful upload
      setUploading(false);
      setUploadSuccess(true);
      
      // Mock upload result
      if (uploadType === 'students') {
        setUploadResult({
          success: true,
          students_added: 5,
          students_skipped: 1,
          errors: []
        });
      } else if (uploadType === 'attendance') {
        setUploadResult({
          success: true,
          records_added: 25,
          records_skipped: 3,
          errors: ['Invalid date format for student S12345: 30-02-2023']
        });
      }
    }, 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    
    // Simulate API call
    setTimeout(() => {
      setExporting(false);
      
      // In a real application, this would trigger a file download
      // Mock file download for demo
      alert(`Data exported as ${exportFormat.toUpperCase()}`);
    }, 1500);
  };

  const uploadTypeOptions = [
    { value: 'students', label: 'Student Records' },
    { value: 'attendance', label: 'Attendance Records' },
    { value: 'exams', label: 'Exam Results' },
    { value: 'certifications', label: 'Certifications' },
    { value: 'projects', label: 'Projects' }
  ];
  
  const exportTypeOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'department', label: 'By Department' },
    { value: 'year', label: 'By Year' },
    { value: 'individual', label: 'Individual Student' }
  ];
  
  const exportFormatOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel (XLSX)' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Data Import/Export</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Import Data</h2>
            <p className="mt-2 text-gray-600">
              Upload CSV, Excel, or JSON files to import student data into the system.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="uploadType" className="block text-sm font-medium text-gray-700 mb-1">
                Data Type
              </label>
              <select
                id="uploadType"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                {uploadTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md py-8 px-4">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file-upload" className="cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.json"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500">CSV, XLSX, or JSON up to 10MB</p>
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  !selectedFile || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </>
                )}
              </button>
            </div>
            
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                    <p className="text-sm text-red-700 mt-1">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {uploadSuccess && uploadResult && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Upload Successful</h3>
                    <div className="mt-2 text-sm text-green-700">
                      {uploadType === 'students' && (
                        <ul className="list-disc pl-5 space-y-1">
                          <li>{uploadResult.students_added} students added</li>
                          <li>{uploadResult.students_skipped} students skipped (already exist)</li>
                          {uploadResult.errors.length > 0 && (
                            <li>{uploadResult.errors.length} errors encountered</li>
                          )}
                        </ul>
                      )}
                      {uploadType === 'attendance' && (
                        <ul className="list-disc pl-5 space-y-1">
                          <li>{uploadResult.records_added} attendance records added</li>
                          <li>{uploadResult.records_skipped} records skipped (already exist)</li>
                          {uploadResult.errors.length > 0 && (
                            <li>{uploadResult.errors.length} errors encountered</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                
                {uploadResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-800">Errors:</h4>
                    <ul className="mt-2 list-disc pl-5 text-xs text-red-600 space-y-1">
                      {uploadResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Export Data</h2>
            <p className="mt-2 text-gray-600">
              Export student performance data in various formats for analysis or reporting.
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="exportType" className="block text-sm font-medium text-gray-700 mb-1">
                Export Selection
              </label>
              <select
                id="exportType"
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                {exportTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {exportType === 'department' && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cs">Computer Science</option>
                  <option value="ee">Electrical Engineering</option>
                  <option value="me">Mechanical Engineering</option>
                  <option value="ce">Civil Engineering</option>
                  <option value="ba">Business Administration</option>
                </select>
              </div>
            )}
            
            {exportType === 'year' && (
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Study
                </label>
                <select
                  id="year"
                  className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>
            )}
            
            {exportType === 'individual' && (
              <div>
                <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  id="student"
                  className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">John Smith (CS001)</option>
                  <option value="2">Alice Johnson (EE002)</option>
                  <option value="3">Michael Brown (ME003)</option>
                  <option value="4">Sarah Davis (CE004)</option>
                  <option value="5">David Wilson (BA005)</option>
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 mb-1">
                File Format
              </label>
              <select
                id="exportFormat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full border rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                {exportFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Export Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {exportFormat === 'json' && 'JSON format provides full data structure with nested objects for advanced analysis.'}
                    {exportFormat === 'csv' && 'CSV format provides data in a flat, tabular structure suitable for spreadsheet software.'}
                    {exportFormat === 'xlsx' && 'Excel format includes multiple sheets for different data types with formatted tables.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  exporting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
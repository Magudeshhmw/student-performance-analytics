from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import pandas as pd
import json
import tempfile
from models.database import db
from models.student import Student
from models.performance_metric import PerformanceMetric, AttendanceRecord, ExamResult
from models.certifications import Certification, Project
from services.file_processor import process_student_csv, process_attendance_csv, export_student_data
from datetime import datetime

file_bp = Blueprint('file_bp', __name__)

# Ensure temp directory exists
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'json'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@file_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_type = request.form.get('type', 'students')  # Default to students
        
        # Save file temporarily
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Process file based on type
        try:
            if file_type == 'students':
                result = process_student_csv(filepath)
            elif file_type == 'attendance':
                result = process_attendance_csv(filepath)
            else:
                return jsonify({"error": "Invalid file type"}), 400
            
            # Remove temporary file
            os.remove(filepath)
            
            return jsonify(result), 200
        
        except Exception as e:
            # Remove temporary file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "File type not allowed"}), 400

@file_bp.route('/export/<int:student_id>', methods=['GET'])
def export_data(student_id):
    # Check if student exists
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Get export format from query params
    export_format = request.args.get('format', 'json').lower()
    
    if export_format not in ['json', 'csv', 'xlsx']:
        return jsonify({"error": "Invalid export format"}), 400
    
    try:
        # Generate export file
        export_file = export_student_data(student_id, export_format)
        
        # Set correct content type
        if export_format == 'json':
            mimetype = 'application/json'
        elif export_format == 'csv':
            mimetype = 'text/csv'
        else:  # xlsx
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        
        return send_file(
            export_file,
            mimetype=mimetype,
            as_attachment=True,
            download_name=f"student_{student_id}_export.{export_format}"
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@file_bp.route('/export-all', methods=['GET'])
def export_all_data():
    # Get export format from query params
    export_format = request.args.get('format', 'json').lower()
    
    if export_format not in ['json', 'csv', 'xlsx']:
        return jsonify({"error": "Invalid export format"}), 400
    
    # Get optional filter params
    department = request.args.get('department')
    year = request.args.get('year')
    
    try:
        # Apply filters if provided
        query = Student.query
        
        if department:
            query = query.filter_by(department=department)
        
        if year:
            query = query.filter_by(year_of_study=int(year))
        
        students = query.all()
        
        # Collect all student IDs
        student_ids = [student.id for student in students]
        
        # Generate export file for all filtered students
        export_file = export_student_data(student_ids, export_format)
        
        # Set correct content type
        if export_format == 'json':
            mimetype = 'application/json'
        elif export_format == 'csv':
            mimetype = 'text/csv'
        else:  # xlsx
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        
        return send_file(
            export_file,
            mimetype=mimetype,
            as_attachment=True,
            download_name=f"students_export_{datetime.now().strftime('%Y%m%d')}.{export_format}"
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
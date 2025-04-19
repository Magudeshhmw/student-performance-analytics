from flask import Blueprint, request, jsonify
from models.database import db
from models.student import Student
from models.performance_metric import PerformanceMetric, AttendanceRecord, ExamResult
from models.certifications import Certification, Project
from services.analytics import calculate_overall_performance, analyze_attendance, analyze_exam_performance
from sqlalchemy import func
import json

analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/overall/<int:student_id>', methods=['GET'])
def get_overall_performance(student_id):
    # Check if student exists
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Get all performance data for the student
    performance = PerformanceMetric.query.filter_by(student_id=student_id).all()
    attendance = AttendanceRecord.query.filter_by(student_id=student_id).all()
    exams = ExamResult.query.filter_by(student_id=student_id).all()
    certifications = Certification.query.filter_by(student_id=student_id).all()
    projects = Project.query.filter_by(student_id=student_id).all()
    
    # Calculate overall performance
    overall_score = calculate_overall_performance(
        student_id, 
        performance, 
        attendance, 
        exams, 
        certifications,
        projects
    )
    
    return jsonify(overall_score), 200

@analytics_bp.route('/attendance/<int:student_id>', methods=['GET'])
def get_attendance_analysis(student_id):
    # Check if student exists
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Get attendance records for the student
    attendance = AttendanceRecord.query.filter_by(student_id=student_id).all()
    
    # Analyze attendance
    attendance_analysis = analyze_attendance(attendance)
    
    return jsonify(attendance_analysis), 200

@analytics_bp.route('/exams/<int:student_id>', methods=['GET'])
def get_exam_analysis(student_id):
    # Check if student exists
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Get exam results for the student
    exams = ExamResult.query.filter_by(student_id=student_id).all()
    
    # Analyze exam performance
    exam_analysis = analyze_exam_performance(exams)
    
    return jsonify(exam_analysis), 200

@analytics_bp.route('/comparison', methods=['GET'])
def compare_students():
    student_ids = request.args.get('ids')
    if not student_ids:
        return jsonify({"error": "Student IDs are required"}), 400
    
    # Parse student IDs
    try:
        student_ids = [int(id) for id in student_ids.split(',')]
    except ValueError:
        return jsonify({"error": "Invalid student ID format"}), 400
    
    # Check if all students exist
    students = Student.query.filter(Student.id.in_(student_ids)).all()
    if len(students) != len(student_ids):
        return jsonify({"error": "One or more students not found"}), 404
    
    # Get overall performance for each student
    comparison_data = []
    for student in students:
        # Get all performance data for the student
        performance = PerformanceMetric.query.filter_by(student_id=student.id).all()
        attendance = AttendanceRecord.query.filter_by(student_id=student.id).all()
        exams = ExamResult.query.filter_by(student_id=student.id).all()
        certifications = Certification.query.filter_by(student_id=student.id).all()
        projects = Project.query.filter_by(student_id=student.id).all()
        
        # Calculate overall performance
        overall_score = calculate_overall_performance(
            student.id, 
            performance, 
            attendance, 
            exams, 
            certifications,
            projects
        )
        
        comparison_data.append({
            "student": student.to_dict(),
            "overall_performance": overall_score
        })
    
    return jsonify(comparison_data), 200

@analytics_bp.route('/department-performance', methods=['GET'])
def get_department_performance():
    # Get performance by department
    students = Student.query.all()
    departments = {}
    
    for student in students:
        department = student.department
        if department not in departments:
            departments[department] = {
                "total_students": 0,
                "avg_attendance": 0,
                "avg_exam_score": 0,
                "total_certifications": 0,
                "total_projects": 0
            }
        
        departments[department]["total_students"] += 1
        
        # Get attendance records
        attendance_query = db.session.query(
            func.count(AttendanceRecord.id).label('total_records'),
            func.sum(func.case((AttendanceRecord.status == 'present', 1), else_=0)).label('present_count')
        ).filter(AttendanceRecord.student_id == student.id)
        
        attendance_result = attendance_query.first()
        if attendance_result.total_records > 0:
            attendance_percentage = (attendance_result.present_count / attendance_result.total_records) * 100
            departments[department]["avg_attendance"] += attendance_percentage
        
        # Get exam results
        exam_query = db.session.query(
            func.avg(ExamResult.score / ExamResult.max_score * 100).label('avg_score')
        ).filter(ExamResult.student_id == student.id)
        
        exam_result = exam_query.first()
        if exam_result.avg_score is not None:
            departments[department]["avg_exam_score"] += exam_result.avg_score
        
        # Get certifications count
        cert_count = Certification.query.filter_by(student_id=student.id).count()
        departments[department]["total_certifications"] += cert_count
        
        # Get projects count
        project_count = Project.query.filter_by(student_id=student.id).count()
        departments[department]["total_projects"] += project_count
    
    # Calculate averages
    for dept, data in departments.items():
        if data["total_students"] > 0:
            data["avg_attendance"] /= data["total_students"]
            data["avg_exam_score"] /= data["total_students"]
            data["avg_certifications"] = data["total_certifications"] / data["total_students"]
            data["avg_projects"] = data["total_projects"] / data["total_students"]
    
    return jsonify(departments), 200
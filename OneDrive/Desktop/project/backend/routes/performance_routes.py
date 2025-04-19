from flask import Blueprint, request, jsonify
from models.database import db
from models.student import Student
from models.performance_metric import PerformanceMetric, AttendanceRecord, ExamResult
from models.certifications import Certification, Project
from datetime import datetime

performance_bp = Blueprint('performance_bp', __name__)

@performance_bp.route('/', methods=['GET'])
def get_all_performance():
    performance = PerformanceMetric.query.all()
    return jsonify([p.to_dict() for p in performance]), 200

@performance_bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_performance(student_id):
    # Check if student exists
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Get all performance metrics for the student
    performance = PerformanceMetric.query.filter_by(student_id=student_id).all()
    attendance = AttendanceRecord.query.filter_by(student_id=student_id).all()
    exams = ExamResult.query.filter_by(student_id=student_id).all()
    certifications = Certification.query.filter_by(student_id=student_id).all()
    projects = Project.query.filter_by(student_id=student_id).all()
    
    result = {
        "student": student.to_dict(),
        "performance_metrics": [p.to_dict() for p in performance],
        "attendance": [a.to_dict() for a in attendance],
        "exams": [e.to_dict() for e in exams],
        "certifications": [c.to_dict() for c in certifications],
        "projects": [p.to_dict() for p in projects]
    }
    
    return jsonify(result), 200

@performance_bp.route('/', methods=['POST'])
def add_performance_metric():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['student_id', 'metric_type', 'score', 'date_recorded']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if student exists
    student = Student.query.get(data['student_id'])
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Convert date string to date object
    try:
        date_recorded = datetime.strptime(data['date_recorded'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    new_metric = PerformanceMetric(
        student_id=data['student_id'],
        metric_type=data['metric_type'],
        subject=data.get('subject'),
        score=data['score'],
        max_score=data.get('max_score', 100.0),
        date_recorded=date_recorded,
        details=data.get('details')
    )
    
    db.session.add(new_metric)
    db.session.commit()
    
    return jsonify(new_metric.to_dict()), 201

@performance_bp.route('/attendance', methods=['POST'])
def add_attendance():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['student_id', 'subject', 'date', 'status']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if student exists
    student = Student.query.get(data['student_id'])
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Convert date string to date object
    try:
        attendance_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # Validate status
    valid_statuses = ['present', 'absent', 'excused']
    if data['status'] not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
    
    new_attendance = AttendanceRecord(
        student_id=data['student_id'],
        subject=data['subject'],
        date=attendance_date,
        status=data['status']
    )
    
    db.session.add(new_attendance)
    db.session.commit()
    
    return jsonify(new_attendance.to_dict()), 201

@performance_bp.route('/exams', methods=['POST'])
def add_exam_result():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['student_id', 'subject', 'exam_type', 'score', 'max_score', 'date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if student exists
    student = Student.query.get(data['student_id'])
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Convert date string to date object
    try:
        exam_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    new_exam = ExamResult(
        student_id=data['student_id'],
        subject=data['subject'],
        exam_type=data['exam_type'],
        score=data['score'],
        max_score=data['max_score'],
        date=exam_date
    )
    
    db.session.add(new_exam)
    db.session.commit()
    
    return jsonify(new_exam.to_dict()), 201
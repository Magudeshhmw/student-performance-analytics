from flask import Blueprint, request, jsonify
from models.database import db
from models.student import Student
from models.performance_metric import PerformanceMetric, AttendanceRecord, ExamResult
from models.certifications import Certification, Project
from services.prediction import predict_future_performance, recommend_improvements
import json

prediction_bp = Blueprint('prediction_bp', __name__)

@prediction_bp.route('/future-performance/<int:student_id>', methods=['GET'])
def get_future_performance(student_id):
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
    
    # Predict future performance
    prediction = predict_future_performance(
        student, 
        performance, 
        attendance, 
        exams, 
        certifications,
        projects
    )
    
    return jsonify(prediction), 200

@prediction_bp.route('/improvements/<int:student_id>', methods=['GET'])
def get_improvement_recommendations(student_id):
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
    
    # Get recommendations for improvement
    recommendations = recommend_improvements(
        student, 
        performance, 
        attendance, 
        exams, 
        certifications,
        projects
    )
    
    return jsonify(recommendations), 200
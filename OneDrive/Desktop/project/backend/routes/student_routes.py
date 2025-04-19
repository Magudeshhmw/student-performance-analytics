from flask import Blueprint, request, jsonify
from models.database import db
from models.student import Student

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/', methods=['GET'])
def get_all_students():
    students = Student.query.all()
    return jsonify([student.to_dict() for student in students]), 200

@student_bp.route('/<int:id>', methods=['GET'])
def get_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    return jsonify(student.to_dict()), 200

@student_bp.route('/', methods=['POST'])
def create_student():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['student_id', 'first_name', 'last_name', 'email', 'department', 'year_of_study', 'semester']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if student_id or email already exists
    existing_student = Student.query.filter(
        (Student.student_id == data['student_id']) | 
        (Student.email == data['email'])
    ).first()
    
    if existing_student:
        return jsonify({"error": "Student ID or email already exists"}), 409
    
    new_student = Student(
        student_id=data['student_id'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        department=data['department'],
        year_of_study=data['year_of_study'],
        semester=data['semester']
    )
    
    db.session.add(new_student)
    db.session.commit()
    
    return jsonify(new_student.to_dict()), 201

@student_bp.route('/<int:id>', methods=['PUT'])
def update_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    data = request.get_json()
    
    # Check for email uniqueness if email is being updated
    if 'email' in data and data['email'] != student.email:
        existing_email = Student.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({"error": "Email already exists"}), 409
    
    # Check for student_id uniqueness if student_id is being updated
    if 'student_id' in data and data['student_id'] != student.student_id:
        existing_id = Student.query.filter_by(student_id=data['student_id']).first()
        if existing_id:
            return jsonify({"error": "Student ID already exists"}), 409
    
    # Update fields
    for key, value in data.items():
        if hasattr(student, key):
            setattr(student, key, value)
    
    db.session.commit()
    
    return jsonify(student.to_dict()), 200

@student_bp.route('/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({"message": "Student deleted successfully"}), 200
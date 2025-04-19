import pandas as pd
import numpy as np
import json
import os
import tempfile
from datetime import datetime
from models.database import db
from models.student import Student
from models.performance_metric import PerformanceMetric, AttendanceRecord, ExamResult
from models.certifications import Certification, Project

def process_student_csv(filepath):
    """Process student CSV file and import data into the database."""
    try:
        # Detect file format based on extension
        file_ext = os.path.splitext(filepath)[1].lower()
        
        if file_ext == '.csv':
            df = pd.read_csv(filepath)
        elif file_ext == '.xlsx':
            df = pd.read_excel(filepath)
        elif file_ext == '.json':
            with open(filepath, 'r') as file:
                data = json.load(file)
            df = pd.DataFrame(data)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Standardize column names (lowercase, remove spaces)
        df.columns = [col.lower().replace(' ', '_') for col in df.columns]
        
        # Check for required columns
        required_columns = ['student_id', 'first_name', 'last_name', 'email', 'department', 'year_of_study', 'semester']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
        
        # Import data into database
        students_added = 0
        students_skipped = 0
        errors = []
        
        for _, row in df.iterrows():
            try:
                # Check if student already exists
                existing_student = Student.query.filter(
                    (Student.student_id == row['student_id']) | 
                    (Student.email == row['email'])
                ).first()
                
                if existing_student:
                    students_skipped += 1
                    continue
                
                # Create new student
                new_student = Student(
                    student_id=row['student_id'],
                    first_name=row['first_name'],
                    last_name=row['last_name'],
                    email=row['email'],
                    department=row['department'],
                    year_of_study=int(row['year_of_study']),
                    semester=int(row['semester'])
                )
                
                db.session.add(new_student)
                students_added += 1
                
            except Exception as e:
                errors.append(f"Error processing row for student {row['student_id']}: {str(e)}")
        
        # Commit changes
        db.session.commit()
        
        return {
            "success": True,
            "students_added": students_added,
            "students_skipped": students_skipped,
            "errors": errors
        }
    
    except Exception as e:
        # Rollback in case of error
        db.session.rollback()
        raise Exception(f"File processing error: {str(e)}")

def process_attendance_csv(filepath):
    """Process attendance CSV file and import data into the database."""
    try:
        # Detect file format based on extension
        file_ext = os.path.splitext(filepath)[1].lower()
        
        if file_ext == '.csv':
            df = pd.read_csv(filepath)
        elif file_ext == '.xlsx':
            df = pd.read_excel(filepath)
        elif file_ext == '.json':
            with open(filepath, 'r') as file:
                data = json.load(file)
            df = pd.DataFrame(data)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Standardize column names (lowercase, remove spaces)
        df.columns = [col.lower().replace(' ', '_') for col in df.columns]
        
        # Check for required columns
        required_columns = ['student_id', 'subject', 'date', 'status']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
        
        # Import data into database
        records_added = 0
        records_skipped = 0
        errors = []
        
        for _, row in df.iterrows():
            try:
                # Find student by student_id
                student = Student.query.filter_by(student_id=row['student_id']).first()
                
                if not student:
                    errors.append(f"Student not found: {row['student_id']}")
                    continue
                
                # Parse date
                try:
                    if isinstance(row['date'], str):
                        attendance_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
                    else:
                        attendance_date = row['date']
                except ValueError:
                    errors.append(f"Invalid date format for student {row['student_id']}: {row['date']}")
                    continue
                
                # Validate status
                status = row['status'].lower()
                if status not in ['present', 'absent', 'excused']:
                    errors.append(f"Invalid status for student {row['student_id']}: {status}")
                    continue
                
                # Check if record already exists
                existing_record = AttendanceRecord.query.filter_by(
                    student_id=student.id,
                    subject=row['subject'],
                    date=attendance_date
                ).first()
                
                if existing_record:
                    records_skipped += 1
                    continue
                
                # Create new attendance record
                new_record = AttendanceRecord(
                    student_id=student.id,
                    subject=row['subject'],
                    date=attendance_date,
                    status=status
                )
                
                db.session.add(new_record)
                records_added += 1
                
            except Exception as e:
                errors.append(f"Error processing attendance for student {row['student_id']}: {str(e)}")
        
        # Commit changes
        db.session.commit()
        
        return {
            "success": True,
            "records_added": records_added,
            "records_skipped": records_skipped,
            "errors": errors
        }
    
    except Exception as e:
        # Rollback in case of error
        db.session.rollback()
        raise Exception(f"File processing error: {str(e)}")

def export_student_data(student_id, export_format='json'):
    """Export student data to the specified format."""
    try:
        # Handle single student or multiple students
        single_student = not isinstance(student_id, list)
        
        if single_student:
            student_ids = [student_id]
        else:
            student_ids = student_id
        
        # Get student data
        students_data = []
        for id in student_ids:
            student = Student.query.get(id)
            if not student:
                if single_student:
                    raise ValueError(f"Student not found: {id}")
                else:
                    continue
            
            # Get all performance data for the student
            performance = PerformanceMetric.query.filter_by(student_id=id).all()
            attendance = AttendanceRecord.query.filter_by(student_id=id).all()
            exams = ExamResult.query.filter_by(student_id=id).all()
            certifications = Certification.query.filter_by(student_id=id).all()
            projects = Project.query.filter_by(student_id=id).all()
            
            student_data = {
                "student": student.to_dict(),
                "performance_metrics": [p.to_dict() for p in performance],
                "attendance": [a.to_dict() for a in attendance],
                "exams": [e.to_dict() for e in exams],
                "certifications": [c.to_dict() for c in certifications],
                "projects": [p.to_dict() for p in projects]
            }
            
            students_data.append(student_data)
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        
        if export_format == 'json':
            # Export as JSON
            if single_student:
                data_to_export = students_data[0]
            else:
                data_to_export = students_data
            
            with open(temp_file.name, 'w') as file:
                json.dump(data_to_export, file, indent=2, default=str)
        
        elif export_format == 'csv':
            # Export as CSV
            # For CSV, we need to flatten nested structures
            flattened_data = []
            
            for student_data in students_data:
                student = student_data["student"]
                base_data = {
                    "student_id": student["student_id"],
                    "first_name": student["first_name"],
                    "last_name": student["last_name"],
                    "email": student["email"],
                    "department": student["department"],
                    "year_of_study": student["year_of_study"],
                    "semester": student["semester"]
                }
                
                # Add attendance data
                for attendance in student_data["attendance"]:
                    row = base_data.copy()
                    row.update({
                        "record_type": "attendance",
                        "subject": attendance["subject"],
                        "date": attendance["date"],
                        "status": attendance["status"]
                    })
                    flattened_data.append(row)
                
                # Add exam data
                for exam in student_data["exams"]:
                    row = base_data.copy()
                    row.update({
                        "record_type": "exam",
                        "subject": exam["subject"],
                        "exam_type": exam["exam_type"],
                        "score": exam["score"],
                        "max_score": exam["max_score"],
                        "date": exam["date"]
                    })
                    flattened_data.append(row)
                
                # Add certification data
                for cert in student_data["certifications"]:
                    row = base_data.copy()
                    row.update({
                        "record_type": "certification",
                        "name": cert["name"],
                        "issuing_organization": cert["issuing_organization"],
                        "issue_date": cert["issue_date"],
                        "expiry_date": cert["expiry_date"],
                        "credential_id": cert["credential_id"]
                    })
                    flattened_data.append(row)
                
                # Add project data
                for project in student_data["projects"]:
                    row = base_data.copy()
                    row.update({
                        "record_type": "project",
                        "title": project["title"],
                        "subject": project["subject"],
                        "start_date": project["start_date"],
                        "end_date": project["end_date"],
                        "grade": project["grade"],
                        "max_grade": project["max_grade"]
                    })
                    flattened_data.append(row)
            
            # Create DataFrame and export to CSV
            df = pd.DataFrame(flattened_data)
            df.to_csv(temp_file.name, index=False)
        
        elif export_format == 'xlsx':
            # Export as Excel
            with pd.ExcelWriter(temp_file.name, engine='openpyxl') as writer:
                for i, student_data in enumerate(students_data):
                    student = student_data["student"]
                    
                    # Create student sheet
                    student_df = pd.DataFrame([student])
                    sheet_name = f"Student_{i+1}" if len(students_data) > 1 else "Student"
                    student_df.to_excel(writer, sheet_name=sheet_name, index=False)
                    
                    # Create attendance sheet
                    if student_data["attendance"]:
                        attendance_df = pd.DataFrame(student_data["attendance"])
                        sheet_name = f"Attendance_{i+1}" if len(students_data) > 1 else "Attendance"
                        attendance_df.to_excel(writer, sheet_name=sheet_name, index=False)
                    
                    # Create exams sheet
                    if student_data["exams"]:
                        exams_df = pd.DataFrame(student_data["exams"])
                        sheet_name = f"Exams_{i+1}" if len(students_data) > 1 else "Exams"
                        exams_df.to_excel(writer, sheet_name=sheet_name, index=False)
                    
                    # Create certifications sheet
                    if student_data["certifications"]:
                        cert_df = pd.DataFrame(student_data["certifications"])
                        sheet_name = f"Certifications_{i+1}" if len(students_data) > 1 else "Certifications"
                        cert_df.to_excel(writer, sheet_name=sheet_name, index=False)
                    
                    # Create projects sheet
                    if student_data["projects"]:
                        projects_df = pd.DataFrame(student_data["projects"])
                        sheet_name = f"Projects_{i+1}" if len(students_data) > 1 else "Projects"
                        projects_df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        else:
            raise ValueError(f"Unsupported export format: {export_format}")
        
        return temp_file.name
    
    except Exception as e:
        raise Exception(f"Export error: {str(e)}")
from sqlalchemy import func
import numpy as np
from models.database import db
from models.performance_metric import AttendanceRecord, ExamResult

def calculate_overall_performance(student_id, performance_metrics, attendance_records, exam_results, certifications, projects):
    """Calculate the overall performance score for a student based on multiple metrics."""
    
    # Initialize weights for different metrics
    weights = {
        "attendance": 0.15,
        "exams": 0.40,
        "projects": 0.20,
        "certifications": 0.10,
        "other_metrics": 0.15  # Presentations, symposiums, etc.
    }
    
    # Calculate attendance score
    attendance_score = calculate_attendance_score(attendance_records)
    
    # Calculate exam score
    exam_score = calculate_exam_score(exam_results)
    
    # Calculate project score
    project_score = calculate_project_score(projects)
    
    # Calculate certification score
    certification_score = calculate_certification_score(certifications)
    
    # Calculate other metrics score
    other_metrics_score = calculate_other_metrics_score(performance_metrics)
    
    # Calculate weighted overall score
    overall_score = (
        weights["attendance"] * attendance_score +
        weights["exams"] * exam_score +
        weights["projects"] * project_score +
        weights["certifications"] * certification_score +
        weights["other_metrics"] * other_metrics_score
    )
    
    # Identify strengths and weaknesses
    metrics = {
        "Attendance": attendance_score,
        "Exams": exam_score,
        "Projects": project_score,
        "Certifications": certification_score,
        "Other Activities": other_metrics_score
    }
    
    strengths = [k for k, v in metrics.items() if v >= 85]
    weaknesses = [k for k, v in metrics.items() if v < 70]
    
    return {
        "overall_score": round(overall_score, 2),
        "metrics": {
            "attendance": round(attendance_score, 2),
            "exams": round(exam_score, 2),
            "projects": round(project_score, 2),
            "certifications": round(certification_score, 2),
            "other_metrics": round(other_metrics_score, 2)
        },
        "strengths": strengths,
        "improvement_areas": weaknesses,
        "percentile": calculate_percentile(overall_score)
    }

def calculate_attendance_score(attendance_records):
    """Calculate attendance score based on presence percentage."""
    if not attendance_records:
        return 0
    
    total_records = len(attendance_records)
    present_count = sum(1 for record in attendance_records if record.status == 'present')
    
    if total_records == 0:
        return 0
    
    return (present_count / total_records) * 100

def calculate_exam_score(exam_results):
    """Calculate normalized exam score."""
    if not exam_results:
        return 0
    
    total_percentage = 0
    for exam in exam_results:
        percentage = (exam.score / exam.max_score) * 100
        total_percentage += percentage
    
    return total_percentage / len(exam_results) if exam_results else 0

def calculate_project_score(projects):
    """Calculate project performance score."""
    if not projects:
        return 0
    
    total_percentage = 0
    projects_with_grade = 0
    
    for project in projects:
        if project.grade is not None and project.max_grade is not None:
            percentage = (project.grade / project.max_grade) * 100
            total_percentage += percentage
            projects_with_grade += 1
    
    return total_percentage / projects_with_grade if projects_with_grade > 0 else 0

def calculate_certification_score(certifications):
    """Calculate certification score based on number and relevance."""
    if not certifications:
        return 0
    
    # Base score for having certifications
    base_score = min(len(certifications) * 20, 100)
    
    return base_score

def calculate_other_metrics_score(performance_metrics):
    """Calculate score for other performance metrics."""
    if not performance_metrics:
        return 0
    
    # Filter out metrics that are specifically for presentations, symposiums, etc.
    other_metrics = [m for m in performance_metrics 
                    if m.metric_type in ['presentation', 'symposium', 'internship']]
    
    if not other_metrics:
        return 0
    
    total_percentage = 0
    for metric in other_metrics:
        percentage = (metric.score / metric.max_score) * 100
        total_percentage += percentage
    
    return total_percentage / len(other_metrics) if other_metrics else 0

def calculate_percentile(score):
    """Calculate the approximate percentile of the score."""
    # This is a simplified calculation
    # In a real system, you would compare against all other students
    if score >= 90:
        return "90-100 (Top 10%)"
    elif score >= 80:
        return "80-90 (Top 20%)"
    elif score >= 70:
        return "70-80 (Top 30%)"
    elif score >= 60:
        return "60-70 (Top 40%)"
    else:
        return "Below 60"

def analyze_attendance(attendance_records):
    """Analyze attendance patterns."""
    if not attendance_records:
        return {
            "total_classes": 0,
            "present_count": 0,
            "absent_count": 0,
            "excused_count": 0,
            "attendance_percentage": 0,
            "subjects": {}
        }
    
    total_classes = len(attendance_records)
    present_count = sum(1 for record in attendance_records if record.status == 'present')
    absent_count = sum(1 for record in attendance_records if record.status == 'absent')
    excused_count = sum(1 for record in attendance_records if record.status == 'excused')
    
    # Analyze by subject
    subjects = {}
    for record in attendance_records:
        if record.subject not in subjects:
            subjects[record.subject] = {
                "total": 0,
                "present": 0,
                "absent": 0,
                "excused": 0
            }
        
        subjects[record.subject]["total"] += 1
        if record.status == 'present':
            subjects[record.subject]["present"] += 1
        elif record.status == 'absent':
            subjects[record.subject]["absent"] += 1
        elif record.status == 'excused':
            subjects[record.subject]["excused"] += 1
    
    # Calculate percentages for each subject
    for subject, data in subjects.items():
        if data["total"] > 0:
            data["attendance_percentage"] = (data["present"] / data["total"]) * 100
    
    return {
        "total_classes": total_classes,
        "present_count": present_count,
        "absent_count": absent_count,
        "excused_count": excused_count,
        "attendance_percentage": (present_count / total_classes) * 100 if total_classes > 0 else 0,
        "subjects": subjects
    }

def analyze_exam_performance(exam_results):
    """Analyze exam performance patterns."""
    if not exam_results:
        return {
            "total_exams": 0,
            "average_score": 0,
            "highest_score": 0,
            "lowest_score": 0,
            "subjects": {}
        }
    
    total_exams = len(exam_results)
    
    # Calculate normalized scores
    normalized_scores = [(exam.score / exam.max_score) * 100 for exam in exam_results]
    
    avg_score = sum(normalized_scores) / len(normalized_scores) if normalized_scores else 0
    highest_score = max(normalized_scores) if normalized_scores else 0
    lowest_score = min(normalized_scores) if normalized_scores else 0
    
    # Analyze by subject
    subjects = {}
    for exam in exam_results:
        if exam.subject not in subjects:
            subjects[exam.subject] = {
                "total_exams": 0,
                "scores": []
            }
        
        subjects[exam.subject]["total_exams"] += 1
        subjects[exam.subject]["scores"].append((exam.score / exam.max_score) * 100)
    
    # Calculate statistics for each subject
    for subject, data in subjects.items():
        if data["scores"]:
            data["average_score"] = sum(data["scores"]) / len(data["scores"])
            data["highest_score"] = max(data["scores"])
            data["lowest_score"] = min(data["scores"])
            data.pop("scores")  # Remove raw scores from the response
    
    return {
        "total_exams": total_exams,
        "average_score": avg_score,
        "highest_score": highest_score,
        "lowest_score": lowest_score,
        "subjects": subjects
    }
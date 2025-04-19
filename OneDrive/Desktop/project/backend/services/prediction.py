import numpy as np
from datetime import datetime, timedelta

def predict_future_performance(student, performance_metrics, attendance_records, exam_results, certifications, projects):
    """Predict the future performance of a student based on historical data."""
    
    # Extract data for trend analysis
    attendance_trend = analyze_attendance_trend(attendance_records)
    exam_trend = analyze_exam_trend(exam_results)
    project_trend = analyze_project_trend(projects)
    
    # Calculate trend indicators
    trends = {
        "attendance": attendance_trend["trend"],
        "exams": exam_trend["trend"],
        "projects": project_trend["trend"]
    }
    
    # Calculate current performance metrics
    current_attendance = calculate_current_attendance(attendance_records)
    current_exam_score = calculate_current_exam_score(exam_results)
    current_project_score = calculate_current_project_score(projects)
    
    # Predict future metrics based on trends
    future_attendance = predict_metric(current_attendance, trends["attendance"])
    future_exam_score = predict_metric(current_exam_score, trends["exams"])
    future_project_score = predict_metric(current_project_score, trends["projects"])
    
    # Calculate predicted overall score with weighted average
    weights = {
        "attendance": 0.15,
        "exams": 0.40,
        "projects": 0.20,
        "certifications": 0.10,
        "other_metrics": 0.15
    }
    
    certification_score = min(len(certifications) * 20, 100)
    other_metrics_score = 70  # Default value as prediction
    
    predicted_overall = (
        weights["attendance"] * future_attendance +
        weights["exams"] * future_exam_score +
        weights["projects"] * future_project_score +
        weights["certifications"] * certification_score +
        weights["other_metrics"] * other_metrics_score
    )
    
    # Determine outlook based on trends
    if all(trend >= 0 for trend in trends.values()):
        outlook = "Positive"
    elif all(trend <= 0 for trend in trends.values()):
        outlook = "Negative"
    else:
        outlook = "Mixed"
    
    return {
        "predicted_overall_score": round(predicted_overall, 2),
        "predicted_metrics": {
            "attendance": round(future_attendance, 2),
            "exams": round(future_exam_score, 2),
            "projects": round(future_project_score, 2)
        },
        "trends": {
            "attendance": attendance_trend,
            "exams": exam_trend,
            "projects": project_trend
        },
        "outlook": outlook,
        "prediction_confidence": calculate_prediction_confidence(
            len(attendance_records), 
            len(exam_results), 
            len(projects)
        )
    }

def analyze_attendance_trend(attendance_records):
    """Analyze the trend in attendance over time."""
    if not attendance_records or len(attendance_records) < 2:
        return {"trend": 0, "description": "Insufficient data"}
    
    # Sort records by date
    sorted_records = sorted(attendance_records, key=lambda x: x.date)
    
    # Group by month
    monthly_attendance = {}
    for record in sorted_records:
        month_key = f"{record.date.year}-{record.date.month}"
        if month_key not in monthly_attendance:
            monthly_attendance[month_key] = {"total": 0, "present": 0}
        
        monthly_attendance[month_key]["total"] += 1
        if record.status == 'present':
            monthly_attendance[month_key]["present"] += 1
    
    # Calculate monthly percentages
    monthly_percentages = []
    for month, data in monthly_attendance.items():
        if data["total"] > 0:
            percentage = (data["present"] / data["total"]) * 100
            monthly_percentages.append(percentage)
    
    # Calculate trend
    if len(monthly_percentages) < 2:
        return {"trend": 0, "description": "Insufficient data"}
    
    # Simple linear trend
    trend = monthly_percentages[-1] - monthly_percentages[0]
    normalized_trend = trend / len(monthly_percentages)
    
    # Determine trend description
    if normalized_trend > 2:
        description = "Strongly improving"
    elif normalized_trend > 0:
        description = "Slightly improving"
    elif normalized_trend == 0:
        description = "Stable"
    elif normalized_trend > -2:
        description = "Slightly declining"
    else:
        description = "Strongly declining"
    
    return {
        "trend": normalized_trend,
        "description": description,
        "data_points": len(monthly_percentages)
    }

def analyze_exam_trend(exam_results):
    """Analyze the trend in exam performance over time."""
    if not exam_results or len(exam_results) < 2:
        return {"trend": 0, "description": "Insufficient data"}
    
    # Sort exams by date
    sorted_exams = sorted(exam_results, key=lambda x: x.date)
    
    # Calculate normalized scores
    normalized_scores = [(exam.score / exam.max_score) * 100 for exam in sorted_exams]
    
    # Calculate trend
    if len(normalized_scores) < 2:
        return {"trend": 0, "description": "Insufficient data"}
    
    # Simple linear trend (can be replaced with more sophisticated models)
    trend = normalized_scores[-1] - normalized_scores[0]
    normalized_trend = trend / len(normalized_scores)
    
    # Determine trend description
    if normalized_trend > 5:
        description = "Strongly improving"
    elif normalized_trend > 0:
        description = "Slightly improving"
    elif normalized_trend == 0:
        description = "Stable"
    elif normalized_trend > -5:
        description = "Slightly declining"
    else:
        description = "Strongly declining"
    
    return {
        "trend": normalized_trend,
        "description": description,
        "data_points": len(normalized_scores)
    }

def analyze_project_trend(projects):
    """Analyze the trend in project performance over time."""
    if not projects or len(projects) < 2:
        return {"trend": 0, "description": "Insufficient data"}
    
    # Filter projects with grades
    graded_projects = [p for p in projects if p.grade is not None and p.max_grade is not None]
    
    if len(graded_projects) < 2:
        return {"trend": 0, "description": "Insufficient data"}
    
    # Sort projects by end date or start date if end date is not available
    sorted_projects = sorted(graded_projects, key=lambda x: x.end_date if x.end_date else x.start_date)
    
    # Calculate normalized scores
    normalized_scores = [(project.grade / project.max_grade) * 100 for project in sorted_projects]
    
    # Calculate trend
    trend = normalized_scores[-1] - normalized_scores[0]
    normalized_trend = trend / len(normalized_scores)
    
    # Determine trend description
    if normalized_trend > 5:
        description = "Strongly improving"
    elif normalized_trend > 0:
        description = "Slightly improving"
    elif normalized_trend == 0:
        description = "Stable"
    elif normalized_trend > -5:
        description = "Slightly declining"
    else:
        description = "Strongly declining"
    
    return {
        "trend": normalized_trend,
        "description": description,
        "data_points": len(normalized_scores)
    }

def calculate_current_attendance(attendance_records):
    """Calculate current attendance score."""
    if not attendance_records:
        return 0
    
    # Get recent records (last 3 months)
    current_date = datetime.now().date()
    three_months_ago = current_date - timedelta(days=90)
    
    recent_records = [r for r in attendance_records if r.date >= three_months_ago]
    
    if not recent_records:
        recent_records = attendance_records  # Use all records if no recent ones
    
    total_records = len(recent_records)
    present_count = sum(1 for record in recent_records if record.status == 'present')
    
    return (present_count / total_records) * 100 if total_records > 0 else 0

def calculate_current_exam_score(exam_results):
    """Calculate current exam score based on recent exams."""
    if not exam_results:
        return 0
    
    # Get recent exams (last 6 months)
    current_date = datetime.now().date()
    six_months_ago = current_date - timedelta(days=180)
    
    recent_exams = [e for e in exam_results if e.date >= six_months_ago]
    
    if not recent_exams:
        recent_exams = exam_results  # Use all exams if no recent ones
    
    normalized_scores = [(exam.score / exam.max_score) * 100 for exam in recent_exams]
    
    return sum(normalized_scores) / len(normalized_scores) if normalized_scores else 0

def calculate_current_project_score(projects):
    """Calculate current project score based on recent projects."""
    if not projects:
        return 0
    
    # Filter projects with grades
    graded_projects = [p for p in projects if p.grade is not None and p.max_grade is not None]
    
    if not graded_projects:
        return 0
    
    # Get recent projects (last year)
    current_date = datetime.now().date()
    one_year_ago = current_date - timedelta(days=365)
    
    recent_projects = [p for p in graded_projects 
                      if (p.end_date and p.end_date >= one_year_ago) or 
                         (not p.end_date and p.start_date >= one_year_ago)]
    
    if not recent_projects:
        recent_projects = graded_projects  # Use all projects if no recent ones
    
    normalized_scores = [(project.grade / project.max_grade) * 100 for project in recent_projects]
    
    return sum(normalized_scores) / len(normalized_scores) if normalized_scores else 0

def predict_metric(current_value, trend):
    """Predict future value based on current value and trend."""
    # Simple linear prediction
    # In a more sophisticated model, this could be a regression or time series prediction
    future_value = current_value + (trend * 2)  # Projecting trend forward
    
    # Ensure the value is within valid range (0-100)
    future_value = max(0, min(100, future_value))
    
    return future_value

def calculate_prediction_confidence(num_attendance, num_exams, num_projects):
    """Calculate confidence level of prediction based on amount of data."""
    # Minimum thresholds for good confidence
    min_attendance = 10
    min_exams = 3
    min_projects = 2
    
    # Calculate confidence for each metric
    attendance_confidence = min(num_attendance / min_attendance, 1.0)
    exam_confidence = min(num_exams / min_exams, 1.0)
    project_confidence = min(num_projects / min_projects, 1.0)
    
    # Overall confidence is weighted average
    overall_confidence = (0.4 * attendance_confidence + 
                          0.4 * exam_confidence + 
                          0.2 * project_confidence)
    
    # Convert to percentage
    confidence_percentage = overall_confidence * 100
    
    # Confidence level
    if confidence_percentage >= 80:
        level = "High"
    elif confidence_percentage >= 50:
        level = "Medium"
    else:
        level = "Low"
    
    return {
        "percentage": round(confidence_percentage, 2),
        "level": level
    }

def recommend_improvements(student, performance_metrics, attendance_records, exam_results, certifications, projects):
    """Generate recommendations for student improvement."""
    
    recommendations = []
    
    # Analyze attendance
    attendance_percentage = calculate_current_attendance(attendance_records)
    if attendance_percentage < 85:
        recommendations.append({
            "area": "Attendance",
            "current_score": attendance_percentage,
            "target_score": 90,
            "recommendation": "Improve class attendance to at least 90%",
            "details": "Regular attendance is strongly correlated with better academic performance.",
            "priority": "High" if attendance_percentage < 75 else "Medium"
        })
    
    # Analyze exam performance
    exam_score = calculate_current_exam_score(exam_results)
    if exam_score < 80:
        recommendations.append({
            "area": "Exam Performance",
            "current_score": exam_score,
            "target_score": 80,
            "recommendation": "Focus on improving exam scores",
            "details": "Consider forming study groups or seeking additional help from instructors.",
            "priority": "High" if exam_score < 70 else "Medium"
        })
    
    # Analyze subjects for improvement
    if exam_results:
        subject_scores = {}
        for exam in exam_results:
            if exam.subject not in subject_scores:
                subject_scores[exam.subject] = []
            
            normalized_score = (exam.score / exam.max_score) * 100
            subject_scores[exam.subject].append(normalized_score)
        
        # Calculate average score for each subject
        avg_subject_scores = {subject: sum(scores) / len(scores) 
                             for subject, scores in subject_scores.items()}
        
        # Find lowest performing subjects
        low_subjects = [subject for subject, score in avg_subject_scores.items() 
                       if score < 75]
        
        if low_subjects:
            subject_names = ", ".join(low_subjects[:3])  # List up to 3 subjects
            recommendations.append({
                "area": "Subject Focus",
                "current_score": None,
                "target_score": None,
                "recommendation": f"Focus on improving performance in: {subject_names}",
                "details": "These subjects show the lowest average scores. Consider additional study time or tutoring.",
                "priority": "High"
            })
    
    # Analyze certifications
    if len(certifications) < 2:
        recommendations.append({
            "area": "Professional Development",
            "current_score": None,
            "target_score": None,
            "recommendation": "Pursue additional relevant certifications",
            "details": "Industry certifications can enhance your profile and job prospects.",
            "priority": "Medium"
        })
    
    # Analyze project involvement
    if len(projects) < 3:
        recommendations.append({
            "area": "Project Experience",
            "current_score": None,
            "target_score": None,
            "recommendation": "Participate in more projects",
            "details": "Practical project experience is valuable for skill development and resume building.",
            "priority": "Medium"
        })
    
    # Check project performance
    project_score = calculate_current_project_score(projects)
    if project_score < 80:
        recommendations.append({
            "area": "Project Quality",
            "current_score": project_score,
            "target_score": 85,
            "recommendation": "Focus on improving project quality",
            "details": "High-quality projects demonstrate your skills and technical abilities.",
            "priority": "Medium"
        })
    
    # Add general recommendations if few specific ones were found
    if len(recommendations) < 3:
        general_recommendations = [
            {
                "area": "Time Management",
                "current_score": None,
                "target_score": None,
                "recommendation": "Improve time management skills",
                "details": "Effective time management can help balance academic responsibilities and extracurricular activities.",
                "priority": "Medium"
            },
            {
                "area": "Networking",
                "current_score": None,
                "target_score": None,
                "recommendation": "Build professional network",
                "details": "Connect with industry professionals and join relevant communities.",
                "priority": "Low"
            },
            {
                "area": "Soft Skills",
                "current_score": None,
                "target_score": None,
                "recommendation": "Develop communication and presentation skills",
                "details": "Soft skills are highly valued by employers alongside technical knowledge.",
                "priority": "Medium"
            }
        ]
        
        # Add general recommendations until we have at least 3
        for rec in general_recommendations:
            if len(recommendations) >= 3:
                break
            recommendations.append(rec)
    
    # Sort recommendations by priority
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    recommendations.sort(key=lambda x: priority_order[x["priority"]])
    
    return {
        "recommendations": recommendations,
        "total_recommendations": len(recommendations)
    }
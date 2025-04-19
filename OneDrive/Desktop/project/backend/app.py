from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from models.database import db, init_db
from routes.student_routes import student_bp
from routes.performance_routes import performance_bp
from routes.analytics_routes import analytics_bp
from routes.prediction_routes import prediction_bp
from routes.file_routes import file_bp

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///student_analytics.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(student_bp, url_prefix='/api/students')
app.register_blueprint(performance_bp, url_prefix='/api/performance')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(prediction_bp, url_prefix='/api/prediction')
app.register_blueprint(file_bp, url_prefix='/api/files')

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "message": "Student Performance Analytics API is running"})

if __name__ == '__main__':
    # Create all tables in the database if they don't exist
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
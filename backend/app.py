import os
import logging
from flask import Flask, jsonify, request
from config import config
from extensions import db, jwt, bcrypt, cors, migrate

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['default']))

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={
        r'/api/*': {
            'origins': [
                app.config['FRONTEND_URL'],
                'http://localhost:5173',
                'http://localhost:5000',
            ],
            'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allow_headers': ['Content-Type', 'Authorization'],
            'supports_credentials': True,
        }
    })

    # Register blueprints
    from routes import auth_bp, services_bp, requests_bp, upload_bp, bookings_bp, admin_bp, contact_bp, updates_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(requests_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(updates_bp)



    @app.before_request
    def log_request_info():
        if request.path.startswith('/api/') and request.method != 'OPTIONS':
            auth_header = request.headers.get('Authorization', 'MISSING')
            if auth_header != 'MISSING' and len(auth_header) > 40:
                auth_header = auth_header[:40] + '...'
            logger.debug(
                f'[REQUEST] {request.method} {request.path} | '
                f'Authorization: {auth_header}'
            )

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'success': False, 'message': 'Token has expired', 'error': 'token_expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'success': False, 'message': 'Invalid token', 'error': 'invalid_token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'success': False, 'message': 'Authorization token required', 'error': 'missing_token'}), 401

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'success': False, 'message': 'Method not allowed'}), 405

    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({'success': False, 'message': 'File too large. Maximum size is 10MB'}), 413

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    # Health check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'success': True, 'message': 'Server is running', 'env': config_name})

    return app


def seed_database(app):
    """Seed the database with initial data."""
    from models import User, Service

    with app.app_context():
        admin_email = app.config['ADMIN_EMAIL']
        if not User.query.filter_by(email=admin_email).first():
            admin = User(
                full_name='Admin',
                email=admin_email,
                role='admin',
                is_active=True
            )
            admin.set_password(app.config['ADMIN_PASSWORD'])
            db.session.add(admin)
            print(f'✅ Admin user created: {admin_email}')

        default_services = [
            {
                'name': 'Document Printing',
                'slug': 'document-printing',
                'description': 'Print documents in black & white or color. High quality laser printing.',
                'price': 2.0,
                'price_unit': 'per page',
                'category': 'printing',
                'icon': 'printer',
                'requires_upload': True,
                'turnaround_time': '15-30 minutes',
            },
            {
                'name': 'Color Printing',
                'slug': 'color-printing',
                'description': 'Vibrant color prints for photos, posters, and presentations.',
                'price': 10.0,
                'price_unit': 'per page',
                'category': 'printing',
                'icon': 'photo',
                'requires_upload': True,
                'turnaround_time': '15-30 minutes',
            },
            {
                'name': 'Document Scanning',
                'slug': 'document-scanning',
                'description': 'Scan documents to PDF, JPG, or PNG. High resolution up to 600 DPI.',
                'price': 5.0,
                'price_unit': 'per page',
                'category': 'scanning',
                'icon': 'scan',
                'requires_upload': False,
                'turnaround_time': '10-15 minutes',
            },
            {
                'name': 'Form Filling',
                'slug': 'form-filling',
                'description': 'Assistance with government forms, applications, and official documents.',
                'price': 50.0,
                'price_unit': 'per form',
                'category': 'assistance',
                'icon': 'form',
                'requires_upload': True,
                'turnaround_time': '30-60 minutes',
            },
            {
                'name': 'Photocopy',
                'slug': 'photocopy',
                'description': 'Quick photocopies of documents, IDs, certificates, and more.',
                'price': 1.0,
                'price_unit': 'per page',
                'category': 'printing',
                'icon': 'copy',
                'requires_upload': False,
                'turnaround_time': '5-10 minutes',
            },
            {
                'name': 'Passport Photo',
                'slug': 'passport-photo',
                'description': 'Professional passport and ID photos printed in standard sizes.',
                'price': 40.0,
                'price_unit': 'per set (4 photos)',
                'category': 'photo',
                'icon': 'camera',
                'requires_upload': False,
                'turnaround_time': '10-15 minutes',
            },
            {
                'name': 'Lamination',
                'slug': 'lamination',
                'description': 'Protect your documents with professional lamination service.',
                'price': 15.0,
                'price_unit': 'per page',
                'category': 'other',
                'icon': 'shield',
                'requires_upload': False,
                'turnaround_time': '10-15 minutes',
            },
            {
                'name': 'Online Application Help',
                'slug': 'online-application',
                'description': 'Get help with online applications, portals, and submissions.',
                'price': 100.0,
                'price_unit': 'per session',
                'category': 'assistance',
                'icon': 'globe',
                'requires_upload': True,
                'turnaround_time': '1-2 hours',
            },
        ]

        for svc_data in default_services:
            if not Service.query.filter_by(slug=svc_data['slug']).first():
                service = Service(**svc_data)
                db.session.add(service)

        db.session.commit()
        print('✅ Default services seeded')


        # Seed sample updates
    from models import Update
    with app.app_context():
        if Update.query.count() == 0:
            sample_updates = [
                {
                    'title': 'SSC CGL 2024 Notification Released', 
                    'description': 'Staff Selection Commission has released the official notification for CGL 2024. Last date to apply is 31st Jan 2025. Visit our center for form filling assistance.', 
                    'category': 'Govt Forms', 
                    'is_important': True,  
                    'is_pinned': True,  
                    'link': 'https://ssc.nic.in'
                },
                {
                    'title': 'UPSC Civil Services 2025 Exam Schedule', 
                    'description': 'UPSC has announced the Civil Services Preliminary Examination 2025 schedule. Prelims on 25th May 2025. Admit cards available 3 weeks before exam.', 
                    'category': 'Admit Cards', 
                    'is_important': True,  
                    'is_pinned': False, 
                    'link': 'https://upsc.gov.in'
                },
                {
                    'title': 'Railway Recruitment Board — 8000+ Vacancies', 
                    'description': 'RRB has announced Group D vacancies across zones. Eligible candidates with 10th pass can apply. We provide complete form-filling support.', 
                    'category': 'Jobs', 
                    'is_important': False, 
                    'is_pinned': False, 
                    'link': None
                },
                {
                    'title': 'CBSE Class 10 & 12 Results 2024 Declared', 
                    'description': 'CBSE board results for Class 10 and 12 are now available on cbseresults.nic.in. Visit us for printed marksheet and certificate copies.', 
                    'category': 'Results', 
                    'is_important': False, 
                    'is_pinned': False, 
                    'link': 'https://cbseresults.nic.in'
                },
                {
                    'title': 'New Service: Aadhaar Update Assistance', 
                    'description': 'We now offer complete Aadhaar card update assistance — name, address, DOB, and mobile number update. Book your slot online or walk in.', 
                    'category': 'Services', 
                    'is_important': False, 
                    'is_pinned': False, 
                    'link': None
                },
                {
                    'title': '🎉 Special Offer: 20% Off All Printing This Week', 
                    'description': 'Get 20% discount on all black & white and color printing services this week. Offer valid Monday to Saturday. Show this notification at counter.', 
                    'category': 'Impt Notice', 
                    'is_important': True,  
                    'is_pinned': False, 
                    'link': None
                },
            ]
            for item in sample_updates:
                db.session.add(Update(**item))
            db.session.commit()
            print('✅ Sample updates seeded')
 


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_database(app)
    app.run(debug=True, host='0.0.0.0', port=5000)

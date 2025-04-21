from flask import Flask, render_template, redirect, url_for, request, flash, session as Flask_session, send_file, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy.orm import session
from sqlalchemy.sql import func 
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Risk
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
from datetime import datetime
from collections import defaultdict
import csv


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = '9884640133'

db.init_app(app)
migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.login_view = 'login'  
login_manager.init_app(app)

@app.route('/')
def home():
    return render_template('index.html')

@login_manager.user_loader
def load_user(user_id):
    with db.session() as session:  # Use an explicit session
        return session.get(User, int(user_id))

@app.route('/signup', methods = ['GET','POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists','Danger')
            return redirect(url_for('signup'))
    
        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully!','Success')
        return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/login', methods = ['GET','POST'])
def login():
    Flask_session.pop('_flashes',None)
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username = username).first()
        if user and user.check_password(password):
            login_user(user)
            flash('Logged in successfully', 'success')
            if user.is_admin:
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('dashboard'))
        
        flash('Invalid credentials','retry')

    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    risks = Risk.query.filter_by(owner_id=current_user.id).all()
    risk_levels = {'low': 0, 'medium': 0, 'high': 0}
    for risk in risks:
        level = risk.risk_level
        if level in risk_levels:
            risk_levels[level] += 1
    return render_template('dashboard.html', risks=risks, risk_levels=risk_levels)

@app.route('/admin_dashboard')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        flash("Access denied: Admins only.", "danger")
        return redirect(url_for("dashboard"))

    all_risks = Risk.query.all()

    # Convert to JSON-safe structure
    risk_data = []
    for risk in all_risks:
        risk_data.append({
            "title": risk.title,
            "description": risk.description,
            "impact": risk.impact,
            "likelihood": risk.likelihood,
            "risk_score": risk.risk_score,
            "risk_level": risk.risk_level,
            "owner_id": risk.owner_id,
        })

    # Risk over time analysis
    risks_over_time = defaultdict(int)
    for risk in all_risks:
        if risk.created_at:
            date_str = risk.created_at.strftime("%Y-%m-%d")
            risks_over_time[date_str] += 1

    risks_over_time = dict(sorted(risks_over_time.items()))

    return render_template(
    "admin_dashboard.html",
    risks=all_risks,
    risk_data=risk_data,
    risks_over_time_labels=list(risks_over_time.keys()),
    risks_over_time_data=list(risks_over_time.values())
)


@app.route('/add_risk', methods = ['GET','POST'])
@login_required
def add_risk():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        impact = int(request.form['impact'])
        likelihood = int(request.form['likelihood'])

        new_risk = Risk(title=title, description=description, impact=impact, likelihood=likelihood, owner_id = current_user.id)
        db.session.add(new_risk)
        db.session.commit()

        flash('Risk added successfully','success')
        return redirect(url_for('dashboard'))
    
    return render_template('add_risk.html')

@app.route('/generate_report')
def generate_report():
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize = letter)
    pdf.setTitle('Compliance_risk_report')

    pdf.setFont("Helvetica-Bold",16)
    pdf.drawString(200,750, "Compliance Risk Report")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(200, 730, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 700, "Risk Title")
    pdf.drawString(250, 700, "Impact")
    pdf.drawString(350, 700, "Likelihood")
    pdf.drawString(450, 700, "Score")

    risks = Risk.query.all()
    y_position = 680  # Start position for rows

    pdf.setFont("Helvetica", 10)
    for risk in risks:
        pdf.drawString(50, y_position, risk.title)
        pdf.drawString(250, y_position, str(risk.impact))
        pdf.drawString(350, y_position, str(risk.likelihood))
        pdf.drawString(450, y_position, str(risk.impact * risk.likelihood))
        y_position -= 20  # Move to next row

    pdf.save()
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name="compliance_report.pdf", mimetype='application/pdf')

@app.route('/generate_report_filtered', methods=['POST'])
@login_required
def generate_report_filtered():
    data = request.get_json()
    risks = data.get('risks', [])

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setTitle("Filtered_Compliance_Report")

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(150, 750, "Filtered Compliance Report")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, 730, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 700, "Title")
    pdf.drawString(200, 700, "Impact")
    pdf.drawString(270, 700, "Likelihood")
    pdf.drawString(370, 700, "Risk Level")

    y_position = 680
    pdf.setFont("Helvetica", 10)
    for risk in risks:
        pdf.drawString(50, y_position, risk['title'][:30])
        pdf.drawString(200, y_position, str(risk['impact']))
        pdf.drawString(270, y_position, str(risk['likelihood']))
        pdf.drawString(370, y_position, str(risk['risk_level']))
        y_position -= 20
        if y_position < 50:
            pdf.showPage()
            y_position = 750

    pdf.save()
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name="Compliance_report.pdf", mimetype='application/pdf')

@app.route('/edit_risk/<int:risk_id>', methods = ['GET' , 'POST'])
@login_required
def edit_risk(risk_id):
    risk = Risk.query.get_or_404(risk_id)
    if risk.owner_id != current_user.id:
        flash('Unauthorized access','Danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        risk.title = request.form['title']
        risk.description = request.form['description']
        risk.impact = int(request.form['impact'])
        risk.likelihood = int(request.form['likelihood'])
        risk.status = request.form['status']

        db.session.commit()
        flash('Risk updated successfully','success')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_risk.html', risk = risk)

@app.route('/delete_risk/<int:risk_id>', methods = ['POST'])
@login_required
def delete_risk(risk_id):
    risk = Risk.query.get_or_404(risk_id)
    if risk.owner_id != current_user.id:
        flash('Unauthorized access','Danger')
        return redirect(url_for('dashboard'))
    
    db.session.delete(risk)
    db.session.commit()
    flash('Risk deleted successfully','Success')
    return redirect(url_for('dashboard'))

@app.route('/export')
@login_required
def export_risks():

    impact = request.args.get('impact')

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(['Title', 'Description', 'Impact', 'Likelihood', 'Risk Score', 'Risk Level'])

    query = Risk.query.filter_by(owner_id=current_user.id)

    # risks = Risk.query.filter_by(owner_id=current_user.id).all()

    if impact and impact != 'all':
        try:
            impact_value = int(impact)
            query = query.filter_by(impact=impact_value)
        except ValueError:
            pass
    
    risks = query.all()

    for risk in risks:
        writer.writerow([
            risk.title,
            risk.description,
            risk.impact,
            risk.likelihood,
            risk.risk_score,
            risk.risk_level
        ])

    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='risk_report.csv'
    )

@app.route('/export_all_risks')
@login_required
def export_all_risks():
    if not current_user.is_admin:
        flash("Access denied", "danger")
        return redirect(url_for('dashboard'))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Title', 'Description', 'Impact', 'Likelihood', 'Risk Score', 'Risk Level', 'Owner ID'])

    risks = Risk.query.all()
    for risk in risks:
        writer.writerow([
            risk.title,
            risk.description,
            risk.impact,
            risk.likelihood,
            risk.risk_score,
            risk.risk_level,
            risk.owner_id
        ])

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='all_risks_report.csv'
    )

@app.route('/logout')
def logout():
    logout_user()
    flash('you have been logged out', 'info')
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=60, debug= True)

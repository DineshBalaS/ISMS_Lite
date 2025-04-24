from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(20), unique = True, nullable = False)
    password_hash = db.Column(db.String(100), nullable = False)
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self,password):
        return check_password_hash(self.password_hash, password)

class Risk(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100), nullable = False)
    description = db.Column(db.Text, nullable = False)
    impact = db.Column(db.Integer, nullable = False)
    likelihood = db.Column(db.Integer, nullable = False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable = False)

    created_at = db.Column(db.DateTime, default = datetime.utcnow)
    updated_at = db.Column(db.DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    status = db.Column(db.String(20), nullable=False, default="Open")
    treatment_plan = db.Column(db.Text, nullable=True)


    @property
    def risk_score(self):
        return self.impact*self.likelihood
    
    @property
    def risk_level(self):
        score = self.risk_score
        if score <= 3:
            return "low"
        elif score <= 5:
            return "medium"
        else:
            return "high"
from app import app, db
from models import User, Risk
from faker import Faker
from random import randint, choice
from datetime import datetime, timedelta

fake = Faker()

with app.app_context():
    db.create_all()

    # Create users
    users = []
    for _ in range(10):
        user = User(username=fake.user_name())
        user.set_password("test123")
        db.session.add(user)
        users.append(user)

    db.session.commit()

    # Fetch assigned IDs
    user_ids = [user.id for user in users]

    # Create risks
    for _ in range(120):
        risk = Risk(
            title=fake.sentence(nb_words=3),
            description=fake.paragraph(nb_sentences=2),
            impact=randint(1, 3),
            likelihood=randint(1, 3),
            owner_id=choice(user_ids),
            created_at=fake.date_time_between(start_date="-1y", end_date="now")
        )
        db.session.add(risk)

    db.session.commit()
    print("✅ Database seeded with test users and risks.")

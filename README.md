# ISMS Lite 🛡️

**ISMS Lite** is a lightweight Information Security Management System dashboard built with Flask.  
It helps users assess, score, track, and visualize risks for better compliance and risk management.

## 🔧 Features

- 🔐 User authentication (Admin/User)
- 📋 Add and manage risks
- 📊 Risk level calculation and categorization
- 🎨 Dashboards with charts (Chart.js)
- 📥 Export risks to CSV
- 📄 Generate PDF compliance reports
- 🎯 Filter by impact, risk level, and status
- 🛠️ Admin dashboard for all-user data visibility

## 🖥️ Tech Stack

- Backend: Flask (Python)
- Frontend: HTML, TailwindCSS & Bootstrap
- Database: SQLite + SQLAlchemy
- Charts: Chart.js

## 📦 Setup Instructions

```bash
git clone https://github.com/DineshBalaS/ISMS_Lite.git
cd "ISMS proj"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask run

# Use the official lightweight Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose the port your app runs on
EXPOSE 5000

# Set environment variable to avoid bytecode files
ENV PYTHONDONTWRITEBYTECODE=1

# Run the app
CMD ["python", "app.py"]

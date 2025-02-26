FROM python:3.8-slim-buster

# Install dependencies
RUN apt-get update && apt-get -y install cron && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt

# Copy .env file
COPY .env /opt/.env

# Copy cron job file
COPY bmpscrapper-cron /etc/cron.d/bmpscrapper-cron

# Set correct permissions for cron file
RUN chmod 0644 /etc/cron.d/bmpscrapper-cron

# Apply cron job
RUN crontab /etc/cron.d/bmpscrapper-cron

# Ensure log file exists
RUN touch /var/log/cron.log

# Set working directory
WORKDIR /opt

# Copy the Python script
COPY bmpscrapper.py /opt/bmpscrapper.py

# Start cron
CMD ["cron", "-f"]

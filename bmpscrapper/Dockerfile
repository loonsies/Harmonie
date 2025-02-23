FROM python:3.13.1-alpine

WORKDIR /app

# Install cron and required dependencies
RUN apk add --no-cache dcron

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the scraper script
COPY scrapper.py .

# Create cron job
RUN echo "0 */12 * * * python /app/scrapper.py >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Create log file
RUN touch /var/log/cron.log

CMD ["crond", "-f", "-d", "8"] 
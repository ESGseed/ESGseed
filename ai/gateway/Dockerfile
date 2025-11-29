FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY gateway/requirements.txt ./gateway/
RUN pip install --no-cache-dir -r gateway/requirements.txt

COPY gateway ./gateway

CMD ["uvicorn", "gateway.app.main:app", "--host", "0.0.0.0", "--port", "9000"]

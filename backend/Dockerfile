# Stage 1: Production runtime
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DB_PATH=/app/data/sprnt.db

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt


RUN groupadd -r sprnt && useradd -r -g sprnt sprnt && \
    mkdir -p /app/data && \
    chown -R sprnt:sprnt /app

# Copy backend source code into /app/backend
COPY . /app/backend

# Remove local virtualenvs or sqlite db if accidentally copied
RUN rm -rf /app/backend/.venv /app/backend/sprint /app/backend/sprnt.db /app/backend/__pycache__ && \
    chown -R sprnt:sprnt /app

USER sprnt

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]

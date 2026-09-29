from celery import Celery
import os

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

app = Celery("worker", broker=redis_url, backend=redis_url)

app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
)

app.autodiscover_tasks(["tasks"])

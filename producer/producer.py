import json
import time
import os
from datetime import datetime
from kafka import KafkaProducer

kafka_broker = os.environ.get('KAFKA_BROKER', 'kafka:9092')
kafka_topic = os.environ.get('KAFKA_TOPIC', 'messages')

producer = KafkaProducer(
    bootstrap_servers=[kafka_broker],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    acks='all',
    retries=5,
    retry_backoff_ms=1000
)

print(f"Producer connected to Kafka {kafka_broker}, topic: {kafka_topic}")

while True:
    try:
        now = datetime.now()
        hours = now.hour
        minutes = now.minute
        seconds = now.second

        message = {
            "text": f"Hi, the current time is {hours}:{minutes:02d}:{seconds:02d}",
            "timestamp": int(time.time())
        }

        producer.send(kafka_topic, message)
        print(f"Message sent: {json.dumps(message)}")

        time.sleep(1) # Wait one second

    except Exception as e:
        print(f"Errore durante l'invio del messaggio: {e}")
        time.sleep(5)  # Wait five seconds
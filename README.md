# KafkaProcuderConsumer
Simple Kafka project with one Python producer and Node consumer

## Description

The system is composed by 3 actors:
1. One Kafka server
2. One Python producer
3. One Node consumer

The Python producer sends one message per second with the current timestamp.
The Kafka server receive the message and delivers it to all subscribed consumers.
The Node consumer received the message and prints it onto a simple table.

## Project structure

```
.
├── docker-compose.yml
├── producer/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── producer.py
└── consumer/
    ├── Dockerfile
    ├── package.json
    ├── consumer.js
    └── index.html
```

# Requirements

- Docker
- Docker compose

## Build up

1. Clone this project
2. Pull images
```
docker compose pull
```
3. Build images
```
docker compose build --no-cache
```
4. Launch it
```
docker compose up -d
```

To see logs, omit the `-d` option in `compose up` or attach to logs of specific service, like:
```
docker compose logs -f producer
docker compose logs -f consumer
```

You can do all of it at once simply with
```
docker compose up -d --build
```

## Web interface

Access to consumer's page to see received messages int table:
```
http://localhost:3000
```

## Shutdown project

To stop project prompt:
```
docker compose down
```
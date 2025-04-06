const { Kafka } = require('kafkajs');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const kafka_broker = process.env.KAFKA_BROKER || 'kafka:9092';
const kafka_topic = process.env.KAFKA_TOPIC || 'messages';

const kafka = new Kafka({
    clientId: 'node-consumer',
    brokers: [kafka_broker]
});

const consumer = kafka.consumer({
    groupId: 'message-consumer-group',
    sessionTimeout: 45000,
    heartbeatInterval: 15000
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket connections handler
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const runConsumer = async () => {
    try {
        await consumer.connect();
        console.log(`Kafka consumer connected to ${kafka_broker}`);

        await consumer.subscribe({ topic: kafka_topic, fromBeginning: false });
        console.log(`Subscribed to topic: ${kafka_topic}`);

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const messageValue = JSON.parse(message.value.toString());
                    console.log(
                        `Received message: ${JSON.stringify(messageValue)}`
                    );

                    // Emit message to all connected clients
                    io.emit('kafka-message', messageValue);
                } catch (error) {
                    console.error(
                        `Error during message elaboration: ${error.message}`
                    );
                }
            }
        });
    } catch (error) {
        console.error(`Error on Kafka consumer: ${error.message}`);
    }
};

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    runConsumer().catch((error) => {
        console.error(
            `Impossible to start Kafka consumer: ${error.message}`
        );
    });
});

// Graceful closing handler
const shutdown = async () => {
    try {
        await consumer.disconnect();
        console.log('Kafka consumer disconnected');
        process.exit(0);
    } catch (error) {
        console.error(`Error during connection: ${error.message}`);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

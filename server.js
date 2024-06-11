const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { join } = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    wssEngine: ["ws", "wss"],
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true
    },
    allowEIO3: true,
    pingTimeout: 60000,
});

app.use(express.json());

app.post('/webhook', (req, res) => {
    console.log('Webhook recibido:', req.body);
    io.emit('webhookEvent', req.body);
    res.sendStatus(200);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('sendText', (text) => {
        console.log('Texto recibido:', text);

        const reversedText = text.split('').reverse().join('');
        console.log('Texto invertido:', reversedText);

        socket.emit('receiveText', reversedText);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

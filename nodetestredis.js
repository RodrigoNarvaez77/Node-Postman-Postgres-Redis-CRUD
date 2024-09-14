const express = require('express');
const redis = require('redis');
require('dotenv').config(); // Para cargar variables de entorno

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
    console.error('Error de Redis:', err);
});

redisClient.connect().catch(err => {
    console.error('No se pudo conectar a Redis:', err);
});

const app = express();
const port = 3003;

app.get('/test-redis', async (req, res) => {
    try {
        // Guardar un valor en Redis
        await redisClient.set('test_key', 'Redis is working!', 'EX', 3600); // Expira en 1 hora

        // Recuperar el valor desde Redis
        const value = await redisClient.get('test_key');

        // Enviar una respuesta al cliente
        res.json({ message: 'Redis is working!', value });
    } catch (err) {
        console.error('Error al interactuar con Redis:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
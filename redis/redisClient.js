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

module.exports = redisClient;
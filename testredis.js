const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
    console.error('Error de Redis:', err);
});

(async () => {
    try {
        // Intenta conectar al servidor Redis
        await redisClient.connect();
        console.log('Conectado a Redis');

        // Realiza una operación básica de prueba
        await redisClient.set('test_key', 'test_value');
        const value = await redisClient.get('test_key');
        console.log('Valor obtenido de Redis:', value);

        // Cierra la conexión
        await redisClient.quit();
    } catch (err) {
        console.error('Error en la prueba de Redis:', err);
    }
})();
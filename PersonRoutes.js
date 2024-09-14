const express = require('express');
const router = express.Router();
const redisClient = require('./redis/redisClient');
const { Person, Work, sequelize } = require('./models/Index'); // Ruta a tus modelos

// Insertar una persona
router.post('/', async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);

    const { name, lastname, nationality, year, works } = req.body;

    // Validar que works esté definido y tenga las propiedades necesarias
    if (!works || !works.company || !works.initContract || !works.finishContract || !works.position) {
        return res.status(400).json({
            success: false,
            message: 'Datos incompletos',
            details: 'Faltan datos necesarios en el objeto works'
        });
    }

    const { company, initContract, finishContract, position } = works;

    const transaction = await sequelize.transaction(); // Usar transacción de Sequelize

    try {
        // Insertar la nueva persona dentro de la transacción
        const person = await Person.create({
            name,
            lastname,
            nationality,
            year: parseInt(year, 10)
        }, { transaction });

        // Insertar el trabajo asociado
        const work = await Work.create({
            company,
            initContract,
            finishContract,
            position
        }, { transaction });

        // Asociar el trabajo con la persona
        await person.addWork(work, { transaction });

        // Confirmar la transacción
        await transaction.commit();

        // Eliminar caché relevante si existe
        await redisClient.del(`person:${person.id}`);
        
        res.status(201).json({ success: true, message: 'Datos insertados correctamente', person, work });
    } catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        console.error('Error al insertar datos:', error);
        res.status(500).json({ success: false, message: 'Error al insertar datos', details: error.message });
    }
});

// Obtener todas las personas
router.get('/', async (req, res) => {
    try {
        // Intentar obtener los datos de Redis
        const cacheData = await redisClient.get('all_people');
        if (cacheData) {
            console.log('Datos obtenidos de Redis');
            return res.status(200).json(JSON.parse(cacheData));
        }

        // Si no están en caché, obtener de la base de datos
        const people = await Person.findAll({
            include: Work // Incluye la información de trabajos asociados
        });

        // Guardar en caché para futuras solicitudes
        await redisClient.set('all_people', JSON.stringify(people), 'EX', 3600); // Expira en 1 hora

        console.log('Datos obtenidos de la base de datos');
        res.status(200).json(people);
    } catch (err) {
        console.error('Error al obtener personas:', err);
        res.status(500).json({ message: err.message });
    }
});
// Obtener una persona por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Intentar obtener los datos de Redis
        const cacheData = await redisClient.get(`person:${id}`);
        if (cacheData) {
            console.log('Datos obtenidos de Redis');
            return res.status(200).json(JSON.parse(cacheData));
        }

        // Si no están en caché, obtener de la base de datos
        const person = await Person.findByPk(id, {
            include: Work // Incluye la información de trabajos asociados
        });

        if (person) {
            // Guardar en caché para futuras solicitudes
            await redisClient.set(`person:${id}`, JSON.stringify(person), 'EX', 3600); // expira en 1 hora

            console.log(`La Persona es: ${JSON.stringify(person)}`);
            res.status(200).json(person);
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar una persona por ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Person.destroy({
            where: { id }
        });

        if (deleted) {
            // Eliminar caché relevante
            await redisClient.del(`person:${id}`);
            await redisClient.del('all_people');
            
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar una persona por ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    //const updateDataWork = req.body.works;//work proviene del postman.
   // console.log('Datos para actualizar Work:', updateDataWork);

    //console.log('Datos para actualizar Persona:', updatePersons);
    //console.log(updateData);
    try {
        const [updated] = await Person.update(updateData, {
            where: { id },
        });

       // const[workupdated] = await Work.update(updateDataWork,{
       //      where: { id } 
       // });

        //console.log(workupdated);

        if (updated) {
            // Actualizar caché
            const person = await Person.findByPk(id);
            //console.log(person);
            await redisClient.set(`person:${id}`, JSON.stringify(person), 'EX', 3600); // expira en 1 hora
            await redisClient.del('all_people');

            res.status(200).json(person);
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Listar todos los trabajos de una persona
router.get('/works/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const person = await Person.findByPk(id, {
            include: Work
        });

        if (person) {
            res.status(200).json(person.works);
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Agregar un nuevo trabajo a una persona
router.post('/works/:id', async (req, res) => {
    const { id } = req.params;
    const newWorkData = req.body;
    try {
        const person = await Person.findByPk(id);
        if (person) {
            const work = await Work.create(newWorkData);
            await person.addWork(work);
            res.status(201).json(work);
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un trabajo de una persona
router.delete('/works/:id/:workId', async (req, res) => {
    const { id, workId } = req.params;
    try {
        const person = await Person.findByPk(id);
        if (person) {
            const work = await Work.findByPk(workId);
            if (work) {
                await person.removeWork(work);
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Trabajo no encontrado' });
            }
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Modificar un trabajo de una persona
router.put('/works/:id/:workId', async (req, res) => {
    const { id, workId } = req.params;
    const updatedWorkData = req.body;
    try {
        const person = await Person.findByPk(id);
        if (person) {
            const work = await Work.findByPk(workId);
            if (work) {
                await work.update(updatedWorkData);
                res.status(200).json(work);
            } else {
                res.status(404).json({ message: 'Trabajo no encontrado' });
            }
        } else {
            res.status(404).json({ message: 'Persona no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Ruta para probar la conexión a Redis
router.get('/test-redis', async (req, res) => {
    try {
        // Guardar un valor en Redis
        await redisClient.set('test_key', 'Redis is working!', 'EX', 3600); // expira en 1 hora

        // Recuperar el valor desde Redis
        const value = await redisClient.get('test_key');

        // Enviar una respuesta al cliente
        res.json({ message: 'Redis is working!', value });
    } catch (err) {
        console.error('Error al interactuar con Redis:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
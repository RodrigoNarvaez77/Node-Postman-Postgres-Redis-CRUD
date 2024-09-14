const express = require('express');
const router = express.Router();
const redisClient = require('./redis/redisClient');
const { Person, Work, sequelize  } = require('./models/Index'); //ruta a tu archivo de modelos

// Insertar una persona
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

        res.status(201).json({ success: true, message: 'Datos insertados correctamente', person, work });
    } catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        console.error('Error al insertar datos:', error);
        res.status(500).json({ success: false, message: 'Error al insertar datos', details: error.message });
    }
});
//router.post('/', async (req, res) => {
  //  const { name, lastname, nationality, year, works } = req.body;

    //const transaction = await sequelize.transaction(); // Usar transacción de Sequelize

    //try {
        // Insertar la nueva persona dentro de la transacción
      //  const person = await Person.create({
        //    name,
         //   lastname,
         //   nationality,
          //  year
       // }, { transaction });

       // let createdWorks = [];
        // Insertar los trabajos y asociarlos con la persona
       // if (works && works.length > 0) {
        //    const workPromises = works.map(work =>
          //      Work.create({
            //        company: work.company,
            //        initContract: work.initContract,
            //        finishContract: work.finishContract,
            //        position: work.position
            //    }, { transaction })
           // );

            //createdWorks = await Promise.all(workPromises);

            // Asociar los trabajos con la persona
           // const workIds = createdWorks.map(work => work.id);
          //  await person.addWorks(workIds, { transaction });
            
       // }
        // console.log(`Sus trabajos son: ${JSON.stringify(createdWorks)}`);
        //    const informacioncompleta = {person , createdWorks}
        //console.log(`Sus trabajos son: ${JSON.stringify(informacioncompleta)}`);

      //  await transaction.commit();
      //  res.status(201).json(informacioncompleta);
   // } catch (err) {
   //     await transaction.rollback();
   //     console.error(err);
   //     res.status(500).json({message:err.message });
   // }
//});

// Obtener todas las personas
router.get('/', async (req, res) => {
    try {
        const people = await Person.findAll({
            include: Work // Incluye la información de trabajos asociados
        });
        console.log(`Las Peronas son: ${JSON.stringify(people)}`);
        res.status(200).json(people);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener una persona por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const person = await Person.findByPk(id, {
            include: Work // Incluye la información de trabajos asociados
        });
       console.log(`Las Perosnas es: ${JSON.stringify(person)}`);

        if (person) {
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
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Person not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar una persona por ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const [updated] = await Person.update(updateData, {
            where: { id },
            returning: true
        });

        if (updated) {
            const person = await Person.findByPk(id,{
            include: [Work]
            });
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
            res.status(404).json({ message: 'Person not found' });
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
                res.status(404).json({ message: 'Work not found' });
            }
        } else {
            res.status(404).json({ message: 'Person not found' });
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
                res.status(404).json({ message: 'Work not found' });
            }
        } else {
            res.status(404).json({ message: 'Person not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Ruta para probar la conexión a Redis
router.get('/test-redis', async (req, res) => {
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


module.exports = router;
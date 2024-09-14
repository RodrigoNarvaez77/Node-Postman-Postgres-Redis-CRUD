document.addEventListener('DOMContentLoaded', () => {//esperar que carge el doom
    document.getElementById('boton').addEventListener('click', async () => {
        await capturar();
    });
});

async function capturar() {
    try {
        const nombreCapturar = document.getElementById("name").value;
        const apellidoCapturar = document.getElementById("lastname").value;
        const nacionalidadCapturar = document.getElementById("nationality").value;
        const edadCapturar = document.getElementById("year").value;

        const trabajo = {
            company: document.getElementById("company").value,
            initContract: document.getElementById("initContract").value,
            finishContract: document.getElementById("finishContract").value,
            position: document.getElementById("position").value
        };

        const persona = {
            name: nombreCapturar,
            lastname: apellidoCapturar,
            nationality: nacionalidadCapturar,
            year: parseInt(edadCapturar, 10),
            works: trabajo // Envía un solo objeto de trabajo, no un array
        };

        console.log(persona);

        const response = await fetch('/api/persons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(persona)
        });

        if (!response.ok) {
            // Lee el contenido de la respuesta para detalles del error
            const errorDetails = await response.text();
            console.error('Error en la respuesta:', errorDetails);
            alert('Error al insertar datos: ' + errorDetails);
            return;
        }

        const data = await response.json();
        if (data.success) {
            alert('Datos insertados correctamente');
        } else {
            alert('Error al insertar datos');
        }
    } catch (error) {
        console.error("Error:", error.message || error);
        alert('Error en la solicitud');
    }
}


document.addEventListener('DOMContentLoaded', () => {//esperar que carge el doom
    document.getElementById('boton4').addEventListener('click', async () => {
        await mostrarpersona();
    });
});

async function mostrarpersona(){
       const idmodificar =  document.getElementById("updateid").value;
       try{ 
        const response = await fetch(`/api/persons/${idmodificar}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        console.log(data);
        const company = data.works[0].company
        const initContract = data.works[0].initContract
        const finishContract = data.works[0].finishContract
        const position = data.works[0].position
        //console.log(initContract);
        //console.log(company);
        document.getElementById('updateName').value = data.name; 
        document.getElementById('updateLastname').value = data.lastname; 
        document.getElementById('updateNacionalidad').value = data.nationality; 
        document.getElementById('updateEdad').value = data.year; 
        document.getElementById('updateCompañia').value = company; 
        document.getElementById('updateIniciocontrato').value = initContract; 
        document.getElementById('updateFinalcontrato').value = finishContract; 
        document.getElementById('updatePosition').value = position; 
    }catch(error){
        "error".error
    }
}

async function modificar2() {
    try {
        const idmodificar2 =  document.getElementById("updateid").value;
        console.log(idmodificar2);
        const nombreCapturar = document.getElementById("updateName").value;
        const apellidoCapturar = document.getElementById("updateLastname").value;
        const nacionalidadCapturar = document.getElementById("updateNacionalidad").value;
        const edadCapturar = document.getElementById("updateEdad").value;

        const trabajo = {
            company: document.getElementById("updateCompañia").value,
            initContract: document.getElementById("updateIniciocontrato").value,
            finishContract: document.getElementById("updateFinalcontrato").value,
            position: document.getElementById("updatePosition").value
        };

        const persona = {
            name: nombreCapturar,
            lastname: apellidoCapturar,
            nationality: nacionalidadCapturar,
            year: parseInt(edadCapturar, 10),
            //works: [trabajo] // Envía solo un trabajo
        };

        console.log(persona);

        const response = await fetch(`/api/persons/${idmodificar2}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(persona)
        });
        const data = await response.json();
        //console.log(data);
       alert("Datos Insertados correctamente");
    } catch (error) {
        console.error("Error:", error.message || error);
        alert('Error en la solicitud');
    }
}
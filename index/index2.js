async function mostrar(){
    try { 
        const response = await fetch('/api/persons', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        console.log(data);
        const body = document.getElementById("tmostrar");
        body.innerHTML='';
        data.forEach(item => {
            const row = document.createElement('tr');
            // Acceder al primer elemento de 'works' y luego a la propiedad 'company'
            const company = item.works[0].company;
            const initContract = item.works[0].initContract;
            const finishContract = item.works[0].finishContract;
            const position = item.works[0].position;
            console.log(company);
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.lastname}</td>
                <td>${item.year}</td>
                <td>${item.nationality}</td>
                <td>${company}</td> 
                <td>${initContract}</td>
                <td>${finishContract}</td>
                <td>${position}</td>
            `;
            body.appendChild(row);
        });

    } catch (error) {
        console.log("Error:", error); // Corregido para mostrar el error
    }
}

mostrar()

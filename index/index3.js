document.addEventListener('DOMContentLoaded', () => {//esperar que carge el doom
    document.getElementById('boton3').addEventListener('click', async () => {
        await eliminar();
    });
});

async function eliminar(){
    try{ 
        const eliminar = document.getElementById('deleteId').value;
        console.log(eliminar);
        const response = await fetch(`/api/persons/${eliminar}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
    if(response.ok){
        alert("Registro eliminado Correctamente");
    }
    else{
        alert("No se elimino Registro");
    }

    }catch(error){'error:'.error}
}
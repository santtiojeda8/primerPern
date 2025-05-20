import app  from "./app";

const PORT = process.env.PORT || 3000

app.listen(PORT , () => {
    // Imprimimos un mensaje en la consola cuando el servidor se inicia correctamente
    console.log(`¡Servidor de la Biblioteca corriendo en http://localhost:${PORT}`);
    console.log('Presiona CTRL+C para detenerlo');
})
import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes'

dotenv.config()

// Crea una instancia de la aplicación Express
const app = express()

// Middleware para parsear cuerpos de solicitud con formato JSON
// Esto permite que req.body esté disponible con los datos JSON enviados por el cliente
app.use(express.json())

//definimos a que rutas debe acceder la direccion /usuarios
app.use('/usuarios', userRoutes)

export default app
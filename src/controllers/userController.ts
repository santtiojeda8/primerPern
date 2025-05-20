import { Request , Response } from 'express'
import * as userService from '../services/userService'
// Importamos un tipo de error específico de Prisma para un mejor manejo de errores
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Vamos a crear las funciones para manejar los endpoints

// GET para obtener todos los usuarios
export const getUsers = async (req: Request, res:Response) => {
    try {
        const users = await userService.getAllUsers()

        // Hacemos un .map para excluir la contraseña de cada usuario en la respuesta
        const userWithoutPassword = users.map( user => {
            //Desestructuramos el user y sacamos password del objeto user con {password,
            // luego el ...userWithoutPassword crea un objeto con las propiedades restantes del objeto user, dejando afuera password
            const{ password, ...userWithoutPassword} = user
            return userWithoutPassword
        })

        res.status(200).json(userWithoutPassword)
    } catch (error) {
        console.log('Error al obtener usuarios' , error)
        // En caso de error, envía una respuesta con estado 500 (Error Interno del Servidor)
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios' });
    }
} 

export const getOneUser = async ( req: Request, res: Response) => {
    try {
        //Obtenemos el id sacado de los parametros pasado por el endpoint o url
        const userId = req.params.id

        //Hacemos un get a un solo usuario, función definida en el service 
        const user = await userService.getUserById(userId)

        // Si no encontramos el usuario, le avismos al usuario que se encontró
        if(!user){
            console.error(`Error al obtener usuario con ID ${req.params.id}:`);
            res.status(404).json({ message: 'Usuario no encontrado' });
            //Hacemos un return para que corte la función y no se siga ejecutando
            return
        }

        //En este caso, como es un solo user que traemos, al mismo user traido lo desestrucuturamos y le sacamos el password y creamos el nuevo objeto sin el password para devolver
        const { password, ...userWithoutPassword} = user
        //Devolvemos el response
        res.status(200).json(userWithoutPassword)

    } catch (error) {

        console.error(`Error al obtener usuario con ID ${req.params.id}:`, error);
        // En caso de error (ej. ID con formato inválido si no usas UUIDs en params), envía 500
        res.status(500).json({ message: 'Error interno del servidor al obtener usuario' });
    }
}

//Hacemos el POST para crear un nuevo usuario
export const newUser = async ( req: Request, res:Response) => {
    
    try {
        //Sacamos los datos pasados en la url como parámetros con .body
        const userData = req.body

        //Usamos esos datos obtenidos para registrar un nuevo usuario. La función creada en el service hashea la contraseña
        const user = await userService.registerUser(userData)

        const {password, ...userWithoutPassword} = user

        // Envía una respuesta con estado 201 (Creado) y los datos del nuevo usuario (sin contraseña)
        res.status(201).json(userWithoutPassword);

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        // Verifica si es un error conocido de Prisma, específicamente una violación de restricción única (código P2002)
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            // Si el email ya existe, envía un estado 409 (Conflicto)
            res.status(409).json({ message: 'El email ya está registrado' });
        } else {
            // Para otros errores, envía un estado 500
            res.status(500).json({ message: 'Error interno del servidor al registrar usuario' });
        }
    }
}

//Hacemos un PUT para manejar cambios en el usuario
export const editUser = async (req:Request , res:Response) => {

    try {
        const userId = req.params.id
        const userData = req.body

        const user = await userService.updateUser(userId, userData);

        // Si no encontramos el usuario, le avismos al usuario que se encontró
        if(!user){
            console.error(`Error al obtener usuario con ID ${req.params.id}:`);
            res.status(404).json({ message: 'Usuario no encontrado' });
            //Hacemos un return para que corte la función y no se siga ejecutando
            return
        }

        //En este caso, como es un solo user que editamos, al mismo user editado lo desestrucuturamos y le sacamos el password y creamos el nuevo objeto sin el password para devolver y mostrarlo creado
        const { password, ...userWithoutPassword} = user
        //Devolvemos el response
        res.status(200).json(userWithoutPassword)

    } catch (error) {
        console.error(`Error al actualizar usuario con ID ${req.params.id}:`, error);

        // Maneja la violación de restricción única si se intenta actualizar el email a uno existente
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json({ message: 'El email ya está en uso por otro usuario' });
        } else {
            // Para otros errores, envía 500
            res.status(500).json({ message: 'Error interno del servidor al actualizar usuario' });
        }
    }
}

export const deleteUserController = async (req:Request , res:Response) => {

    try {
        const userId = req.params.id

        const user = await userService.deleteUser(userId)

        if(!user){
            // Si el usuario no fue encontrado para eliminar, envía 404
            res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
            return
        }

        //Sacamos la contrasela del usuario eliminado para evitar mostrarla
        const {password , ...userWithoutPassword} = user

        //Mostramos el usuario eliminado y un mensaje de elmimnación
        res.status(204).json({message: "Usuario eliminado: ", user: userWithoutPassword})


    } catch (error) {

        console.error(`Error al eliminar usuario con ID ${req.params.id}:`, error);

        // Prisma lanza un error P2025 si el registro a eliminar no existe
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

            res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
        } else {

            // Para otros errores, envía 500
            res.status(500).json({ message: 'Error interno del servidor al eliminar usuario' });
        }
        
    }
}
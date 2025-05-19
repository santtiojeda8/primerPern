import { PrismaClient, Usuario } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const saltRounds = 10;

//Vamos a obtener todos los usuarios
export const getAllUsers = async (): Promise<Usuario[]> => {
  // Usa el cliente Prisma para encontrar todos los registros en la tabla 'usuario'
  return prisma.usuario.findMany();
};


// Vamos a obtener un usario por su ID
export const getUserById = async (id: string): Promise<Usuario | null> => {
  //  Usa el cliente Prisma para encontrar un registro único por su campo 'id'
  return prisma.usuario.findUnique({
    where: { id }, // Busca donde el 'id' de la base de datos coincida con el 'id' proporcionado
  });
};


// Vamos a registrar un nuevo usuario (la contraseña llegará sin hashear)

//Recibe userData como parámetro que es un objeto con los datos del usuario, exluyendo el id, porque se lo indicamos con el Omit<Usuario, 'id'> ya que se crea automaticamente en la DB
export const registerUser = async (userData: Omit<Usuario, "id">): Promise<Usuario> => {    

  // Hasheamos la contraseña antes de guardarla con bcrypt
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Usa el cliente Prisma para crear un nuevo registro de usuario
  return prisma.usuario.create({
    data: {
      // 'data' contiene los campos para el nuevo registro
      nombre: userData.nombre,
      email: userData.email,
      password: hashedPassword, // Guarda la contraseña hasheada
    },
  });
};


// Vamos a modificar un usuario por su ID
// Con Partial<Omit<Usuario, 'id'>> indicamos que userData puede recibir algunos datos de tipo Usuario, no todos, y indicamos que excluya el ID, ya que no vamos a trabajar el de la DB, sino el que nos vayan a pasar
// 'Partial' en el tipo de userData permite actualizar solo algunos campos
//id: string indica que va a recibir un usuario para poder actualizar sus datos
export const updateUser = async (id: string, userData: Partial<Omit<Usuario, 'id'>>): Promise<Usuario | null> => {

  // verificamos si se proporciona una nueva contraseña en los datos a actualizar
  if (userData.password) {
    // Hashear la nueva contraseña en caso de haber sido cambiada
    userData.password = await bcrypt.hash(userData.password, saltRounds);
  }

  // Usa el cliente Prisma para actualizar un registro de usuario por su 'id'

  return prisma.usuario.update({
    where: { id }, // Busca el registro por su 'id'
    data: userData, // Los datos a actualizar (pueden incluir la contraseña hasheada si se cambió)
  });
};


// Vamos a eliminar un usuario por su ID
export const deleteUser = async (id: string): Promise<Usuario | null> => {

  try {

    // Usa el cliente Prisma para eliminar un registro por su 'id'
    return await prisma.usuario.delete({
      where: { id }, // Busca el registro por su 'id'
    });

  } catch (error) {

    // Si el usuario no se encuentra, Prisma lanza un error específico (P2025)
    // Aquí simplemente registramos el error y retornamos null (el controlador decidirá qué respuesta dar)
    // En una aplicación real, podrías querer manejar diferentes tipos de errores de Prisma de forma más granular
    console.error(`Error eliminando usuario con ID ${id}:`, error);
    return null; // Retorna null si hay un error (ej. usuario no encontrado)
  }
};

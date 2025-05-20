import { Router } from "express";
import * as userController from '../controllers/userController';

const router = Router()

router.get('/' , userController.getUsers)
router.get('/:id', userController.getOneUser)
router.post('/' , userController.newUser)
router.put('/:id', userController.editUser)
router.delete('/:id' , userController.deleteUserController)

export default router
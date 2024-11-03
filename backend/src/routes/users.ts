import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getUsers);
router.get('/:id', auth, getUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

export default router;
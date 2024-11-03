import express from 'express';
import { auth } from '../middleware/auth';
import * as CategoryController from '../controllers/categoryController';

const router = express.Router();

router.get('/', auth, CategoryController.getCategories);
router.get('/:id', auth, CategoryController.getCategory);
router.post('/', auth, CategoryController.createCategory);
router.put('/:id', auth, CategoryController.updateCategory);
router.delete('/:id', auth, CategoryController.deleteCategory);


export default router;
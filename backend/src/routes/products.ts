import express from 'express';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as ProductController from '../controllers/productController';

const router = express.Router();

router.get('/', auth, ProductController.getProducts);
router.get('/:id', auth, ProductController.getProduct);
router.post('/', 
    auth, 
    upload.single('image'), 
    ProductController.createProduct
);
router.put('/:id', 
    auth, 
    upload.single('image'), 
    ProductController.updateProduct
);
router.patch('/:id/quantity', auth, ProductController.updateProductQuantity);
router.delete('/:id', auth, ProductController.deleteProduct);

export default router;
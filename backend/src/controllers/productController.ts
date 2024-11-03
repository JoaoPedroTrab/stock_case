import fs from 'fs/promises';
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.query;

        const where = categoryId ? {
            categoryId: Number(categoryId)
        } : undefined;

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true
            }
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
};


export const getProduct = async (req: Request, res: Response) => {
    try {   
        const { id } = req.params;
        const productId = Number(id);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, sku, price, quantity, minStock, categoryId } = req.body;
        const file = req.file;

        if (!name || !sku || !categoryId) {
            if (file) {
                await fs.unlink(file.path);
            }
            return res.status(400).json({ 
                error: 'Name, SKU and category ID are required' 
            });
        }

        const imageUrl = file ? `/uploads/products/${file.filename}` : null;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku,
                price: new Prisma.Decimal(price),
                quantity: quantity || 0,
                minStock: minStock || 0,
                categoryId: Number(categoryId),
                imageUrl
            },
            include: {
                category: true
            }
        });

        res.status(201).json(product);
    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path);
        }
        console.error('Error creating product:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'SKU already exists' });
            }
            if (error.code === 'P2003') {
                return res.status(400).json({ error: 'Invalid category ID' });
            }
        }
        res.status(500).json({ error: 'Error creating product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productId = Number(id);
        const { name, description, sku, price, quantity, minStock, categoryId } = req.body;
        const file = req.file;

        if (isNaN(productId)) {
            if (file) {
                await fs.unlink(file.path);
            }
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const currentProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!currentProduct) {
            if (file) {
                await fs.unlink(file.path);
            }
            return res.status(404).json({ error: 'Product not found' });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (sku) updateData.sku = sku;
        if (price !== undefined) updateData.price = new Prisma.Decimal(price);
        if (quantity !== undefined) updateData.quantity = Number(quantity);
        if (minStock !== undefined) updateData.minStock = Number(minStock);
        if (categoryId) updateData.categoryId = Number(categoryId);
        if (file) {
            updateData.imageUrl = `/uploads/products/${file.filename}`;
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: updateData,
            include: {
                category: true
            }
        });

        if (file && currentProduct.imageUrl) {
            const oldImagePath = path.join(__dirname, '..', '..', currentProduct.imageUrl);
            try {
                await fs.unlink(oldImagePath);
            } catch (error) {
                console.error('Error deleting old image:', error);
            }
        }

        res.json(product);
    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path);
        }
        console.error('Error updating product:', error);
    }
};

export const updateProductQuantity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productId = Number(id);
        const { quantity } = req.body;

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        if (quantity === undefined) {
            return res.status(400).json({ error: 'Quantity is required' });
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                quantity: Number(quantity)
            },
            include: {
                category: true
            }
        });

        res.json(product);
    } catch (error) {
        console.error('Error updating product quantity:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Product not found' });
            }
        }
        res.status(500).json({ error: 'Error updating product quantity' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productId = Number(id);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await prisma.product.delete({
            where: { id: productId }
        });

        if (product.imageUrl) {
            const imagePath = path.join(__dirname, '..', '..', product.imageUrl);
            try {
                await fs.unlink(imagePath);
            } catch (error) {
                console.error('Error deleting product image:', error);
            }
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
    }
};
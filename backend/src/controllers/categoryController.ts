import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todas as categorias
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

// Buscar uma categoria específica
export const getCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoryId = Number(id);

        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                products: true,
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Error fetching category' });
    }
};

// Criar nova categoria
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const category = await prisma.category.create({
            data: {
                name,
                description
            }
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
         res.status(500).json({ error: 'Error creating category' });
    }
};

// Atualizar categoria
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoryId = Number(id);
        const { name, description } = req.body;

        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        if (!name && !description) {
            return res.status(400).json({ error: 'No data provided for update' });
        }

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: { name, description }
        });

        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Category not found' });
            }
        }
        res.status(500).json({ error: 'Error updating category' });
    }
};

// Deletar categoria
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const categoryId = Number(id);

        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        // Verificar se existem produtos associados
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (category._count.products > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete category with associated products' 
            });
        }

        await prisma.category.delete({
            where: { id: categoryId }
        });

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Error deleting category' });
    }
};
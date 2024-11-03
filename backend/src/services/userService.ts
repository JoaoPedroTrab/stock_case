import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async () => {
    return prisma.user.findMany({
        select: { id: true, name: true, email: true },
    });
};

export const getUser = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true },
    });
};

export const updateUser = async (id: number, data: { name?: string; email?: string }) => {
    return prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true },
    });
};

export const deleteUser = async (id: number) => {
    return prisma.user.delete({
        where: { id },
    });
};
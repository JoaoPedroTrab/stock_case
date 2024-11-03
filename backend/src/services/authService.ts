import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerUser = async (name: string, email: string, password: string) => {
    console.log('Registering user:', { name, email });

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        throw new Error('Internal server error');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        console.log('User already exists:', email);
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    console.log('User created:', user.id);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { user: { id: user.id, name: user.name, email: user.email }, token };
};

export const loginUser = async (email: string, password: string) => {
    console.log('Logging in user:', email);

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        throw new Error('Internal server error');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User not found:', email);
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('Invalid password for user:', email);
        throw new Error('Invalid credentials');
    }

    console.log('User logged in:', user.id);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { user: { id: user.id, name: user.name, email: user.email }, token };
};
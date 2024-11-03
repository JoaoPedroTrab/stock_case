import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';

export const register = async (req: Request, res: Response) => {
    console.log('Register request received:', req.body);
    try {

        let { name, email, password } = req.body;

        if (typeof req.body.name === 'string') {
            name = req.body.name;
            email = req.body.email;
            password = req.body.password;
        }

        if (!name || !email || !password) {
            console.log('Invalid input data');
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        const result = await registerUser(name, email, password);
        console.log('User registered successfully:', result.user.id);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in register controller:', error);
        if (error instanceof Error) {
            if (error.message === 'User already exists') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    console.log('Login request received:', req.body);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Invalid input data');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await loginUser(email, password);
        console.log('User logged in successfully:', result.user.id);
        res.json(result);
    } catch (error) {
        console.error('Error in login controller:', error);
        if (error instanceof Error) {
            if (error.message === 'Invalid credentials') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
};
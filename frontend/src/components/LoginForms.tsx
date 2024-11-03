import React, { useState } from 'react';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Form from './Forms';
import Input from './Input';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';

const LoginForms: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            setIsLoading(false);
            navigate('/Dashboard');
        } catch (error) {
            setIsLoading(false);
            setError('Ocorreu um erro durante o login, tente novamente.');
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-950 bg-clip-text text-transparent animate-pulse">
                    STOCK MANAGER
                </h2>
                <p className="mt-2 text-center text-1xl text-gray-700">
                    O Controle de estoque intuitivo!
                </p>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Insira seu e-mail para acessar sua conta...
                </p>
            </div>
            <Form onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <Input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="Digite seu e-mail."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                    />
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="Digite sua senha."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                    />
                </div>
                {error && (
                    <div className="flex items-center text-red-500 text-sm mt-2">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                )}
                <Button type="submit" isLoading={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
            </Form>
            <Button variant="secondary" onClick={handleRegister} icon={UserPlus}>
                Criar uma conta
            </Button>
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    </div>
                    <div className="relative flex justify-center text-sm">
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForms;
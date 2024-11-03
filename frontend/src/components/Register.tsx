import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Form from './Forms';
import Input from './Input';
import Button from './Button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        if (!formData.name.trim()) {
            setErrors(prev => ({ ...prev, name: 'Nome é obrigatório' }));
        }
        if (!formData.email.trim()) {
            setErrors(prev => ({ ...prev, email: 'Email é obrigatório' }));
        }
        if (!formData.password) {
            setErrors(prev => ({ ...prev, password: 'Senha é obrigatória' }));
        }
        if (formData.password !== formData.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }));
        }

        if (Object.keys(errors).length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            await register(formData.name.trim(), formData.email.trim(), formData.password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Erro no registro:', error);
            setErrors({ submit: error instanceof Error ? error.message : 'Erro ao registrar. Por favor, tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-700 to-purple-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        CRIE SUA CONTA
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Junte-se a nós e comece a gerenciar seus projetos
                    </p>
                </div>
                <Form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            placeholder="Nome completo"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            label="Nome"
                        />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Endereço de e-mail"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            label="E-mail"
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="Senha"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            label="Senha"
                        />
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="Confirme a senha"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            label="Confirmar Senha"
                        />
                    </div>
                    <div className="mt-6">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isLoading ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </div>
                    {errors.submit && <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>}
                </Form>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Já possui uma conta?
                            </span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Link
                            to="/login"
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
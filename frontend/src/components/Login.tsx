import React from 'react';
import LoginForms from './LoginForms';

const Login: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-700 to-purple-950 py-12 px-4 sm:px-6 lg:px-8">
            <LoginForms />
        </div>
    );
};

export default Login;
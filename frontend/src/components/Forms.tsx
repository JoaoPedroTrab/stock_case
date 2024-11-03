import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Form: React.FC<FormProps> = ({ children, onSubmit, ...props }) => {
    return (
        <form className="mt-8 space-y-6" onSubmit={onSubmit} {...props}>
            {children}
        </form>
    );
};

export default Form
import React from 'react';

// Definisikan jenis varian tombol
const buttonVariants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
};

// Definisikan jenis ukuran tombol
const buttonSizes = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-md',
    large: 'py-3 px-5 text-lg',
};

const Button = ({
                    variant = 'primary',
                    size = 'medium',
                    onClick,
                    children,
                    isLoading = false,
                    className = '',
                }) => {
    const variantClass = buttonVariants[variant] || buttonVariants.primary;
    const sizeClass = buttonSizes[size] || buttonSizes.medium;

    return (
        <button
            onClick={onClick}
            className={`rounded-lg transition duration-200 ease-in-out ${variantClass} ${sizeClass} ${className} flex items-center justify-center`}
            disabled={isLoading}
        >
            {isLoading && (
                <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;

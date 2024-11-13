// app/error.js
"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
    // Log error ke konsol (opsional)
    useEffect(() => {
        console.error("An error occurred:", error);
    }, [error]);

    return (
        <div className="h-screen flex flex-col items-center justify-center text-center space-y-4">
            <h2 className="text-2xl font-semibold text-red-600">Oops! Something went wrong.</h2>
            <p className="text-gray-700">
                {error.message || "An unexpected error has occurred. Please try again later."}
            </p>
            <button
                onClick={reset} // Memanggil reset() untuk mencoba lagi
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Try Again
            </button>
        </div>
    );
}

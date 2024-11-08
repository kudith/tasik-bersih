"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUserCheck } from "react-icons/fa";

export default function ThanksComponent({ isOpen, onClose }) {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 10000); // 10 seconds

            const countdownInterval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            return () => {
                clearTimeout(timer);
                clearInterval(countdownInterval);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full max-w-md p-6"
            >
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <FaUserCheck className="w-16 h-16 text-green-500 mx-auto" />
                        <CardTitle className="text-2xl font-bold mt-4">Thank You!</CardTitle>
                        <CardDescription className="text-gray-600 mt-2">Your registration was successful.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-700">We appreciate your willingness to volunteer with us. Together, we can make a difference!</p>
                        <p className="text-gray-500 text-xs mt-2">You will be redirected to the home page in {countdown} seconds.</p>
                    </CardContent>
                    <CardFooter className="text-center">
                        <Button onClick={onClose} className="w-full mt-4">
                            Back to Home
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
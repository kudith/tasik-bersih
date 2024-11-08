"use client";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUserCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ThanksPage() {
    const router = useRouter();

    const handleBackToHome = () => {
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-6 shadow-lg">
                <CardHeader className="text-center">
                    <FaUserCheck className="w-16 h-16 text-green-500 mx-auto" />
                    <CardTitle className="text-2xl font-bold mt-4">Thank You!</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">Your registration was successful.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-gray-700">We appreciate your willingness to volunteer with us. Together, we can make a difference!</p>
                </CardContent>
                <CardFooter className="text-center">
                    <Button onClick={handleBackToHome} className="w-full mt-4">
                        Back to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

import { donationSchema } from "@/lib/formschema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

export function DonationForm() {
    const [selectedAmount, setSelectedAmount] = useState(0); // Start with 0 to avoid uncontrolled warning
    const [token, setToken] = useState(null);
    const form = useForm({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            donationAmount: selectedAmount,
            fullName: "",
            phoneNumber: "",
            email: "",
            isAnonymous: false, // Ensure this field is controlled
        },
        mode: "onChange",
    });

    const { handleSubmit, setValue, formState: { errors } } = form;

    const onSubmit = async (data) => {
        const nameToDisplay = data.isAnonymous ? "Anonymous" : data.fullName;

        try {
            // Kirim transaksi ke Midtrans
            const midtransResponse = await fetch('/api/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    donationAmount: data.donationAmount,
                    fullName: nameToDisplay,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                }),
            });

            const midtransResult = await midtransResponse.json();

            if (midtransResponse.ok) {
                // Set token jika perlu
                setToken(midtransResult.token);

                // Wait for payment confirmation before saving to Strapi
                const script = document.createElement('script');
                script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
                script.onload = async () => {
                    window.snap.pay(midtransResult.token, {
                        onSuccess: async function (result) {
                            console.log("Payment successful!");

                            // Save data to Strapi only if payment is successful
                            const strapiResponse = await fetch('http://localhost:1337/api/donations', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                                },
                                body: JSON.stringify({
                                    data: {
                                        full_name: nameToDisplay,
                                        phone_number: data.phoneNumber,
                                        email: data.email,
                                        date: new Date().toISOString(),
                                        amount: data.donationAmount,
                                        is_anonymous: data.isAnonymous,
                                    }
                                }),
                            });

                            const strapiResult = await strapiResponse.json();

                            if (strapiResponse.ok) {
                                alert('Transaction successful and data saved to Strapi!');
                            } else {
                                console.error('Failed to save transaction data to Strapi:', strapiResult);
                                alert('Transaction successful, but failed to save data to Strapi.');
                            }
                        },
                        onPending: function (result) {
                            alert("Waiting for your payment!");
                        },
                        onError: function (result) {
                            alert("Payment failed!");
                        },
                        onClose: function () {
                            alert("Payment modal closed!");
                        }
                    });
                };
                document.body.appendChild(script);
            } else {
                alert(midtransResult.error || 'Failed to create transaction with Midtrans');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the transaction');
        }
    };

    const handleSelectAmount = (amount) => {
        setSelectedAmount(amount);
        setValue("donationAmount", amount, { shouldValidate: true });
    };

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/IDR\s*/i, ''); // Remove 'IDR' from input
        const numberValue = Number(value.replace(/,/g, '')); // Remove commas for number conversion

        setSelectedAmount(0); // Reset to 0 when input changes

        if (!isNaN(numberValue) && numberValue >= 0) {
            setValue("donationAmount", numberValue, { shouldValidate: true });
        } else {
            setValue("donationAmount", 0); // Default back to 0 if invalid
        }
    };

    useEffect(() => {
        if (token) {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
            script.onload = () => {
                window.snap.pay(token, {
                    onSuccess: function (result) {
                        alert("Payment successful!");
                    },
                    onPending: function (result) {
                        alert("Waiting for your payment!");
                    },
                    onError: function (result) {
                        alert("Payment failed!");
                    },
                    onClose: function () {
                        alert("Payment modal closed!");
                    }
                });
            };
            document.body.appendChild(script);
        }
    }, [token]);

    return (
        <div className="flex md:px-0 px-4 items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-xl p-4 shadow-lg">
                <CardHeader>
                    <CardTitle>Contribute Now</CardTitle>
                    <CardDescription>Make a difference today</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Full Name Field */}
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your full name"
                                                {...field}
                                                disabled={form.watch('isAnonymous')}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Anonymous Checkbox */}
                            <FormField
                                control={form.control}
                                name="isAnonymous"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel htmlFor="anonymous" className="text-sm">
                                            Donate as Anonymous
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />

                            {/* Phone Number Field */}
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                {...field}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter your email address"
                                                {...field}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Preset Donation Amount Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                {["10000", "20000", "50000", "75000", "100000"].map((amount) => (
                                    <Button
                                        key={amount}
                                        type="button"
                                        onClick={() => handleSelectAmount(Number(amount))}
                                        className={`${
                                            selectedAmount === Number(amount) ? "bg-black text-white" : "bg-gray-200 text-black hover:text-gray-200"
                                        } py-2`}
                                    >
                                        IDR {parseInt(amount).toLocaleString()}
                                    </Button>
                                ))}
                            </div>

                            {/* Custom Donation Amount Input */}
                            <FormField
                                control={form.control}
                                name="donationAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custom Donation Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text" // Changed to text to allow for custom formatting
                                                placeholder="Enter a custom amount (IDR)"
                                                value={`IDR ${field.value.toLocaleString()}`} // Format the value to show "IDR"
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button type="submit" className="w-full">
                                Donate Now
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

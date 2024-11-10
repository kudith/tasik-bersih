"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import { donationSchema } from "@/lib/formschema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {LoadingModal} from "@/components/ui/LoadingModal";

const DonationForm = React.memo(() => {
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [token, setToken] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donationAmount: selectedAmount,
      fullName: "",
      phoneNumber: "",
      email: "",
      isAnonymous: false,
    },
    mode: "onChange",
  });

  const { handleSubmit, setValue, formState: { errors, isValid } } = form;

  const onSubmit = useCallback(async (data) => {
    setIsLoading(true);
    const nameToDisplay = data.isAnonymous ? "Anonymous" : data.fullName;

    try {
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
        setToken(midtransResult.token);

        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
        script.onload = async () => {
          setIsLoading(false);
          window.snap.pay(midtransResult.token, {
            onSuccess: async function (result) {
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
                console.log('Transaction successful and data saved to Strapi!');
                await fetch('/api/confirmationDonateMail', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: data.email,
                    fullName: nameToDisplay,
                    donationAmount: data.donationAmount,
                    date: new Date().toISOString(),
                  }),
                });
              } else {
                console.error('Failed to save transaction data to Strapi:', strapiResult);
                console.log('Transaction successful, but failed to save data to Strapi.');
              }
            },
            onPending: function (result) {
              console.log("Waiting for your payment!");
            },
            onError: function (result) {
              console.log("Payment failed!");
            },
            onClose: function () {
              console.log("Payment modal closed!");
            }
          });
        };
        document.body.appendChild(script);
      } else {
        console.log(midtransResult.error || 'Failed to create transaction with Midtrans');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('An error occurred while processing the transaction');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectAmount = useCallback((amount) => {
    setSelectedAmount(amount);
    setValue("donationAmount", amount, { shouldValidate: true });
  }, [setValue]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value.replace(/IDR\s*/i, '');
    const numberValue = Number(value.replace(/,/g, ''));

    setSelectedAmount(0);

    if (!isNaN(numberValue) && numberValue >= 0) {
      setValue("donationAmount", numberValue, { shouldValidate: true });
    } else {
      setValue("donationAmount", 0);
    }
  }, [setValue]);

  const handleConfirm = useCallback(async (data) => {
    setIsDialogOpen(false);
    setIsLoading(true);
    await onSubmit(data);
  }, [onSubmit]);

  return (
    <motion.div
      className="flex md:px-0 px-4 items-center justify-center min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-xl p-4 shadow-lg">
        <CardHeader>
          <CardTitle>Contribute Now</CardTitle>
          <CardDescription>Make a difference today</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="donationAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Donation Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter a custom amount (IDR)"
                        value={`IDR ${field.value.toLocaleString()}`}
                        onChange={handleInputChange}
                        className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    className={`w-full ${!isValid ? 'cursor-not-allowed' : ''}`}
                    onClick={() => setIsDialogOpen(true)}
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Please wait
                      </>
                    ) : (
                      "Donate Now"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Donation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit this donation?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit(handleConfirm)}>
                      {isLoading ? (
                        <Button disabled>
                          <Loader2 className="animate-spin" />
                          Please wait
                        </Button>
                      ) : (
                        "Confirm"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </Form>
        </CardContent>
      </Card>
      <LoadingModal isOpen={isLoading} />
    </motion.div>
  );
});

export default DonationForm;
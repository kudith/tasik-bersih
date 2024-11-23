"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, ArrowLeft, Check } from 'lucide-react';
import { useTranslation } from "react-i18next";

import { getContactUsSchema } from "@/lib/formschema";

const ContactForm = () => {
    const { t } = useTranslation('contact');
    const formSchema = getContactUsSchema(t);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    const onSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `${values.name} <${values.email}>`,
                    to: 'admin@kalangsaripride.social',
                    subject: `New message from ${values.name}`,
                    text: values.message,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            setIsSubmitted(true);
            toast({
                title: t("messageSent"),
                description: t("receivedMessage"),
            });
        } catch (error) {
            console.error("Failed to send email:", error);
            toast({
                title: t("error"),
                description: t("failedToSend"),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30
            }
        },
    };

    const successVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
    };

    return (
        <Card className="w-full max-w-md mx-auto my-40">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center">{t("contactUs")}</CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.div
                            key="form"
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -50, transition: { duration: 0.2 } }}
                            variants={formVariants}
                        >
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <motion.div variants={itemVariants}>
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("name")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={t("name")} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("email")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={t("email")} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("message")}</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder={t("message")} {...field} className="min-h-[100px]" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {t("sending")}
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    {t("sendMessage")}
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            </Form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={successVariants}
                            className="text-center space-y-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                            >
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                    <Check className="h-10 w-10 text-green-600" />
                                </div>
                            </motion.div>
                            <h2 className="text-3xl font-bold">{t("thankYou")}</h2>
                            <p className="text-lg text-muted-foreground">{t("receivedMessage")}</p>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        form.reset();
                                    }}
                                    className="mt-4"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t("sendAnotherMessage")}
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}

export default ContactForm;
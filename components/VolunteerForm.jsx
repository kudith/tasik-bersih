"use client";
import {useState, useEffect, useCallback} from "react";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import ThanksComponent from "@/components/ui/thanks";
import {motion} from "framer-motion";
import {VolunteerBenefits} from "@/components/VolunteerBenefits";
import {useInView} from "react-intersection-observer";
import {useTranslation} from "react-i18next";
import {useCurrentLocale} from "next-i18n-router/client";
import i18nConfig from "@/i18nConfig";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Send} from "lucide-react";

export function VolunteerForm() {
    const [events, setEvents] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isThanksOpen, setIsThanksOpen] = useState(false);
    const [formData, setFormData] = useState(null);
    const {t} = useTranslation();
    const locale = useCurrentLocale(i18nConfig);
    const form = useForm({
        defaultValues: {
            fullName: "",
            groupName: "",
            groupSize: "",
            address: "",
            phoneNumber: "",
            email: "",
            motivation: "",
            event: "",
        },
        mode: "onChange",
    });

    const {handleSubmit, setValue, formState: {isValid}, reset} = form;

    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/events?locale=${locale}&populate=*`);
            const data = await response.json();
            setEvents(data.data);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }, [locale]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const onSubmit = useCallback(async (data) => {
        setIsLoading(true);

        try {
            const payload = {
                data: {
                    registrationType: data.groupName ? "group" : "individual",
                    fullName: data.groupName ? "" : data.fullName,
                    groupName: data.groupName || "",
                    groupSize: data.groupName ? data.groupSize : 0,
                    address: data.address,
                    email: data.email,
                    event: data.event,
                    motivation: data.motivation,
                    phoneNumber: data.phoneNumber,
                }
            };

            // Submit to Strapi
            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/volunteers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Get event details for email
                const selectedEvent = events.find(event => event.event_name === data.event);
                if (!selectedEvent) {
                    throw new Error('Selected event not found');
                }

                // Send confirmation email
                const emailPayload = {
                    email: data.email,
                    fullName: data.groupName || data.fullName,
                    event: data.event,
                    date: selectedEvent.date,
                    time: selectedEvent.time || "09:00",
                    location: selectedEvent.location || "Kalangsari",
                    imageUrl: selectedEvent.poster?.url || "https://via.placeholder.com/600x400?text=Event+Image"
                };

                const emailResponse = await fetch('/api/sendConfirmationEmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailPayload),
                });

                if (!emailResponse.ok) {
                    console.error('Failed to send confirmation email');
                }

                setIsThanksOpen(true);
            } else {
                alert('Failed to register volunteer. Check console for details.');
            }
        } catch (error) {
            console.error('Error in onSubmit function:', error);
            alert('An error occurred while registering the volunteer.');
        } finally {
            setIsLoading(false);
        }
    }, [events]);

    const handleConfirm = useCallback(async () => {
        setIsDialogOpen(false);
        if (formData) await onSubmit(formData);
    }, [formData, onSubmit]);

    const handleSaveData = useCallback((data) => {
        setFormData(data);
        setIsDialogOpen(true);
    }, []);

    const handleCloseThanks = useCallback(() => {
        setIsThanksOpen(false);
        window.location.reload();
    }, []);

    const {ref, inView} = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        reset();
    }, [reset]);

    return (
        <div id="volunteer"
             className="flex flex-col md:flex-row items-start justify-start max-w-7xl mx-auto md:px-0 px-4 overflow-hidden">
            <motion.div
                ref={ref}
                initial={{opacity: 0, x: -50}}
                animate={inView ? {opacity: 1, x: 0} : {}}
                exit={{opacity: 0, x: -50}}
                transition={{duration: 0.6, ease: "easeInOut"}}
                className="w-full max-w-xl p-4"
            >
                <Tabs defaultValue="individual" className="w-full"
                      onValueChange={() => reset()}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual"
                                     className="data-[state=active]:bg-black data-[state=active]:text-white">
                            {t("individual")}
                        </TabsTrigger>
                        <TabsTrigger value="group"
                                     className="data-[state=active]:bg-black data-[state=active]:text-white">
                            {t("group")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="individual">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>{t("individual_registration")}</CardTitle>
                                <CardDescription>{t("join_us_and_make_a_difference")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={handleSubmit(onSubmit)}
                                          className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("full_name")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_full_name")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("address")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_address")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("phone_number")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="tel"
                                                            placeholder={t("enter_phone_number")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("email")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder={t("enter_email")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="motivation"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("motivation")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_motivation")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="event"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("select_event")}</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger
                                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded">
                                                                <SelectValue
                                                                    placeholder={t("select_event")}/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {events.map((event) => (
                                                                    <SelectItem
                                                                        key={event.id}
                                                                        value={event.event_name}>
                                                                        {event.event_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <AlertDialog open={isDialogOpen}
                                                     onOpenChange={setIsDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    className={`w-full ${!isValid ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                    onClick={handleSubmit(handleSaveData)}
                                                >
                                                    <Send
                                                        className="mr-2 h-4 w-4"/>
                                                    {t("register_now")}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t("confirm_submission")}</AlertDialogTitle>
                                                    <AlertDialogDescription>{t("are_you_sure_submit")}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleConfirm}>{t("confirm")}</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <LoadingModal isOpen={isLoading}/>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="group">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>{t("group_registration")}</CardTitle>
                                <CardDescription>{t("join_us_and_make_a_difference")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={handleSubmit(onSubmit)}
                                          className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="groupName"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("group_name")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_group_name")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="groupSize"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("group_size")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder={t("enter_group_size")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("address")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_address")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("phone_number")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="tel"
                                                            placeholder={t("enter_phone_number")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("email")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder={t("enter_email")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="motivation"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("motivation")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_motivation")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="event"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("select_event")}</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger
                                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded">
                                                                <SelectValue
                                                                    placeholder={t("select_event")}/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {events.map((event) => (
                                                                    <SelectItem
                                                                        key={event.id}
                                                                        value={event.event_name}>
                                                                        {event.event_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <AlertDialog open={isDialogOpen}
                                                     onOpenChange={setIsDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    className={`w-full ${!isValid ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                    onClick={handleSubmit(handleSaveData)}
                                                >
                                                    <Send
                                                        className="mr-2 h-4 w-4"/>
                                                    {t("register_now")}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t("confirm_submission")}</AlertDialogTitle>
                                                    <AlertDialogDescription>{t("are_you_sure_submit")}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleConfirm}>{t("confirm")}</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <LoadingModal isOpen={isLoading}/>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>
            <VolunteerBenefits/>
            <ThanksComponent isOpen={isThanksOpen} onClose={handleCloseThanks}/>
        </div>
    );
}
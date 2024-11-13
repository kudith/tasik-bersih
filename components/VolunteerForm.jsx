"use client";
import {useState, useEffect, useCallback} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {volunteerSchema} from "@/lib/formschema";
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
    CardDescription
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
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
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {LoadingModal} from "@/components/ui/LoadingModal";
import ThanksComponent from "@/components/ui/thanks";
import {motion} from "framer-motion";
import {VolunteerBenefits} from "@/components/VolunteerBenefits";
import {useInView} from "react-intersection-observer";
import {useTranslation} from "react-i18next";
import {useCurrentLocale} from "next-i18n-router/client";
import i18nConfig from "@/i18nConfig";

export function VolunteerForm() {
    const [events, setEvents] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isThanksOpen, setIsThanksOpen] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(null);
    const {t} = useTranslation();
    const locale = useCurrentLocale(i18nConfig);
    const form = useForm({
        resolver: zodResolver(volunteerSchema),
        defaultValues: {
            registrationType: "",
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

    const {handleSubmit, watch, setValue, formState: {errors, isValid}} = form;
    const registrationType = watch("registrationType");

    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/events?locale=${locale}&populate=*`);
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            setEvents(data.data);
        } catch (error) {
            setError(error.message);
        }
    }, [locale]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        if (registrationType === "individual") {
            setValue("fullName", "", {shouldValidate: true});
            setValue("groupName", "", {shouldValidate: true});
            setValue("groupSize", "", {shouldValidate: true});
        } else if (registrationType === "group") {
            setValue("fullName", "", {shouldValidate: true});
            setValue("groupName", "", {shouldValidate: true});
            setValue("groupSize", "1", {shouldValidate: true});
        }
    }, [registrationType, setValue]);

    const onSubmit = useCallback(async (data) => {
        console.log("Form data submitted:", data);

        setIsLoading(true); // Show the loading dialog

        try {
            const selectedEvent = events.find(event => event.event_name === data.event);
            if (!selectedEvent) {
                alert("Selected event not found.");
                return;
            }

            const payload = {
                data: {
                    registrationType: data.registrationType,
                    fullName: data.registrationType === "individual" ? data.fullName : "",
                    groupName: data.registrationType === "group" ? data.groupName : "",
                    groupSize: data.registrationType === "group" ? data.groupSize : 0,
                    address: data.address,
                    email: data.email,
                    event: data.event,
                    motivation: data.motivation,
                    phoneNumber: data.phoneNumber,
                }
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/volunteers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                const imageUrl = selectedEvent.image && selectedEvent.image.length > 0 ? selectedEvent.image[0].url : null;
                await fetch('/api/sendConfirmationEmail', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        email: data.email,
                        fullName: data.fullName || data.groupName,
                        event: data.event,
                        date: selectedEvent.date,
                        time: selectedEvent.time,
                        location: selectedEvent.location,
                        imageUrl: imageUrl,
                    }),
                });
                setIsThanksOpen(true); // Show the thanks modal
            } else {
                alert('Failed to register volunteer. Check console for details.');
            }
        } catch (error) {
            console.error('Error in onSubmit function:', error);
            alert('An error occurred while registering the volunteer.');
        } finally {
            setIsLoading(false); // Hide the loading dialog
        }
    }, [events]);

    const handleConfirm = useCallback(async () => {
        setIsDialogOpen(false); // Close the confirmation dialog
        if (formData) await onSubmit(formData); // Submit the stored formData
    }, [formData, onSubmit]);

    const handleSaveData = useCallback((data) => {
        setFormData(data); // Store data temporarily
        setIsDialogOpen(true); // Open the confirmation dialog
    }, []);

    const handleCloseThanks = useCallback(() => {
        setIsThanksOpen(false);
    }, []);

    const {ref, inView} = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    if (error) return <p>Error loading events: {error}</p>;

    return (
        <div id="volunteer"
             className="flex flex-col md:flex-row items-center justify-start max-w-7xl mx-auto md:px-0 px-4 overflow-hidden">
            <motion.div
                ref={ref}
                initial={{opacity: 0, x: -50}}
                animate={inView ? {opacity: 1, x: 0} : {}}
                exit={{opacity: 0, x: -50}}
                transition={{duration: 0.6, ease: "easeInOut"}}
                className="w-full max-w-xl p-4"
            >
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>{t("volunteer_registration")}</CardTitle>
                        <CardDescription>{t("join_us_and_make_a_difference")}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)}
                                  className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="registrationType"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t("registration_type")}</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}>
                                                    <SelectTrigger
                                                        className="w-full bg-gray-100 p-2 border border-gray-300 rounded">
                                                        <SelectValue
                                                            placeholder={t("select_registration_type")}/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="individual">{t("individual")}</SelectItem>
                                                        <SelectItem
                                                            value="group">{t("group")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {registrationType === "individual" && (
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{t("full_name")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t("enter_full_name")} {...field}
                                                        className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {registrationType === "group" && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="groupName"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{t("group_name")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("enter_group_name")} {...field}
                                                            className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
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
                                                        <Input type="number"
                                                               placeholder={t("enter_group_size")} {...field}
                                                               className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t("address")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("enter_address")} {...field}
                                                    className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
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
                                                <Input type="tel"
                                                       placeholder={t("enter_phone_number")} {...field}
                                                       className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
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
                                                <Input type="email"
                                                       placeholder={t("enter_email")} {...field}
                                                       className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
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
                                                    className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
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
                                                    value={field.value}>
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
                                        <Button type="button"
                                                className={`w-full ${!isValid ? 'cursor-not-allowed' : ''}`}
                                                onClick={handleSubmit(handleSaveData)}
                                                disabled={!isValid}>
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
            </motion.div>
            <VolunteerBenefits/>
            <ThanksComponent isOpen={isThanksOpen} onClose={handleCloseThanks}/>
        </div>
    );
}
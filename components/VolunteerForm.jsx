"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { volunteerSchema } from "@/lib/formschema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function VolunteerForm() {
    const [events, setEvents] = useState([]);
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

    const { handleSubmit, watch, setValue, setError, formState: { errors } } = form;
    const registrationType = watch("registrationType");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/events-api?populate=*`);
                const data = await response.json();
                console.log(data.data)
                console.log(data.data[0].image.url);
                setEvents(data.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        if (registrationType === "individual") {
            setValue("fullName", "", { shouldValidate: true });
            setValue("groupName", "", { shouldValidate: true });
            setValue("groupSize", "", { shouldValidate: true });
        } else if (registrationType === "group") {
            setValue("fullName", "", { shouldValidate: true });
            setValue("groupName", "", { shouldValidate: true });
            setValue("groupSize", "1", { shouldValidate: true });
        }
    }, [registrationType, setValue]);




    const onSubmit = async (data) => {
        console.log("Form data submitted:", data);

        try {
            // Find the selected event details
            const selectedEvent = events.find(event => event.event_name === data.event);
            console.log("Selected event:", selectedEvent);

            if (!selectedEvent) {
                console.warn("Selected event not found.");
                alert("Selected event not found.");
                return;
            }

            // Check if image and formats are defined
            const eventImage = selectedEvent.image;
            console.log("Event image object:", eventImage);

            const imageUrl = eventImage
                ? (eventImage.formats?.large?.url || eventImage.url)
                : null;

            if (!imageUrl) {
                console.warn("Image URL not found. Image object or format may be undefined.");
            } else {
                console.log("Image URL:", imageUrl);
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

            // Save data to Strapi
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
                alert('Volunteer registration successful!');

                // Trigger the confirmation email
                await fetch('/api/sendConfirmationEmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: data.email,
                        fullName: data.fullName || data.groupName,
                        event: data.event,
                        date: selectedEvent.date,
                        time: selectedEvent.time,
                        location: selectedEvent.location,
                        imageUrl: imageUrl
                    }),
                });
            } else {
                console.error('Error response from Strapi:', responseData);
                alert('Failed to register volunteer. Check console for details.');
            }
        } catch (error) {
            console.error('Error in onSubmit function:', error);
            alert('An error occurred while registering the volunteer.');
        }
    };









    return (
        <div className="flex md:px-0 px-4 items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-xl p-4 shadow-lg">
                <CardHeader>
                    <CardTitle>Volunteer Registration</CardTitle>
                    <CardDescription>Join us and make a difference</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Registration Type Field */}
                            <FormField
                                control={form.control}
                                name="registrationType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registration Type</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            >
                                                <option value="">Select registration type</option>
                                                <option value="individual">Individual</option>
                                                <option value="group">Group</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Conditional Fields */}
                            {registrationType === "individual" && (
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
                                                    className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {registrationType === "group" && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="groupName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Group Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your group name"
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
                                        name="groupSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Group Size</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter the number of people in your group"
                                                        {...field}
                                                        className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Address Field */}
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your address"
                                                {...field}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            />
                                        </FormControl>
                                        <FormMessage />
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

                            {/* Motivation Field */}
                            <FormField
                                control={form.control}
                                name="motivation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motivation</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Why do you want to join?"
                                                {...field}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Event Selection Field */}
                            <FormField
                                control={form.control}
                                name="event"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Event</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="w-full bg-gray-100 p-2 border border-gray-300 rounded"
                                            >
                                                <option value="">Select an event</option>
                                                {events.map((event) => (
                                                    <option key={event.id} value={event.event_name}>
                                                        {event.event_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button type="submit" className="w-full">
                                Register Now
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
"use client";
import {useState, useCallback} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {reportSchema} from "@/lib/formschema";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
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
import {useTranslation} from "react-i18next";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {CalendarIcon, Trash2} from "lucide-react";
import {format} from "date-fns";
import {cn} from "@/lib/utils";

export function ReportPolluted() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isThanksOpen, setIsThanksOpen] = useState(false);
    const [formData, setFormData] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const {t} = useTranslation();
    const form = useForm({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            email: "",
            reportDestinationAddress: "",
            reportDestinationName: "",
            reportActualDate: "",
            description: "",
            images: [],
        },
        mode: "onChange",
    });

    const {handleSubmit, formState: {errors, isValid}} = form;


    const onSubmit = useCallback(async (data) => {
        setIsLoading(true);

        try {
            // Step 1: Upload images to Strapi
            const imageUploadPromises = data.images.map(async (image) => {
                const formData = new FormData();
                formData.append('files', image);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                    },
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadResponse.json();
                // Return the ID of the uploaded image, not the URL or name
                return uploadData[0].id;
            });

            // Wait for all images to be uploaded
            const uploadedImageIds = await Promise.all(imageUploadPromises);

            // Step 2: Submit the report data with uploaded image IDs
            const formattedData = {
                data: {
                    full_name: data.fullName,
                    email: data.email,
                    phone_number: data.phoneNumber,
                    date: data.reportActualDate,
                    report_destination_address: data.reportDestinationAddress,
                    report_destination_name: data.reportDestinationName,
                    descriptions: data.description,
                    // Use the image IDs instead of URL and name
                    images: uploadedImageIds.map(id => ({ id }))
                }
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reports?populate=*`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (response.ok) {
                setIsThanksOpen(true);
            } else {
                const errorData = await response.json();
                console.error('Error Response Data:', errorData);
                alert('Failed to submit report. Check console for details.');
            }
        } catch (error) {
            console.error('Error in onSubmit function:', error);
            alert('An error occurred while submitting the report.');
        } finally {
            setIsLoading(false);
        }
    }, []);


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


    const handleImageChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            id: URL.createObjectURL(file),
            file,
        }));

        // Add new images to both previews and form values
        setImagePreviews((prev) => [...prev, ...newImages]);
        form.setValue(
            "images",
            [...form.getValues("images"), ...files],
            { shouldValidate: true }
        );

        console.log('form.getValues("images"):', form.getValues("images"));
    }, [form]);

    const handleRemoveImage = useCallback((id) => {
        // Find the image to be removed based on the object URL
        const imageToRemove = imagePreviews.find((image) => image.id === id);
        if (!imageToRemove) return;

        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(id);

        // Update image previews
        setImagePreviews((prev) => prev.filter((image) => image.id !== id));

        // Remove the file from the form's "images" field
        const updatedImages = form
            .getValues("images")
            .filter((imageFile) => imageFile !== imageToRemove.file);
        form.setValue("images", updatedImages, { shouldValidate: true });

        console.log('Updated images:', updatedImages);
    }, [form, imagePreviews]);



    return (
        <div id="report-polluted"
             className="flex flex-col items-center justify-start max-w-7xl mx-auto px-4 overflow-hidden">
            <Card className="shadow-lg w-full my-20 max-w-xl p-4">
                <CardHeader>
                    <CardTitle>{t("report_polluted_area")}</CardTitle>
                    <CardDescription>{t("help_us_keep_the_environment_clean")}</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)}
                              className="space-y-4">
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t("full_name")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("enter_full_name")} {...field}
                                                    value={field.value || ""}
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
                                            <FormLabel>{t("phone_number")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="tel"
                                                       placeholder={t("enter_phone_number")} {...field}
                                                       value={field.value || ""}
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
                                            <FormLabel>{t("email")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="email"
                                                       placeholder={t("enter_email")} {...field}
                                                       value={field.value || ""}
                                                       className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reportDestinationAddress"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t("report_destination_address")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("enter_report_destination_address")} {...field}
                                                    value={field.value || ""}
                                                    className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reportDestinationName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t("report_destination_name")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t("enter_report_destination_name")} {...field}
                                                    value={field.value || ""}
                                                    className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reportActualDate"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t("report_actual_date")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon/>
                                                            {field.value ? format(new Date(field.value), "PPP") :
                                                                <span>{t("pick_a_date")}</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({field}) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>{t("description")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t("enter_description")} {...field}
                                                    value={field.value || ""}
                                                    className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({field}) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>{t("upload_image")}<span
                                                className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="file"
                                                       accept="image/*" multiple
                                                       onChange={handleImageChange}
                                                       className="w-full bg-gray-100 p-2 border border-gray-300 rounded"/>
                                            </FormControl>
                                            <FormMessage/>
                                            <div
                                                className="mt-4 grid grid-cols-2 gap-4">
                                                {imagePreviews.map((image, index) => (
                                                    <div key={index}
                                                         className="relative">
                                                        <img src={image.id}
                                                             alt={`Preview ${index}`}
                                                             className="w-full h-auto rounded"/>
                                                        <button type="button"
                                                                onClick={() => handleRemoveImage(image.id)}
                                                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                                                            <Trash2
                                                                className="w-4 h-4 text-red-600"/>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <AlertDialog open={isDialogOpen}
                                         onOpenChange={setIsDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button type="button"
                                            className={`w-full ${!isValid ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            onClick={handleSubmit(handleSaveData)}>
                                        {t("submit_report")}
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
            <ThanksComponent isOpen={isThanksOpen} onClose={handleCloseThanks}/>
        </div>
    );
}
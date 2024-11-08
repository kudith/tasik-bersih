// components/LoadingModal.jsx
"use client";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {PuffLoader} from "react-spinners";

export function LoadingModal({isOpen}) {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="flex items-center justify-center">
                <AlertDialogHeader>
                    <AlertDialogTitle></AlertDialogTitle>
                    <AlertDialogDescription
                        className="flex flex-col items-center">
                        <PuffLoader size={48} color="#000000"/>
                        <div className="mt-4 text-lg font-semibold text-black">
                            <span>Please wait </span>
                            <span
                                className="inline-block animate-bounce">.</span>
                            <span
                                className="inline-block animate-bounce delay-200">.</span>
                            <span
                                className="inline-block animate-bounce delay-400">.</span>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    );
}
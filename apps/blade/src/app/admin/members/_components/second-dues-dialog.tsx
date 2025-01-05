"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@forge/ui/dialog"
import { Button } from "@forge/ui/button";
import { Input } from "@forge/ui/input";
import { useState } from "react";
import FinalDuesDialogButton from "./final-dues-dialog";
import { toast } from "@forge/ui/toast";

export default function SecondClearDuesDialogButton(
    {
        setFirstOpen,
    }: 
    {
        firstOpen: boolean,
        setFirstOpen: (value: boolean) => void;
    }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [confirmText, setConfirmText] = useState<string>("");

    const handlePaste = (e) => {
        e.preventDefault();
        toast.info("Please type in the text, do not paste.");
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    Continue
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Are you really sure?
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-md">
                    <div className="space-y-4 py-2">
                        <p>
                            <b className="text-red-500">
                                Are you really sure?
                            </b> {" "}
                            Please keep in mind, this is {" "}
                            <b className="text-red-500">NOT</b> {" "}
                            for deleting a member, event, or for toggling dues.
                            This <b className="text-red-500">CLEARS ALL DUES.</b> {" "}
                            If you would still like to proceed, type: {" "}
                            <p><b>
                                "I am absolutely sure that I would like to clear all dues."
                            </b></p>
                        </p>
                        <Input
                            placeholder='Type "I am absolutely sure that I would like to clear all dues."'
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            onPaste={handlePaste}
                        />
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsOpen(false);
                            setFirstOpen(false);
                            setConfirmText("");
                        }}
                    >
                        Cancel
                    </Button>
                    <FinalDuesDialogButton 
                        disabled={confirmText !== 
                            "I am absolutely sure that I would like to clear all dues."
                        }
                        setFirstOpen={setFirstOpen}
                        setSecondOpen={setIsOpen}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
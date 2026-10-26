"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GuestAuthPromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function GuestAuthPrompt({
  open,
  onOpenChange,
}: GuestAuthPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log in to continue</DialogTitle>
          <DialogDescription>
            Please log in or create an account to continue with this action. You
            can still browse pets and find matches as a guest.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            Maybe later
          </DialogClose>
          <Link
            href="/register"
            className={buttonVariants({ variant: "default" })}
          >
            Register
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "default" })}>
            Log in
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

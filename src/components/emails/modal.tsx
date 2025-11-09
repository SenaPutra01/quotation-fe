"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendTransactionEmailAction } from "@/actions/send-email-action";

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "quotation" | "purchase-order" | "delivery-order" | "invoice";
  number: string;
  defaultSubject?: string;
  defaultMessage?: string;
  onSuccess?: () => void;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  type,
  number,
  defaultSubject,
  defaultMessage,
  onSuccess,
}: SendEmailDialogProps) {
  const [form, setForm] = useState({
    to: "",
    cc: "",
    subject: defaultSubject || `${type.toUpperCase()} ${number}`,
    message: defaultMessage || `Berikut lampiran ${type} Anda.`,
  });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.to || !form.subject || !form.message) {
      alert("Mohon isi semua field wajib (To, Subject, dan Message)");
      return;
    }

    try {
      setSending(true);
      await sendTransactionEmailAction({
        type,
        to: form.to,
        cc: form.cc,
        subject: form.subject,
        message: form.message,
        number,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error sending email:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send {type.replace("-", " ")} Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          <Input
            placeholder="To"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          />
          <Input
            placeholder="CC (optional)"
            value={form.cc}
            onChange={(e) => setForm({ ...form, cc: e.target.value })}
          />
          <Input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="min-h-[120px]"
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

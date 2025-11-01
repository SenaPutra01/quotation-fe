"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";

/**
 * @param type
 * @param payload
 */
export async function sendTransactionEmailAction({
  type,
  to,
  cc,
  subject,
  message,
  number,
}: {
  type: "quotation" | "purchase-order" | "delivery-order" | "invoice";
  to: string;
  cc?: string;
  subject: string;
  message: string;
  number: string;
}) {
  try {
    const result = await serverApiService.sendTransactionEmail({
      type,
      to,
      cc,
      subject,
      message,
      number,
    });

    const tagMap: Record<string, string> = {
      quotation: "quotations",
      "purchase-order": "purchase-orders",
      "delivery-order": "delivery-orders",
      invoice: "invoices",
    };

    const tagToRevalidate = tagMap[type];
    if (tagToRevalidate) revalidateTag(tagToRevalidate);

    const successMessages: Record<string, string> = {
      quotation: `Quotation email for ${number} sent successfully`,
      "purchase-order": `Purchase Order email for ${number} sent successfully`,
      "delivery-order": `Delivery Order email for ${number} sent successfully`,
      invoice: `Invoice email for ${number} sent successfully`,
    };

    return {
      success: true,
      data: result.data || result,
      message: successMessages[type] || "Email sent successfully",
    };
  } catch (error) {
    console.error("Error sending transaction email:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send transaction email",
    };
  }
}

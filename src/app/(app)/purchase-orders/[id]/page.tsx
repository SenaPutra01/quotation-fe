"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCircleCheckFilled,
  IconLoader,
  IconDownload,
  IconArrowLeft,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { getPurchaseOrderDetailAction } from "@/actions/purchaseOrder-actions";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseOrderDetailAction(id);

      setPurchaseOrder(res?.data);
    } catch (error) {
      console.error("Failed to fetch purchase order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPurchaseOrderDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-muted-foreground">
        <IconLoader className="animate-spin mr-2" /> Loading purchase order
        details...
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <p className="text-center text-muted-foreground">
        Purchase Order not found.
      </p>
    );
  }

  const signature =
    purchaseOrder.signatures && purchaseOrder.signatures.length > 0
      ? purchaseOrder.signatures[0]
      : null;

  const signatureBase64 = signature?.file_data
    ? `data:image/png;base64,${Buffer.from(
        signature.file_data.replace(/^\\x/, ""),
        "hex"
      ).toString("base64")}`
    : null;

  return (
    <div className="mx-4 my-6">
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/purchase-orders")}
        >
          <IconArrowLeft size={16} className="mr-1" /> Back to Purchase Orders
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-4 border-b pb-4">
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">No. Purchase Order:</span>{" "}
                {purchaseOrder.po_number}
              </p>
              <p>
                <span className="font-semibold">Quotation No:</span>{" "}
                {purchaseOrder.quotation?.quotation_number || "-"}
              </p>
              <p>
                <span className="font-semibold">Project Name:</span>{" "}
                {purchaseOrder.project_name}
              </p>
              <p>
                <span className="font-semibold">Order Date:</span>{" "}
                {format(
                  new Date(purchaseOrder.order_date),
                  "EEEE, dd MMMM yyyy"
                )}
              </p>
              <p>
                <span className="font-semibold">Delivery Date:</span>{" "}
                {format(
                  new Date(purchaseOrder.delivery_date),
                  "EEEE, dd MMMM yyyy"
                )}
              </p>
              <p>
                <span className="font-semibold">Client:</span>{" "}
                {purchaseOrder.client?.company_name}
              </p>
              <p>
                <span className="font-semibold">Contact Person:</span>{" "}
                {purchaseOrder.client?.contact_person} (
                {purchaseOrder.client?.email})
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {purchaseOrder.client?.address}
              </p>
            </div>

            <div className="text-right">
              <img
                src="/logo.png"
                alt="Company Logo"
                className="h-16 mx-auto mb-1"
              />
              <p className="font-bold text-primary text-sm uppercase">
                PT. DIGITAL MORP TEKNOLOGI
              </p>
              <Badge
                variant="outline"
                className="text-muted-foreground flex items-center gap-1 px-2 py-1 mt-2 justify-center"
              >
                {purchaseOrder.status === "approved" ? (
                  <IconCircleCheckFilled className="fill-green-500" size={16} />
                ) : (
                  <IconLoader className="animate-spin" size={16} />
                )}
                {purchaseOrder.status}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full border text-sm">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="border p-2 w-10">No</th>
                  <th className="border p-2">Product Number</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2 text-right">QTY</th>
                  <th className="border p-2 text-right">Unit Price</th>
                  <th className="border p-2 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrder.items?.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{item.product_number}</td>
                    <td className="border p-2">{item.description}</td>
                    <td className="border p-2 text-right">{item.quantity}</td>
                    <td className="border p-2 text-right">
                      Rp {Number(item.unit_price).toLocaleString("id-ID")}
                    </td>
                    <td className="border p-2 text-right">
                      Rp {Number(item.total_price).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="text-sm space-y-1 w-64">
              <div className="flex justify-between">
                <span className="font-medium">SUBTOTAL</span>
                <span>
                  Rp {Number(purchaseOrder.subtotal).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">DISCOUNT</span>
                <span>
                  Rp{" "}
                  {Number(purchaseOrder.discount_amount).toLocaleString(
                    "id-ID"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">PPH</span>
                <span>
                  Rp {Number(purchaseOrder.tax_amount).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>GRAND TOTAL</span>
                <span className="text-primary font-bold">
                  Rp{" "}
                  {Number(purchaseOrder.total_amount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {purchaseOrder.terms?.length > 0 && (
            <div className="mt-8 text-sm">
              <h3 className="font-semibold mb-2 underline">
                Terms and Conditions
              </h3>
              <ul className="list-decimal list-inside space-y-1">
                {purchaseOrder.terms.map((term) => (
                  <li key={term.id}>{term.description}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 text-sm flex flex-col items-end">
            <p>
              Jakarta,{" "}
              {format(new Date(purchaseOrder.created_at), "dd MMMM yyyy")}
            </p>
            <p className="font-semibold mt-1">PT. DIGITAL MORP TEKNOLOGI</p>

            {signatureBase64 && (
              <img
                src={signatureBase64}
                alt="Signature"
                className="h-16 mt-2 mb-1"
              />
            )}

            <p className="font-semibold underline">
              {signature?.user_name || "Anasis"}
            </p>
            <p className="text-muted-foreground">
              {signature?.job_position || "Direktur & Sales Operation"}
            </p>
          </div>

          {purchaseOrder.attachments?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Attachments</h3>
              <ul className="space-y-2">
                {purchaseOrder.attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex justify-between items-center border p-2 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_type}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/uploads/${file.file_name}`, "_blank")
                      }
                    >
                      <IconDownload size={16} className="mr-1" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

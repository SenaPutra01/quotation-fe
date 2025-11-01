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
  IconTruck,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { getDeliveryOrderDetailAction } from "@/actions/deliveryOrder-action";

export default function DeliveryOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await getDeliveryOrderDetailAction(id);

      setDeliveryOrder(res?.data);
    } catch (error) {
      console.error("Failed to fetch delivery order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDeliveryOrderDetail();
  }, [id]);

  const formatSignatureImage = (fileData: string) => {
    if (!fileData) return null;
    try {
      if (fileData.startsWith("\\x")) {
        return `data:image/png;base64,${Buffer.from(
          fileData.replace(/^\\x/, ""),
          "hex"
        ).toString("base64")}`;
      } else {
        return `data:image/png;base64,${fileData}`;
      }
    } catch (error) {
      console.error("Error processing signature image:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-muted-foreground">
        <IconLoader className="animate-spin mr-2" /> Loading delivery order
        details...
      </div>
    );
  }

  if (!deliveryOrder) {
    return (
      <p className="text-center text-muted-foreground">
        Delivery Order not found.
      </p>
    );
  }

  return (
    <div className="mx-4 my-6">
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/delivery-orders")}
        >
          <IconArrowLeft size={16} className="mr-1" /> Back to Delivery Orders
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start flex-wrap gap-4 border-b pb-4">
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">No. Delivery Order:</span>{" "}
                {deliveryOrder.do_number}
              </p>
              <p>
                <span className="font-semibold">Purchase Order No:</span>{" "}
                {deliveryOrder.po_number || "-"}
              </p>
              <p>
                <span className="font-semibold">PO ID:</span>{" "}
                {deliveryOrder.po_id || "-"}
              </p>
              <p>
                <span className="font-semibold">Delivery Date:</span>{" "}
                {format(new Date(deliveryOrder.do_date), "EEEE, dd MMMM yyyy")}
              </p>
              <p>
                <span className="font-semibold">Client:</span>{" "}
                {deliveryOrder.client?.company_name || "-"}
              </p>
              <p>
                <span className="font-semibold">Contact Person:</span>{" "}
                {deliveryOrder.client?.contact_person || "-"}
                {deliveryOrder.client?.email && (
                  <> ({deliveryOrder.client.email})</>
                )}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {deliveryOrder.client?.phone || "-"}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {deliveryOrder.client?.address || "-"}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-center gap-2 mb-2">
                <IconTruck className="text-primary" size={24} />
                <img src="/logo.png" alt="Company Logo" className="h-12" />
              </div>
              <p className="font-bold text-primary text-sm uppercase">
                PT. DIGITAL MORP TEKNOLOGI
              </p>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 px-2 py-1 mt-2 justify-center ${
                  deliveryOrder.status === "completed"
                    ? "text-green-600 border-green-600"
                    : deliveryOrder.status === "draft"
                    ? "text-yellow-600 border-yellow-600"
                    : "text-blue-600 border-blue-600"
                }`}
              >
                {deliveryOrder.status === "completed" ? (
                  <IconCircleCheckFilled className="fill-green-500" size={16} />
                ) : (
                  <IconLoader className="animate-spin" size={16} />
                )}
                {deliveryOrder.status?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {deliveryOrder.notes && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Delivery Notes
              </h3>
              <p className="text-blue-700">{deliveryOrder.notes}</p>
            </div>
          )}

          {/* Delivery Items */}
          <div className="overflow-x-auto mt-6">
            <table className="w-full border text-sm">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="border p-2 w-10">No</th>
                  <th className="border p-2">Part Number</th>
                  <th className="border p-2">Item Name</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2 text-right">QTY</th>
                </tr>
              </thead>
              <tbody>
                {deliveryOrder.items?.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2 font-medium">
                      {item.part_number || "N/A"}
                    </td>
                    <td className="border p-2 font-medium">
                      {item.item_name || "N/A"}
                    </td>
                    <td className="border p-2">
                      {item.description || "No description"}
                    </td>
                    <td className="border p-2 text-right">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mt-4">
            <div className="text-sm space-y-1 w-64">
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Items Delivered</span>
                <span className="text-primary font-bold">
                  {deliveryOrder.items?.reduce(
                    (total, item) => total + (parseInt(item.quantity) || 0),
                    0
                  ) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* All Signatures Section - MENGGANTI section signatures individual */}
          {deliveryOrder.signatures && deliveryOrder.signatures.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold mb-6 text-xl text-center">
                Signatures
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {deliveryOrder.signatures.map((signature, index) => {
                  const signatureBase64 = formatSignatureImage(
                    signature.file_data
                  );
                  return (
                    <div
                      key={signature.id || index}
                      className="text-center space-y-4"
                    >
                      <div>
                        {signatureBase64 ? (
                          <img
                            src={signatureBase64}
                            alt={`${signature.user_name} Signature`}
                            className="h-32 mx-auto border rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-muted-foreground">
                              No Signature
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4">
                        <p className="font-bold text-lg">
                          {signature.user_name}
                        </p>
                        <p className="text-muted-foreground">
                          {signature.job_position}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Date:{" "}
                          {format(
                            new Date(deliveryOrder.do_date),
                            "dd/MM/yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t pt-6">
            <div>
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">DO Number:</span>{" "}
                  {deliveryOrder.do_number}
                </p>
                <p>
                  <span className="font-medium">Delivery Date:</span>{" "}
                  {format(new Date(deliveryOrder.do_date), "dd MMMM yyyy")}
                </p>
                <p>
                  <span className="font-medium">Created Date:</span>{" "}
                  {format(new Date(deliveryOrder.created_at), "dd MMMM yyyy")}
                </p>
                {deliveryOrder.updated_at && (
                  <p>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {format(new Date(deliveryOrder.updated_at), "dd MMMM yyyy")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Related Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">PO Number:</span>{" "}
                  {deliveryOrder.po_number || "-"}
                </p>
                <p>
                  <span className="font-medium">PO ID:</span>{" "}
                  {deliveryOrder.po_id || "-"}
                </p>
                <p>
                  <span className="font-medium">Client:</span>{" "}
                  {deliveryOrder.client?.company_name || "-"}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge
                    variant="outline"
                    className={`ml-1 ${
                      deliveryOrder.status === "completed"
                        ? "text-green-600 border-green-600"
                        : deliveryOrder.status === "draft"
                        ? "text-yellow-600 border-yellow-600"
                        : "text-blue-600 border-blue-600"
                    }`}
                  >
                    {deliveryOrder.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-8 border-t pt-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/delivery-orders/${deliveryOrder.id}/edit`)
              }
            >
              Edit Delivery Order
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <IconDownload size={16} className="mr-1" /> Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            font-size: 12pt;
            line-height: 1.4;
          }

          .container {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .grid {
            display: block !important;
          }

          .space-y-6 > * + * {
            margin-top: 1rem !important;
          }

          .card {
            border: 1px solid #000 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }

          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

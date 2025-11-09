"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconLoader } from "@tabler/icons-react";
import { getInvoiceDetailAction } from "@/actions/invoice-actions";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await getInvoiceDetailAction(params.id);
        if (res.success) {
          setInvoice(res.data);
        } else {
          console.error("Failed to fetch invoice:", res.message);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [params?.id]);

  const formatCurrency = (value: number | string) =>
    `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <IconLoader className="animate-spin mr-2" size={24} />
        <span>Loading invoice details...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/invoices")}
        >
          <IconArrowLeft size={16} className="mr-2" />
          Back to Invoices
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          Invoice Details
        </h1>
      </div>

      <Card className="shadow-md rounded-2xl border-teal-100">
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between border-b border-teal-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-teal-700">
                {invoice.invoice_number}
              </h2>
              <p className="text-sm text-gray-500">
                Date: {formatDate(invoice.invoice_date)}
              </p>
              <p className="text-sm text-gray-500">
                Status:{" "}
                <span className="font-medium capitalize">{invoice.status}</span>
              </p>
              {invoice.project_name && (
                <p className="text-sm text-gray-500">
                  Project: {invoice.project_name}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Payment Term: {invoice.payment_term}
              </p>
            </div>

            <div className="text-right">
              <h3 className="font-semibold text-gray-800">
                {invoice.client?.company_name}
              </h3>
              <p className="text-sm text-gray-600">
                {invoice.client?.contact_person}
              </p>
              <p className="text-sm text-gray-600">{invoice.client?.email}</p>
              <p className="text-sm text-gray-600">{invoice.client?.phone}</p>
              <p className="text-sm text-gray-600">{invoice.client?.address}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Invoice Items
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full border-collapse">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="border p-3 text-left text-sm font-medium text-gray-700">
                      #
                    </th>
                    <th className="border p-3 text-left text-sm font-medium text-gray-700">
                      Description
                    </th>
                    <th className="border p-3 text-right text-sm font-medium text-gray-700">
                      Qty
                    </th>
                    <th className="border p-3 text-right text-sm font-medium text-gray-700">
                      Unit Price
                    </th>
                    <th className="border p-3 text-right text-sm font-medium text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-teal-50/30">
                      <td className="border p-3 text-sm text-gray-700 text-center">
                        {item.item_number}
                      </td>
                      <td className="border p-3 text-sm text-gray-700">
                        {item.description}
                      </td>
                      <td className="border p-3 text-sm text-gray-700 text-right">
                        {item.quantity}
                      </td>
                      <td className="border p-3 text-sm text-gray-700 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="border p-3 text-sm text-gray-700 text-right font-semibold">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="flex justify-between border-b py-2">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="font-medium text-gray-700">Discount:</span>
                <span>{formatCurrency(invoice.discount_amount)}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="font-medium text-gray-700">Tax:</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between border-t-2 mt-2 pt-2">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-teal-700">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {invoice.terms && invoice.terms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mt-8 mb-3 text-gray-800">
                Terms & Conditions
              </h3>
              <ul className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                {invoice.terms.map((term: any) => (
                  <li key={term.id}>{term.description}</li>
                ))}
              </ul>
            </div>
          )}

          {invoice.signatures?.length > 0 && (
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-600 mb-3">Approved by</p>
              <div className="flex flex-col items-center">
                <img
                  src={`data:image/png;base64,${Buffer.from(
                    invoice.signatures[0].file_data.replace(/^\\x/, ""),
                    "hex"
                  ).toString("base64")}`}
                  alt="Signature"
                  className="h-24 mb-2 border border-teal-200 p-2 rounded-md"
                />
                <p className="font-semibold text-gray-800">
                  {invoice.signatures[0].user_name}
                </p>
                <p className="text-sm text-gray-600">
                  {invoice.signatures[0].job_position}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

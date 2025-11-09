"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InvoiceForm from "@/components/invoice/forms/formInvoices";
import { getInvoiceDetailAction } from "@/actions/invoice-actions";

export default function EditQuotationPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getInvoiceDetailAction(params.id);
      if (response?.success) setData(response.data);
    };
    fetchData();
  }, [params.id]);

  if (!data) return <p className="p-6">Loading quotation...</p>;

  return <InvoiceForm mode="edit" invoiceId={params.id} initialData={data} />;
}

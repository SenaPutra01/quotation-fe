"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QuotationForm from "@/components/quotations/forms/formQuotations";
import { getQuotationDetailAction } from "@/actions/quotation-actions";

export default function EditQuotationPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getQuotationDetailAction(params.id);
      if (response?.success) setData(response.data);
    };
    fetchData();
  }, [params.id]);

  if (!data) return <p className="p-6">Loading quotation...</p>;

  return (
    <QuotationForm mode="edit" quotationId={params.id} initialData={data} />
  );
}

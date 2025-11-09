"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/products/forms/formProducts";
import { getProductDetailAction } from "@/actions/product-actions";

export default function EditQuotationPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getProductDetailAction(params.id);
      if (response?.success) setData(response.data);
    };
    fetchData();
  }, [params.id]);

  if (!data) return <p className="p-6">Loading quotation...</p>;

  return <ProductForm mode="edit" productId={params.id} initialData={data} />;
}

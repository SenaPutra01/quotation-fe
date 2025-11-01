"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PurchaseOrderForm from "@/components/purchase-orders/forms/formPurchaseOrders";
import { getPurchaseOrderDetailAction } from "@/actions/purchaseOrder-actions";

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getPurchaseOrderDetailAction(params.id);
      if (response?.success) setData(response.data);
    };
    fetchData();
  }, [params.id]);

  if (!data) return <p className="p-6">Loading quotation...</p>;

  return <PurchaseOrderForm mode="edit" poId={params.id} initialData={data} />;
}

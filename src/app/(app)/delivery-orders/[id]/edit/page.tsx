"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PurchaseOrderForm from "@/components/delivery-orders/forms/formDeliveryOrders";
import { getDeliveryOrderDetailAction } from "@/actions/deliveryOrder-action";

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getDeliveryOrderDetailAction(params.id);
      if (response?.success) setData(response.data);
    };
    fetchData();
  }, [params.id]);

  if (!data) return <p className="p-6">Loading quotation...</p>;

  return <PurchaseOrderForm mode="edit" doId={params.id} initialData={data} />;
}

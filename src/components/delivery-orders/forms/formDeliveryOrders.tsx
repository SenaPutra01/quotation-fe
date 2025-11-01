"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconTrash,
  IconLoader,
  IconArrowLeft,
} from "@tabler/icons-react";
import { getPurchaseOrderList } from "@/actions/purchaseOrder-actions";
import {
  createDeliveryOrderAction,
  updateDeliveryOrderAction,
} from "@/actions/deliveryOrder-action";

export default function DeliveryOrderForm({
  initialData = null,
  mode = "create",
}: {
  initialData?: any;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    do_number: "",
    do_date: new Date().toISOString().split("T")[0],
    purchase_order_id: "",
    notes: "",
    receiver_name: "",
    receiver_position: "",
    prepared_by_name: "",
    prepared_by_position: "",
    approved_by_name: "",
    approved_by_position: "",
  });

  const [items, setItems] = useState([
    {
      product_id: "",
      product_name: "",
      quantity: "",
      notes: "",
      description: "",
    },
  ]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [receiverSignature, setReceiverSignature] = useState<File | null>(null);
  const [preparedSignature, setPreparedSignature] = useState<File | null>(null);
  const [approvedSignature, setApprovedSignature] = useState<File | null>(null);
  const [existingReceiverSignature, setExistingReceiverSignature] = useState<
    string | null
  >(null);
  const [existingPreparedSignature, setExistingPreparedSignature] = useState<
    string | null
  >(null);
  const [existingApprovedSignature, setExistingApprovedSignature] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [purchaseOrdersLoaded, setPurchaseOrdersLoaded] = useState(false);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const res = await getPurchaseOrderList();
        if (res.success && Array.isArray(res.data)) {
          setPurchaseOrders(res.data);
        } else {
          setPurchaseOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch purchase orders:", err);
        setPurchaseOrders([]);
      } finally {
        setPurchaseOrdersLoaded(true);
      }
    };
    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    if (initialData) {
      

      let receiverSign, preparedSign, approvedSign;

      if (initialData.signatures && initialData.signatures.length >= 3) {
        receiverSign = initialData.signatures[0];
        preparedSign = initialData.signatures[1];
        approvedSign = initialData.signatures[2];
      } else if (initialData.signatures && initialData.signatures.length > 0) {
        receiverSign = initialData.signatures.find(
          (sig) =>
            sig.user_name?.includes("Budi") ||
            sig.job_position?.includes("Warehouse")
        );
        preparedSign = initialData.signatures.find(
          (sig) =>
            sig.user_name?.includes("Ahmad") ||
            sig.job_position?.includes("Logistik")
        );
        approvedSign = initialData.signatures.find(
          (sig) =>
            sig.user_name?.includes("Siti") ||
            sig.job_position?.includes("Manager")
        );

        if (!receiverSign) receiverSign = initialData.signatures[0];
        if (!preparedSign)
          preparedSign = initialData.signatures[1] || initialData.signatures[0];
        if (!approvedSign)
          approvedSign =
            initialData.signatures[2] ||
            initialData.signatures[1] ||
            initialData.signatures[0];
      }

      
        receiver: receiverSign?.user_name,
        prepared: preparedSign?.user_name,
        approved: approvedSign?.user_name,
      });

      let purchaseOrderIdToSet = "";

      if (initialData.po_id) {
        purchaseOrderIdToSet = initialData.po_id.toString();
      } else if (initialData.purchase_order_id) {
        purchaseOrderIdToSet = initialData.purchase_order_id.toString();
      }

      setForm({
        do_number: initialData.do_number || "",
        do_date:
          initialData.do_date?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        purchase_order_id: purchaseOrderIdToSet,
        notes: initialData.notes || "",
        receiver_name:
          initialData.receiver_name ||
          receiverSign?.user_name ||
          "Budi Santoso",
        receiver_position:
          initialData.receiver_position ||
          receiverSign?.job_position ||
          "Warehouse Manager",
        prepared_by_name:
          initialData.prepared_by_name || preparedSign?.user_name || "Ahmad",
        prepared_by_position:
          initialData.prepared_by_position ||
          preparedSign?.job_position ||
          "Staff Logistik",
        approved_by_name:
          initialData.approved_by_name || approvedSign?.user_name || "Siti",
        approved_by_position:
          initialData.approved_by_position ||
          approvedSign?.job_position ||
          "Manager",
      });

      const initialItems = initialData.items?.length
        ? initialData.items.map((i: any) => {
            const productName =
              i.item_name ||
              i.product_name ||
              i.description ||
              i.product?.name ||
              "";

            return {
              product_id: i.product_id?.toString() || "",
              product_name: productName,
              quantity: i.quantity?.toString() || "",
              notes: i.notes || "",
              description: i.description || "",
            };
          })
        : [
            {
              product_id: "",
              product_name: "",
              quantity: "",
              notes: "",
              description: "",
            },
          ];

      
      setItems(initialItems);

      const formatSignatureImage = (fileData: string) => {
        if (!fileData) return null;
        try {
          if (fileData.startsWith("\\x")) {
            const hexString = fileData.replace(/^\\x/, "");
            const buffer = Buffer.from(hexString, "hex");
            return `data:image/png;base64,${buffer.toString("base64")}`;
          } else {
            return `data:image/png;base64,${fileData}`;
          }
        } catch (error) {
          console.error("Error processing signature:", error);
          return null;
        }
      };

      setExistingReceiverSignature(
        formatSignatureImage(receiverSign?.file_data)
      );
      setExistingPreparedSignature(
        formatSignatureImage(preparedSign?.file_data)
      );
      setExistingApprovedSignature(
        formatSignatureImage(approvedSign?.file_data)
      );

      
        receiver: {
          name: receiverSign?.user_name,
          hasData: !!receiverSign?.file_data,
          length: receiverSign?.file_data?.length,
          preview: existingReceiverSignature?.substring(0, 50),
        },
        prepared: {
          name: preparedSign?.user_name,
          hasData: !!preparedSign?.file_data,
          length: preparedSign?.file_data?.length,
          preview: existingPreparedSignature?.substring(0, 50),
        },
        approved: {
          name: approvedSign?.user_name,
          hasData: !!approvedSign?.file_data,
          length: approvedSign?.file_data?.length,
          preview: existingApprovedSignature?.substring(0, 50),
        },
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handlePurchaseOrderSelect = (purchaseOrderId: string) => {
    if (!purchaseOrderId) return;

    const selectedPO = purchaseOrders.find(
      (po) => po.id === parseInt(purchaseOrderId)
    );

    if (selectedPO) {
      const doNumber = mode === "edit" ? form.do_number : "";

      setForm((prevForm) => ({
        ...prevForm,
        purchase_order_id: purchaseOrderId,
        do_number: doNumber,
        notes: selectedPO.notes || "",

        receiver_name:
          form.receiver_name || selectedPO.client?.contact_person || "",
        receiver_position: form.receiver_position || "Warehouse Manager",
      }));

      if (selectedPO.items && selectedPO.items.length > 0) {
        

        const poItems = selectedPO.items.map((item: any) => {
          const productName =
            item.product?.name || item.product_name || item.description || "";

          return {
            product_id: item.product_id?.toString() || "",
            product_name: productName,
            quantity: item.quantity?.toString() || "1",
            notes: item.notes || "",
            description: item.description || "",
          };
        });

        
        setItems(poItems);
      } else {
        setItems([
          {
            product_id: "",
            product_name: "",
            quantity: "",
            notes: "",
            description: "",
          },
        ]);
      }

      toast({
        title: "Success",
        description: `Purchase Order ${selectedPO.po_number} loaded successfully`,
      });
    }
  };

  const getSelectedPurchaseOrderDisplay = () => {
    if (form.purchase_order_id) {
      const selectedPO = purchaseOrders.find(
        (po) => po.id === parseInt(form.purchase_order_id)
      );
      if (selectedPO) {
        return `${selectedPO.po_number} - ${selectedPO.project_name}`;
      }
    }

    if (mode === "edit" && initialData?.po_id) {
      const selectedPO = purchaseOrders.find(
        (po) => po.id === parseInt(initialData.po_id)
      );
      if (selectedPO) {
        return `${selectedPO.po_number} - ${selectedPO.project_name}`;
      }
    }

    return "Select Purchase Order";
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      {
        product_id: "",
        product_name: "",
        quantity: "",
        notes: "",
        description: "",
      },
    ]);

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const handleReceiverSignatureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setReceiverSignature(e.target.files[0]);

      setExistingReceiverSignature(null);
    }
  };

  const handlePreparedSignatureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setPreparedSignature(e.target.files[0]);
      setExistingPreparedSignature(null);
    }
  };

  const handleApprovedSignatureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setApprovedSignature(e.target.files[0]);
      setExistingApprovedSignature(null);
    }
  };

  const isDataLoaded = purchaseOrdersLoaded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDataLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while data is loading...",
      });
      return;
    }

    if (!form.purchase_order_id) {
      toast({
        title: "Error",
        description: "Please select a purchase order",
        variant: "destructive",
      });
      return;
    }

    if (
      items.some(
        (item) =>
          !item.product_name || !item.quantity || parseInt(item.quantity) <= 0
      )
    ) {
      toast({
        title: "Error",
        description: "Please fill all required item fields with valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (
      !form.receiver_name ||
      !form.receiver_position ||
      !form.prepared_by_name ||
      !form.prepared_by_position ||
      !form.approved_by_name ||
      !form.approved_by_position
    ) {
      toast({
        title: "Error",
        description: "Please fill all required signature fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user?.id) {
        toast({
          title: "Error",
          description: "User not found in localStorage",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();

      if (mode === "edit" && form.do_number) {
        formData.append("do_number", form.do_number);
      }
      formData.append("do_date", form.do_date);
      formData.append("po_id", form.purchase_order_id);
      formData.append("notes", form.notes || "");
      formData.append("receiver_name", form.receiver_name);
      formData.append("receiver_position", form.receiver_position);
      formData.append("prepared_by_name", form.prepared_by_name);
      formData.append("prepared_by_position", form.prepared_by_position);
      formData.append("approved_by_name", form.approved_by_name);
      formData.append("approved_by_position", form.approved_by_position);
      formData.append("created_by", user.id.toString());

      const itemsData = items.map((item) => ({
        product_id: item.product_id ? parseInt(item.product_id) : null,
        product_name: item.product_name,
        quantity: parseInt(item.quantity) || 0,
        description: item.notes || item.description || "",
      }));

      formData.append("items", JSON.stringify(itemsData));

      if (receiverSignature) {
        formData.append("receiver_signature", receiverSignature);
      }
      if (preparedSignature) {
        formData.append("prepared_signature", preparedSignature);
      }
      if (approvedSignature) {
        formData.append("approved_signature", approvedSignature);
      }

      
      for (let [key, value] of formData.entries()) {
        if (key === "items") {
          
        } else if (value instanceof File) {
          
        } else {
          
        }
      }

      let response;

      if (mode === "edit" && initialData?.id) {
        response = await updateDeliveryOrderAction(
          initialData.id.toString(),
          formData
        );
      } else {
        response = await createDeliveryOrderAction(formData);
      }

      if (response?.success) {
        toast({
          title: "Success",
          description:
            response.message ||
            `Delivery Order ${
              mode === "edit" ? "updated" : "created"
            } successfully.`,
        });

        const redirectId = mode === "edit" ? initialData.id : response.data?.id;
        router.push(`/delivery-orders/${redirectId}`);
      } else {
        toast({
          title: "Error",
          description:
            response?.error ||
            response?.message ||
            "Failed to process delivery order.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="flex flex-col items-center gap-4">
          <IconLoader className="animate-spin" size={32} />
          <p>Loading delivery order data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 my-6">
      <div className="mb-4 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/delivery-orders")}
        >
          <IconArrowLeft size={16} className="mr-1" /> Back to Delivery Orders
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="purchase_order_select">
                  Purchase Order Number
                </Label>
                <Select
                  value={form.purchase_order_id}
                  onValueChange={handlePurchaseOrderSelect}
                >
                  <SelectTrigger id="purchase_order_select" className="w-full">
                    <SelectValue>
                      {getSelectedPurchaseOrderDisplay()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders.length > 0 ? (
                      purchaseOrders.map((po) => (
                        <SelectItem key={po.id} value={po.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{po.po_number}</span>
                            <span className="text-sm text-muted-foreground">
                              {po.project_name} - {po.client?.company_name}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        {purchaseOrdersLoaded
                          ? "No purchase orders available"
                          : "Loading purchase orders..."}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* DO Number hanya ditampilkan untuk edit mode */}
              {mode === "edit" && (
                <div className="space-y-2">
                  <Label htmlFor="do_number">Delivery Order Number</Label>
                  <Input
                    id="do_number"
                    name="do_number"
                    value={form.do_number}
                    onChange={handleChange}
                    placeholder="Enter DO Number"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="do_date">Delivery Date</Label>
                <Input
                  id="do_date"
                  type="date"
                  name="do_date"
                  value={form.do_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional notes for delivery order"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Delivery Items</Label>

              {items.map((item, index) => {
                const displayProductName =
                  item.product_name || item.description || "";

                return (
                  <div key={index} className="border p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`product-${index}`}>Product</Label>
                        <Input
                          id={`product-${index}`}
                          value={displayProductName}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "product_name",
                              e.target.value
                            )
                          }
                          placeholder="Product name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          required
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`notes-${index}`}>
                          Notes (optional)
                        </Label>
                        <Input
                          id={`notes-${index}`}
                          placeholder="Item notes"
                          value={item.notes}
                          onChange={(e) =>
                            handleItemChange(index, "notes", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {items.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <IconTrash size={14} className="mr-1" /> Remove Item
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addItem}
              >
                <IconPlus size={14} className="mr-1" /> Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Receiver Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Receiver Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="receiver_name">Receiver Name</Label>
                  <Input
                    id="receiver_name"
                    name="receiver_name"
                    value={form.receiver_name}
                    onChange={handleChange}
                    placeholder="Enter receiver name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver_position">Receiver Position</Label>
                  <Input
                    id="receiver_position"
                    name="receiver_position"
                    value={form.receiver_position}
                    onChange={handleChange}
                    placeholder="Enter receiver position"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver_signature">
                    Receiver Signature
                    {existingReceiverSignature && (
                      <span className="text-green-600 text-xs ml-2">
                        ✓ Image loaded
                      </span>
                    )}
                  </Label>
                  {existingReceiverSignature && (
                    <div className="my-2">
                      <img
                        src={existingReceiverSignature}
                        alt="Receiver Signature"
                        className="h-24 border rounded-md shadow-sm"
                        onError={(e) => {
                          console.error("Failed to load receiver signature");
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <Input
                    id="receiver_signature"
                    type="file"
                    accept="image/*"
                    onChange={handleReceiverSignatureChange}
                  />
                </div>
              </div>

              {/* Prepared By Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Prepared By</h3>
                <div className="space-y-2">
                  <Label htmlFor="prepared_by_name">Name</Label>
                  <Input
                    id="prepared_by_name"
                    name="prepared_by_name"
                    value={form.prepared_by_name}
                    onChange={handleChange}
                    placeholder="Enter preparer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepared_by_position">Position</Label>
                  <Input
                    id="prepared_by_position"
                    name="prepared_by_position"
                    value={form.prepared_by_position}
                    onChange={handleChange}
                    placeholder="Enter preparer position"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepared_signature">
                    Signature
                    {existingPreparedSignature && (
                      <span className="text-green-600 text-xs ml-2">
                        ✓ Image loaded
                      </span>
                    )}
                  </Label>
                  {existingPreparedSignature && (
                    <div className="my-2">
                      <img
                        src={existingPreparedSignature}
                        alt="Prepared Signature"
                        className="h-24 border rounded-md shadow-sm"
                        onError={(e) => {
                          console.error("Failed to load prepared signature");
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <Input
                    id="prepared_signature"
                    type="file"
                    accept="image/*"
                    onChange={handlePreparedSignatureChange}
                  />
                </div>
              </div>

              {/* Approved By Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Approved By</h3>
                <div className="space-y-2">
                  <Label htmlFor="approved_by_name">Name</Label>
                  <Input
                    id="approved_by_name"
                    name="approved_by_name"
                    value={form.approved_by_name}
                    onChange={handleChange}
                    placeholder="Enter approver name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approved_by_position">Position</Label>
                  <Input
                    id="approved_by_position"
                    name="approved_by_position"
                    value={form.approved_by_position}
                    onChange={handleChange}
                    placeholder="Enter approver position"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approved_signature">
                    Signature
                    {existingApprovedSignature && (
                      <span className="text-green-600 text-xs ml-2">
                        ✓ Image loaded
                      </span>
                    )}
                  </Label>
                  {existingApprovedSignature && (
                    <div className="my-2">
                      <img
                        src={existingApprovedSignature}
                        alt="Approved Signature"
                        className="h-24 border rounded-md shadow-sm"
                        onError={(e) => {
                          console.error("Failed to load approved signature");
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <Input
                    id="approved_signature"
                    type="file"
                    accept="image/*"
                    onChange={handleApprovedSignatureChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading || !isDataLoaded}>
                {loading ? (
                  <>
                    <IconLoader className="animate-spin mr-2" size={16} />{" "}
                    {mode === "edit" ? "Updating..." : "Creating..."}
                  </>
                ) : mode === "edit" ? (
                  "Update Delivery Order"
                ) : (
                  "Create Delivery Order"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

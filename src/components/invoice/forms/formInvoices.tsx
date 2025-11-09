"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconArrowLeft,
  IconLoader,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import { getPurchaseOrderList } from "@/actions/purchaseOrder-actions";
import { getClientsAction } from "@/actions/client-actions";
import {
  createInvoiceAction,
  updateInvoiceAction,
} from "@/actions/invoice-actions";

export default function InvoiceForm({
  initialData = null,
  mode = "create",
}: {
  initialData?: any;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    po_id: "",
    client_id: "",
    project_name: "",
    invoice_date: "",
    payment_term: "",
    discount_amount: "",
    signature_name: "",
    signature_title: "",
  });

  const [items, setItems] = useState([
    { description: "", quantity: "", unit_price: "", notes: "" },
  ]);
  const [terms, setTerms] = useState(["Payment due upon receipt"]);
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [existingSignature, setExistingSignature] = useState<string | null>(
    null
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientRes, poRes] = await Promise.all([
          getClientsAction(),
          getPurchaseOrderList(),
        ]);
        if (clientRes.success) setClients(clientRes.data || []);
        if (poRes.success) setPurchaseOrders(poRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const inv = initialData;

      const poId =
        inv.purchase_order?.id?.toString() || inv.po_id?.toString() || "";

      setForm({
        po_id: poId,
        client_id: inv.client?.id?.toString() || "",
        project_name: inv.project_name || "",
        invoice_date: inv.invoice_date?.split("T")[0] || "",
        payment_term: inv.payment_term || "",
        discount_amount: inv.discount_amount?.toString() || "0",
        signature_name: inv.signatures?.[0]?.user_name || "",
        signature_title: inv.signatures?.[0]?.job_position || "",
      });

      setItems(
        inv.items?.length
          ? inv.items.map((i: any) => ({
              description: i.description || "",
              quantity: i.quantity?.toString() || "",
              unit_price: i.unit_price?.toString() || "",
              notes: i.notes || "",
            }))
          : [{ description: "", quantity: "", unit_price: "", notes: "" }]
      );

      setTerms(
        inv.terms?.map((t: any) => t.description || "") || [
          "Payment due upon receipt",
        ]
      );

      if (inv.signatures?.[0]?.file_data) {
        const base64 = `data:image/png;base64,${Buffer.from(
          inv.signatures[0].file_data.replace(/^\\x/, ""),
          "hex"
        ).toString("base64")}`;
        setExistingSignature(base64);
      }
    }
  }, [initialData, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "po_id" && value) {
      const selectedPO = purchaseOrders.find(
        (po) => po.id.toString() === value
      );
      if (selectedPO) {
        setForm((prev) => ({
          ...prev,
          po_id: value,
          client_id: selectedPO.client_id?.toString() || "",
          project_name: selectedPO.project_name || "",
          payment_term: selectedPO.payment_term || "",
        }));

        if (selectedPO.items && selectedPO.items.length > 0) {
          setItems(
            selectedPO.items.map((item: any) => ({
              description: item.description || "",
              quantity: item.quantity?.toString() || "",
              unit_price: item.unit_price?.toString() || "",
              notes: item.notes || "",
            }))
          );
        }
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value ?? "" }));
    }
  };

  const clearPO = () => {
    setForm((prev) => ({ ...prev, po_id: "" }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  };

  const addItem = () =>
    setItems([
      ...items,
      { description: "", quantity: "", unit_price: "", notes: "" },
    ]);
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const addTerm = () => setTerms([...terms, ""]);
  const removeTerm = (index: number) =>
    setTerms(terms.filter((_, i) => i !== index));

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      setSignatureImage(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.client_id) {
      toast({
        title: "Error",
        description: "Please select a Client (either directly or via PO)",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.description.trim() !== "" &&
        item.quantity &&
        parseFloat(item.quantity) > 0 &&
        item.unit_price &&
        parseFloat(item.unit_price) > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Error",
        description:
          "Please add at least one valid item with description, quantity, and price",
        variant: "destructive",
      });
      return;
    }

    const validTerms = terms.filter((t) => t.trim() !== "");
    if (validTerms.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      const formData = new FormData();
      if (form.po_id) formData.append("po_id", form.po_id);
      if (form.client_id) formData.append("client_id", form.client_id);
      formData.append("project_name", form.project_name || "");
      formData.append("invoice_date", form.invoice_date || "");
      formData.append("payment_term", form.payment_term || "");
      formData.append("discount_amount", form.discount_amount || "0");
      formData.append("signature_name", form.signature_name || "");
      formData.append("signature_title", form.signature_title || "");
      formData.append("created_by", user?.id?.toString() || "");

      formData.append("items", JSON.stringify(validItems));

      const formattedTerms = validTerms.map((description, index) => ({
        order: index + 1,
        description: description.trim(),
      }));

      formData.append("terms", JSON.stringify(formattedTerms));

      if (signatureImage) formData.append("signature_image", signatureImage);
      attachments.forEach((f) => formData.append("attachments", f));

      let response;
      if (mode === "edit" && initialData?.id) {
        response = await updateInvoiceAction(
          initialData.id.toString(),
          formData
        );
      } else {
        response = await createInvoiceAction(formData);
      }

      if (response?.success) {
        toast({
          title: "Success",
          description:
            response.message ||
            `Invoice ${mode === "edit" ? "updated" : "created"} successfully.`,
        });
        router.push(`/invoices/${response.data?.id || initialData.id}`);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to process invoice.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error submitting invoice:", err);
      toast({
        title: "Error",
        description:
          err.message || "Something went wrong while saving invoice.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <IconLoader className="animate-spin mr-2" /> Loading form data...
      </div>
    );
  }

  return (
    <div className="mx-4 my-6">
      <div className="mb-4 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/invoices")}
        >
          <IconArrowLeft size={16} className="mr-1" /> Back to Invoices
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {form.po_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                <strong>Auto-fill active:</strong> Some fields are automatically
                filled from the selected Purchase Order. You can still edit them
                if needed.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Purchase Order (Optional - Autofills form)</Label>
                <Select
                  value={form.po_id || undefined}
                  onValueChange={(v) => handleSelectChange("po_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders.map((po) => (
                      <SelectItem key={po.id} value={po.id.toString()}>
                        {po.po_number} - {po.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.po_id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearPO}
                    className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <IconX size={14} className="mr-1" /> Clear PO (Manual Input)
                  </Button>
                )}
              </div>

              <div>
                <Label>
                  Client{" "}
                  {!form.po_id && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={form.client_id || undefined}
                  onValueChange={(v) => handleSelectChange("client_id", v)}
                  disabled={!!form.po_id}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        form.po_id ? "Auto-filled from PO" : "Select Client"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.company_name} ({c.contact_person})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Project Name{" "}
                  {!form.po_id && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="project_name"
                  name="project_name"
                  value={form.project_name || ""}
                  onChange={handleChange}
                  placeholder={
                    form.po_id ? "Auto-filled from PO" : "Project Name"
                  }
                  required
                  className={form.po_id ? "bg-gray-50" : ""}
                />
              </div>

              <div>
                <Label>Invoice Date</Label>
                <Input
                  id="invoice_date"
                  name="invoice_date"
                  type="date"
                  value={form.invoice_date || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>
                  Payment Term{" "}
                  {!form.po_id && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="payment_term"
                  name="payment_term"
                  value={form.payment_term || ""}
                  onChange={handleChange}
                  placeholder={
                    form.po_id
                      ? "Auto-filled from PO"
                      : "e.g. 30 days after invoice"
                  }
                  required
                  className={form.po_id ? "bg-gray-50" : ""}
                />
              </div>

              <div>
                <Label>Discount Amount</Label>
                <Input
                  id="discount_amount"
                  name="discount_amount"
                  type="number"
                  value={form.discount_amount || ""}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Invoice Items</Label>
              {items.map((item, index) => (
                <div key={index} className="border p-4 rounded-md space-y-3">
                  <Input
                    placeholder="Description"
                    value={item.description || ""}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unit_price || ""}
                      onChange={(e) =>
                        handleItemChange(index, "unit_price", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Notes"
                      value={item.notes || ""}
                      onChange={(e) =>
                        handleItemChange(index, "notes", e.target.value)
                      }
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => removeItem(index)}
                    >
                      <IconTrash size={14} /> Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem}>
                <IconPlus size={14} /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">
                Terms <span className="text-red-500">*</span>
              </Label>
              {terms.map((term, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    placeholder="Term description (required)"
                    value={term || ""}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    required
                  />
                  {terms.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTerm(index)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTerm}>
                <IconPlus size={14} /> Add Term
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Signature Name</Label>
                <Input
                  name="signature_name"
                  value={form.signature_name || ""}
                  onChange={handleChange}
                  placeholder="Signer Name"
                  required
                />
              </div>
              <div>
                <Label>Signature Title</Label>
                <Input
                  name="signature_title"
                  value={form.signature_title || ""}
                  onChange={handleChange}
                  placeholder="Job Title"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Signature Image</Label>
              {existingSignature && (
                <img
                  src={existingSignature}
                  alt="Signature"
                  className="h-24 border rounded-md my-2"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
              />
            </div>

            <div>
              <Label>Attachments</Label>
              <Input type="file" multiple onChange={handleAttachmentsChange} />
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <IconLoader className="animate-spin mr-2" size={16} />{" "}
                    Saving...
                  </>
                ) : mode === "edit" ? (
                  "Update Invoice"
                ) : (
                  "Create Invoice"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

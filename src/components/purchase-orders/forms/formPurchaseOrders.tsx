"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getClientsAction } from "@/actions/client-actions";
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
  IconDownload,
} from "@tabler/icons-react";
import {
  createPurchaseOrderAction,
  updatePurchaseOrderAction,
} from "@/actions/purchaseOrder-actions";
import { getQuotationList } from "@/actions/quotation-actions";

export default function PurchaseOrderForm({
  initialData = null,
  quotationId = null,
  mode = "create",
}: {
  initialData?: any;
  quotationId?: string | null;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    po_number: "",
    project_name: "",
    request_date: "",
    valid_days: 30,
    client_id: 0,
    company_name: "",
    contact_person: "",
    quotation_id: "",
    prepared_by_name: "",
    prepared_by_position: "",
    approved_by_name: "",
    approved_by_position: "",
    created_by: "",
  });

  const [items, setItems] = useState([
    { description: "", quantity: "", unit_price: "", notes: "" },
  ]);
  const [terms, setTerms] = useState([""]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [signaturePreparedImage, setSignaturePreparedImage] =
    useState<File | null>(null);
  const [signatureApprovedImage, setSignatureApprovedImage] =
    useState<File | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [quotationsLoaded, setQuotationsLoaded] = useState(false);

  const [existingSignatures, setExistingSignatures] = useState<any[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [selectedQuotationDisplay, setSelectedQuotationDisplay] =
    useState("Select Quotation");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getClientsAction();
        setClients(res.success ? res.data : []);
      } catch {
        setClients([]);
      } finally {
        setClientsLoaded(true);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await getQuotationList();
        setQuotations(res.success ? res.data : []);
      } catch {
        setQuotations([]);
      } finally {
        setQuotationsLoaded(true);
      }
    };
    fetchQuotations();
  }, []);

  useEffect(() => {
    if (form.quotation_id && quotations.length > 0) {
      const selectedQuotation = quotations.find(
        (q) => q.id === parseInt(form.quotation_id)
      );

      if (selectedQuotation) {
        setSelectedQuotationDisplay(
          `${selectedQuotation.quotation_number} — ${selectedQuotation.project_name}`
        );
      } else if (mode === "edit" && initialData?.quotation) {
        setSelectedQuotationDisplay(
          `${initialData.quotation.quotation_number} — ${initialData.project_name}`
        );
      }
    } else if (mode === "edit" && initialData?.quotation) {
      setSelectedQuotationDisplay(
        `${initialData.quotation.quotation_number} — ${initialData.project_name}`
      );
    } else {
      setSelectedQuotationDisplay("Select Quotation");
    }
  }, [form.quotation_id, quotations, mode, initialData]);

  const extractSignatureData = (signatures: any[]) => {
    let preparedData = { name: "", position: "" };
    let approvedData = { name: "", position: "" };

    if (signatures && signatures.length > 0) {
      const preparedSignature = signatures.find(
        (sig) =>
          sig.job_position?.toLowerCase().includes("prepared") ||
          sig.job_position?.toLowerCase().includes("prepare")
      );

      const approvedSignature = signatures.find(
        (sig) =>
          sig.job_position?.toLowerCase().includes("approved") ||
          sig.job_position?.toLowerCase().includes("approve")
      );

      if (preparedSignature) {
        preparedData = {
          name: preparedSignature.user_name || "",
          position: preparedSignature.job_position || "",
        };
      }

      if (approvedSignature) {
        approvedData = {
          name: approvedSignature.user_name || "",
          position: approvedSignature.job_position || "",
        };
      }

      if (!preparedSignature && signatures.length > 0) {
        preparedData = {
          name: signatures[0].user_name || "",
          position: signatures[0].job_position || "",
        };
      }

      if (!approvedSignature && signatures.length > 1) {
        approvedData = {
          name: signatures[1].user_name || "",
          position: signatures[1].job_position || "",
        };
      }
    }

    return { preparedData, approvedData };
  };

  useEffect(() => {
    if (mode === "edit" && initialData && quotationsLoaded) {
      const { preparedData, approvedData } = extractSignatureData(
        initialData.signatures
      );

      setForm({
        po_number: initialData.po_number || "",
        project_name: initialData.project_name || "",
        request_date: initialData.order_date?.split("T")[0] || "",
        valid_days: initialData.valid_days || 30,
        client_id: initialData.client?.id || 0,
        company_name: initialData.client?.company_name || "",
        contact_person: initialData.client?.contact_person || "",
        quotation_id: initialData.quotation?.id?.toString() || "",

        prepared_by_name: preparedData.name,
        prepared_by_position: preparedData.position,
        approved_by_name: approvedData.name,
        approved_by_position: approvedData.position,
        created_by: initialData.created_by || "",
      });

      setItems(
        initialData.items?.map((it: any) => ({
          description: it.description || "",
          quantity: it.quantity?.toString() || "",
          unit_price: it.unit_price?.toString() || "",
          notes: it.notes || "",
        })) || []
      );

      setTerms(initialData.terms?.map((t: any) => t.description || "") || [""]);

      if (initialData.signatures) {
        setExistingSignatures(initialData.signatures);
      }
      if (initialData.attachments) {
        setExistingAttachments(initialData.attachments);
      }
    } else if (mode === "create") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setForm((prev) => ({ ...prev, created_by: user.id || "" }));
    }
  }, [mode, initialData, quotationsLoaded]);

  const byteaToBase64 = (byteaString: string) => {
    try {
      const hexString = byteaString.replace(/\\x/g, "");
      return btoa(
        hexString
          .match(/.{1,2}/g)!
          .map((byte) => String.fromCharCode(parseInt(byte, 16)))
          .join("")
      );
    } catch (error) {
      console.error("Error converting bytea to base64:", error);
      return null;
    }
  };

  const handleDownloadAttachment = (attachment: any) => {
    try {
      const base64Data = byteaToBase64(attachment.file_data);
      if (!base64Data) {
        toast({
          title: "Error",
          description: "Failed to download attachment",
          variant: "destructive",
        });
        return;
      }

      const blob = new Blob(
        [Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))],
        { type: attachment.file_type }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      });
    }
  };

  const handleQuotationSelect = (quotationId: string) => {
    if (!quotationId) return;

    const selectedQuotation = quotations.find(
      (q) => q.id === parseInt(quotationId)
    );

    if (selectedQuotation) {
      setForm((prev) => ({
        ...prev,
        quotation_id: quotationId,
        project_name: selectedQuotation.project_name || "",
        request_date: selectedQuotation.request_date?.split("T")[0] || "",
        valid_days: selectedQuotation.valid_days || 30,
        client_id: selectedQuotation.client?.id || 0,
        company_name: selectedQuotation.client?.company_name || "",
        contact_person: selectedQuotation.client?.contact_person || "",
      }));

      if (selectedQuotation.items?.length > 0) {
        const quotationItems = selectedQuotation.items.map((item: any) => ({
          description: item.description || "",
          quantity: item.quantity?.toString() || "1",
          unit_price: item.unit_price?.toString() || "0",
          notes: item.notes || "",
        }));
        setItems(quotationItems);
      } else {
        setItems([
          { description: "", quantity: "", unit_price: "", notes: "" },
        ]);
      }

      setTerms(
        selectedQuotation.terms?.map((t: any) => t.description || "") || [""]
      );

      setSelectedQuotationDisplay(
        `${selectedQuotation.quotation_number} — ${selectedQuotation.project_name}`
      );

      toast({
        title: "Quotation Loaded",
        description: `${selectedQuotation.quotation_number} loaded successfully`,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));

  const addTerm = () => setTerms([...terms, ""]);
  const removeTerm = (i: number) =>
    setTerms(terms.filter((_, idx) => idx !== i));

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };

  const handleSignaturePreparedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) setSignaturePreparedImage(e.target.files[0]);
  };

  const handleSignatureApprovedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) setSignatureApprovedImage(e.target.files[0]);
  };

  const isLoaded = clientsLoaded && quotationsLoaded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));

      attachments.forEach((f) => formData.append("attachments", f));
      if (signaturePreparedImage)
        formData.append("prepared_signature", signaturePreparedImage);
      if (signatureApprovedImage)
        formData.append("approved_signature", signatureApprovedImage);

      const res =
        mode === "edit" && initialData?.id
          ? await updatePurchaseOrderAction(initialData.id.toString(), formData)
          : await createPurchaseOrderAction(formData);

      if (res?.success) {
        toast({ title: "Success", description: res.message });
        router.push(`/purchase-orders/${res.data?.id || initialData.id}`);
      } else {
        toast({
          title: "Error",
          description: res?.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <IconLoader className="animate-spin mr-2" /> Loading data...
      </div>
    );
  }

  return (
    <div className="mx-4 my-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/purchase-orders")}
      >
        <IconArrowLeft size={16} className="mr-1" /> Back
      </Button>

      <Card className="border-0 shadow-none mt-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label>Quotation</Label>
                <Select
                  value={form.quotation_id}
                  onValueChange={handleQuotationSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{selectedQuotationDisplay}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {quotations.map((q) => (
                      <SelectItem key={q.id} value={q.id.toString()}>
                        {q.quotation_number} — {q.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>PO Number</Label>
                <Input
                  name="po_number"
                  value={form.po_number}
                  onChange={handleChange}
                  placeholder="Enter PO Number"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Project Name</Label>
                <Input
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Request Date</Label>
                <Input
                  type="date"
                  name="request_date"
                  value={form.request_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-5">
              <Label className="font-semibold text-lg">Products / Items</Label>

              {items.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="space-y-3">
                    <Label>Item Description</Label>
                    <Input
                      placeholder="Enter item name or details"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Unit Price (Rp)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(index, "unit_price", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Notes</Label>
                      <Input
                        placeholder="Optional notes"
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
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <IconTrash size={14} className="mr-1" /> Remove Item
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addItem}
              >
                <IconPlus size={14} className="mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              <Label className="font-semibold text-lg">Terms</Label>
              {terms.map((t, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Textarea
                    value={t}
                    onChange={(e) => handleTermChange(i, e.target.value)}
                    placeholder="Enter term condition"
                  />
                  {terms.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTerm(i)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTerm}>
                <IconPlus size={14} className="mr-1" /> Add Term
              </Button>
            </div>

            {mode === "edit" && (
              <div className="space-y-6">
                <Label className="font-semibold text-lg">Signatures</Label>

                {existingSignatures.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Existing Signatures</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {existingSignatures.map((sig, index) => (
                        <div key={sig.id} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            {sig.file_data && (
                              <img
                                src={`data:image/png;base64,${byteaToBase64(
                                  sig.file_data
                                )}`}
                                alt={`Signature ${index + 1}`}
                                className="h-12 w-20 border rounded object-contain"
                              />
                            )}
                            <div>
                              <p className="font-medium">{sig.user_name}</p>
                              <p className="text-sm text-gray-600">
                                {sig.job_position}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(sig.signed_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-gray-700">Prepared By</h3>
                    <div className="space-y-3">
                      <Label>Signature Name</Label>
                      <Input
                        name="prepared_by_name"
                        value={form.prepared_by_name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Signature Title</Label>
                      <Input
                        name="prepared_by_position"
                        value={form.prepared_by_position}
                        onChange={handleChange}
                        placeholder="e.g. Sales Manager"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Upload New Signature</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSignaturePreparedChange}
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-gray-700">Approved By</h3>
                    <div className="space-y-3">
                      <Label>Signature Name</Label>
                      <Input
                        name="approved_by_name"
                        value={form.approved_by_name}
                        onChange={handleChange}
                        placeholder="e.g. Jane Smith"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Signature Title</Label>
                      <Input
                        name="approved_by_position"
                        value={form.approved_by_position}
                        onChange={handleChange}
                        placeholder="e.g. Director"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Upload New Signature</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureApprovedChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label>Attachments</Label>

              {existingAttachments.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-medium">Existing Attachments:</p>
                  {existingAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{attachment.file_name}</span>
                        <span className="text-xs text-gray-500">
                          ({(attachment.file_size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        <IconDownload size={14} className="mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Input type="file" multiple onChange={handleAttachmentsChange} />
              <p className="text-sm text-gray-600">
                Add new attachments (will be added to existing ones)
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <IconLoader className="animate-spin mr-2" />}
                {mode === "edit"
                  ? "Update Purchase Order"
                  : "Create Purchase Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

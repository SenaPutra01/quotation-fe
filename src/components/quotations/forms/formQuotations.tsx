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
  createQuotationAction,
  updateQuotationAction,
} from "@/actions/quotation-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const IconLoader = ({ className }: { className?: string }) => (
  <div className={className}>⟳</div>
);
const IconArrowLeft = () => <span>←</span>;
const IconTrash = () => <span>🗑</span>;
const IconPlus = () => <span>+</span>;

export default function QuotationForm({
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
    project_name: "",
    request_date: "",
    valid_days: 30,
    client_id: 0,
    company_name: "",
    contact_person: "",
    signature_name: "",
    signature_title: "",
  });

  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [items, setItems] = useState([
    { description: "", quantity: "", unit_price: "", notes: "" },
  ]);
  const [terms, setTerms] = useState([""]);
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [existingSignature, setExistingSignature] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

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
    if (initialData) {
      const signature =
        initialData.signatures && initialData.signatures.length > 0
          ? initialData.signatures[0]
          : null;

      setForm({
        project_name: initialData.project_name || "",
        request_date: initialData.request_date?.split("T")[0] || "",
        valid_days: initialData.valid_days || 30,
        client_id: initialData.client?.id || 0,
        company_name: initialData.client?.company_name || "",
        contact_person: initialData.client?.contact_person || "",
        signature_name: signature?.user_name || "",
        signature_title: signature?.job_position || "",
      });

      setItems(
        initialData.items?.length
          ? initialData.items.map((i: any) => ({
              description: i.description || "",
              quantity: i.quantity?.toString() || "",
              unit_price: i.unit_price?.toString() || "",
              notes: i.notes || "",
            }))
          : [{ description: "", quantity: "", unit_price: "", notes: "" }]
      );

      setTerms(
        initialData.terms?.length
          ? initialData.terms.map((t: any) => t.description || "")
          : [""]
      );

      if (signature?.file_data) {
        try {
          const base64 = `data:image/png;base64,${Buffer.from(
            signature.file_data.replace(/^\\x/, ""),
            "hex"
          ).toString("base64")}`;
          setExistingSignature(base64);
        } catch (error) {
          console.error("Error processing signature image:", error);
        }
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      { description: "", quantity: "", unit_price: "", notes: "" },
    ]);
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  };
  const addTerm = () => setTerms([...terms, ""]);
  const removeTerm = (index: number) =>
    setTerms(terms.filter((_, i) => i !== index));

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      setSignatureImage(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, v.toString())
      );
      formData.append("created_by", user.id.toString());
      formData.append("items", JSON.stringify(items));
      formData.append("terms", JSON.stringify(terms));

      if (signatureImage) formData.append("signature_image", signatureImage);

      if (mode === "edit") {
        formData.append("status", "submit");
        formData.append("updated_by", user.id.toString());
      }

      let response;
      if (mode === "edit" && quotationId)
        response = await updateQuotationAction(quotationId, formData);
      else response = await createQuotationAction(formData);

      if (response?.success) {
        toast({
          title: "Success",
          description:
            response.message ||
            `Quotation ${
              mode === "edit" ? "updated" : "created"
            } successfully.`,
        });
        router.push(`/quotations/${response.data?.id || quotationId}`);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to process quotation.",
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

  return (
    <div className="mx-4 my-6">
      <div className="mb-4 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/quotations")}
        >
          <IconArrowLeft /> Back to Quotations
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Project Name</Label>
                <Input
                  className="mt-1.5"
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Request Date</Label>
                <Input
                  className="mt-1.5"
                  type="date"
                  name="request_date"
                  value={form.request_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Valid Days</Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  name="valid_days"
                  value={form.valid_days}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Client</Label>
                {clientsLoaded ? (
                  <Select
                    value={form.client_id ? String(form.client_id) : ""}
                    onValueChange={(value) => {
                      const selected = clients.find(
                        (c) => c.id === Number(value)
                      );
                      setForm({
                        ...form,
                        client_id: Number(value),
                        company_name: selected?.company_name || "",
                        contact_person: selected?.contact_person || "",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full mt-1.5">
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.company_name} ({client.contact_person})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          No clients available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    Loading...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Products / Items</Label>
              {items.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        className="mt-1.5"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Unit Price (Rp)</Label>
                      <Input
                        className="mt-1.5"
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(index, "unit_price", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      className="mt-1.5"
                      placeholder="Optional notes"
                      value={item.notes}
                      onChange={(e) =>
                        handleItemChange(index, "notes", e.target.value)
                      }
                    />
                  </div>

                  {item.quantity && item.unit_price && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Price:</span>
                        <span className="text-blue-700 font-bold text-lg">
                          Rp{" "}
                          {(
                            parseFloat(item.unit_price) *
                            parseInt(item.quantity)
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  {items.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <IconTrash /> Remove Item
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
                <IconPlus /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Terms</Label>
              {terms.map((term, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    className="mt-1.5"
                    placeholder="Term text"
                    value={term}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    required
                  />
                  {terms.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => removeTerm(index)}
                    >
                      <IconTrash />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addTerm}
              >
                <IconPlus /> Add Term
              </Button>
            </div>

            {mode === "edit" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Signature Name</Label>
                    <Input
                      className="mt-1.5"
                      name="signature_name"
                      value={form.signature_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Signature Title</Label>
                    <Input
                      className="mt-1.5"
                      name="signature_title"
                      value={form.signature_title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Signature Image</Label>
                  {existingSignature && (
                    <img
                      src={existingSignature}
                      alt="Signature"
                      className="h-24 border rounded-md shadow-sm"
                    />
                  )}
                  <Input
                    className="mt-1.5"
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureChange}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <IconLoader className="animate-spin mr-2" />{" "}
                    {mode === "edit" ? "Updating..." : "Creating..."}
                  </>
                ) : mode === "edit" ? (
                  "Update Quotation"
                ) : (
                  "Create Quotation"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
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
} from "@tabler/icons-react";
import { getProductsAction } from "@/actions/product-actions";
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
    signature_name: "",
    signature_title: "",
    quotation_id: "",
  });

  const [items, setItems] = useState([
    { productId: "", quantity: "", notes: "" },
  ]);
  const [terms, setTerms] = useState([""]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [existingSignature, setExistingSignature] = useState<string | null>(
    null
  );
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [quotationsLoaded, setQuotationsLoaded] = useState(false);

  const initialQuotationData = useRef<any>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getClientsAction();
        if (res.success && Array.isArray(res.data)) {
          setClients(res.data);
        } else {
          setClients([]);
        }
      } catch (err) {
        console.error("Failed to fetch clients:", err);
        setClients([]);
      } finally {
        setClientsLoaded(true);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductsAction();
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setProductsLoaded(true);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await getQuotationList();
        if (res.success && Array.isArray(res.data)) {
          setQuotations(res.data);
        } else {
          setQuotations([]);
        }
      } catch (err) {
        console.error("Failed to fetch quotations:", err);
        setQuotations([]);
      } finally {
        setQuotationsLoaded(true);
      }
    };

    fetchQuotations();
  }, []);

  useEffect(() => {
    if (initialData) {
      const signature =
        initialData.signatures && initialData.signatures.length > 0
          ? initialData.signatures[0]
          : null;

      const attachmentList = initialData.attachments || [];

      if (initialData.quotation) {
        initialQuotationData.current = initialData.quotation;
      }

      let quotationIdToSet = "";

      if (initialData.quotation_id) {
        quotationIdToSet = initialData.quotation_id.toString();
      } else if (initialData.quotation?.id) {
        quotationIdToSet = initialData.quotation.id.toString();
      } else if (initialData.project_name && initialData.client?.id) {
        const matchingQuotation = quotations.find(
          (q) =>
            q.project_name === initialData.project_name &&
            q.client?.id === initialData.client?.id
        );
        if (matchingQuotation) {
          quotationIdToSet = matchingQuotation.id.toString();
        }
      }

      setForm({
        po_number: initialData.po_number || "",
        project_name: initialData.project_name || "",
        request_date: initialData.request_date?.split("T")[0] || "",
        valid_days: initialData.valid_days || 30,
        client_id: initialData.client?.id || 0,
        company_name: initialData.client?.company_name || "",
        contact_person: initialData.client?.contact_person || "",
        signature_name: signature?.user_name || "",
        signature_title: signature?.job_position || "",
        quotation_id: quotationIdToSet,
      });

      const initialItems = initialData.items?.length
        ? initialData.items.map((i: any) => ({
            productId: i.product_id?.toString() || "",
            quantity: i.quantity?.toString() || "",
            notes: i.notes || "",
          }))
        : [{ productId: "", quantity: "", notes: "" }];

      setItems(initialItems);

      setTerms(
        initialData.terms?.length
          ? initialData.terms.map((t: any) => t.description || "")
          : [""]
      );

      setExistingAttachments(
        attachmentList.map((att: any) => ({
          file_name: att.file_name,
          file_data: att.file_data,
          file_type: att.file_type,
        }))
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
  }, [initialData, quotations]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleQuotationSelect = (quotationId: string) => {
    if (!quotationId) return;

    const selectedQuotation = quotations.find(
      (q) => q.id === parseInt(quotationId)
    );

    if (selectedQuotation) {
      setForm((prevForm) => ({
        ...prevForm,
        quotation_id: quotationId,
        project_name: selectedQuotation.project_name || "",
        request_date: selectedQuotation.request_date?.split("T")[0] || "",
        valid_days: selectedQuotation.valid_days || 30,
        client_id: selectedQuotation.client?.id || 0,
        company_name: selectedQuotation.client?.company_name || "",
        contact_person: selectedQuotation.client?.contact_person || "",
      }));

      if (selectedQuotation.items && selectedQuotation.items.length > 0) {
        const quotationItems = selectedQuotation.items.map((item: any) => {
          let productId = "";

          if (item.product_id) {
            productId = item.product_id.toString();
          } else {
            const matchingProduct = products.find(
              (product) => product.product_number === item.product_number
            );
            if (matchingProduct) {
              productId = matchingProduct.id.toString();
            }
          }

          return {
            productId: productId,
            quantity: item.quantity?.toString() || "1",
            notes: item.notes || item.description || "",
          };
        });

        setItems(quotationItems);
      } else {
        setItems([{ productId: "", quantity: "", notes: "" }]);
      }

      if (selectedQuotation.terms && selectedQuotation.terms.length > 0) {
        const quotationTerms = selectedQuotation.terms
          .map((term: any) => term.description || term.term || "")
          .filter((term: string) => term.trim() !== "");

        if (quotationTerms.length > 0) {
          setTerms(quotationTerms);
        } else {
          setTerms([""]);
        }
      } else {
        setTerms([""]);
      }

      toast({
        title: "Success",
        description: `Quotation ${selectedQuotation.quotation_number} loaded successfully`,
      });
    }
  };

  const getSelectedQuotationDisplay = () => {
    if (form.quotation_id) {
      const selectedQuotation = quotations.find(
        (q) => q.id === parseInt(form.quotation_id)
      );
      if (selectedQuotation) {
        return `${selectedQuotation.quotation_number} - ${selectedQuotation.project_name}`;
      }
    }

    if (mode === "edit" && initialQuotationData.current) {
      return `${initialQuotationData.current.quotation_number} - ${initialQuotationData.current.project_name}`;
    }

    if (mode === "edit" && form.project_name && form.client_id) {
      const matchingQuotation = quotations.find(
        (q) =>
          q.project_name === form.project_name &&
          q.client?.id === form.client_id
      );
      if (matchingQuotation) {
        return `${matchingQuotation.quotation_number} - ${matchingQuotation.project_name}`;
      }
    }

    return "Select Quotation Number";
  };

  const getSelectedClientDisplay = () => {
    if (!form.client_id) return "Select Client";

    const selectedClient = clients.find(
      (client) => client.id === form.client_id
    );
    if (selectedClient) {
      return `${selectedClient.company_name} (${selectedClient.contact_person})`;
    }

    return `${form.company_name} (${form.contact_person})`;
  };

  const getSelectedProductDisplay = (productId: string) => {
    if (!productId) return "Select Product";

    const productIdNum = parseInt(productId);
    const selectedProduct = products.find(
      (product) => product.id === productIdNum
    );
    if (selectedProduct) {
      return `${selectedProduct.product_number} - ${selectedProduct.name}`;
    }

    if (mode === "edit" && initialData?.items) {
      const initialItem = initialData.items.find((item: any) => {
        const itemProductIdNum = parseInt(item.product_id);
        return itemProductIdNum === productIdNum;
      });

      if (initialItem?.product) {
        return `${initialItem.product.product_number} - ${initialItem.product.name}`;
      }

      if (
        initialItem &&
        (initialItem.product_number || initialItem.product_name)
      ) {
        return `${initialItem.product_number} - ${initialItem.product_name}`;
      }
    }

    return "Select Product";
  };

  const getProductDetails = (productId: string) => {
    if (!productId) return null;

    const productIdNum = parseInt(productId);
    const productFromList = products.find(
      (product) => product.id === productIdNum
    );
    if (productFromList) return productFromList;

    if (mode === "edit" && initialData?.items) {
      const initialItem = initialData.items.find((item: any) => {
        const itemProductIdNum = parseInt(item.product_id);
        return itemProductIdNum === productIdNum;
      });

      if (initialItem?.product) {
        return initialItem.product;
      }

      if (
        initialItem &&
        (initialItem.product_number || initialItem.product_name)
      ) {
        return {
          id: initialItem.product_id,
          product_number: initialItem.product_number,
          name: initialItem.product_name,
          description:
            initialItem.product_description || initialItem.description || "",
          unit_price: initialItem.unit_price || "0",
          category: initialItem.category || "",
        };
      }
    }

    return null;
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
    setItems([...items, { productId: "", quantity: "", notes: "" }]);
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

  const isDataLoaded = clientsLoaded && productsLoaded && quotationsLoaded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDataLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while data is loading...",
        variant: "default",
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

      formData.append("po_number", form.po_number);
      formData.append("quotation_id", form.quotation_id);
      formData.append("request_date", form.request_date);
      formData.append("valid_days", form.valid_days.toString());
      formData.append("project_name", form.project_name);
      formData.append("client_id", form.client_id.toString());
      formData.append("signature_name", form.signature_name);
      formData.append("signature_title", form.signature_title);
      formData.append("created_by", user.id.toString());

      // Items dan Terms
      // formData.append("items", JSON.stringify(items));
      // formData.append(
      //   "terms",
      //   JSON.stringify(terms.filter((term) => term.trim() !== ""))
      // );

      attachments.forEach((f) => formData.append("attachments", f));
      if (signatureImage) formData.append("signature_image", signatureImage);

      let response;

      if (mode === "edit" && initialData?.id) {
        response = await updatePurchaseOrderAction(
          initialData.id.toString(),
          formData
        );
      } else {
        response = await createPurchaseOrderAction(formData);
      }

      if (response?.success) {
        toast({
          title: "Success",
          description:
            response.message ||
            `Purchase Order ${
              mode === "edit" ? "updated" : "created"
            } successfully.`,
        });

        const redirectId = mode === "edit" ? initialData.id : response.data?.id;
        router.push(`/purchase-orders/${redirectId}`);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to process purchase order.",
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
          <p>Loading purchase order data...</p>
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
          onClick={() => router.push("/purchase-orders")}
        >
          <IconArrowLeft size={16} className="mr-1" /> Back to Purchase Orders
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quotation_select">Quotation Number</Label>
                <Select
                  value={form.quotation_id}
                  onValueChange={handleQuotationSelect}
                >
                  <SelectTrigger id="quotation_select" className="w-full">
                    <SelectValue>{getSelectedQuotationDisplay()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {quotations.length > 0 ? (
                      quotations.map((quotation) => (
                        <SelectItem
                          key={quotation.id}
                          value={quotation.id.toString()}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {quotation.quotation_number}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {quotation.project_name} -{" "}
                              {quotation.client?.company_name}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        {quotationsLoaded
                          ? "No quotations available"
                          : "Loading quotations..."}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="po_number">Purchase Order Number</Label>
                <Input
                  id="po_number"
                  name="po_number"
                  value={form.po_number}
                  onChange={handleChange}
                  placeholder="Enter PO Number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name</Label>
                <Input
                  id="project_name"
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_date">Request Date</Label>
                <Input
                  id="request_date"
                  type="date"
                  name="request_date"
                  value={form.request_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_days">Valid Days</Label>
                <Input
                  id="valid_days"
                  type="number"
                  name="valid_days"
                  value={form.valid_days}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_select">Client</Label>
                <Select
                  value={form.client_id ? form.client_id.toString() : ""}
                  onValueChange={(value) => {
                    const selectedClient = clients.find(
                      (client) => client.id === Number(value)
                    );
                    setForm((prevForm) => ({
                      ...prevForm,
                      client_id: Number(value),
                      company_name: selectedClient?.company_name || "",
                      contact_person: selectedClient?.contact_person || "",
                    }));
                  }}
                >
                  <SelectTrigger id="client_select" className="w-full">
                    <SelectValue>{getSelectedClientDisplay()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}
                        >
                          {client.company_name} ({client.contact_person})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        {clientsLoaded
                          ? "No clients available"
                          : "Loading clients..."}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Products</Label>

              {!productsLoaded && (
                <div className="p-4 text-center text-muted-foreground">
                  Loading products...
                </div>
              )}

              {items.map((item, index) => {
                const selectedProduct = getProductDetails(item.productId);

                return (
                  <div key={index} className="border p-4 rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Product {index + 1}</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) =>
                          handleItemChange(index, "productId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {getSelectedProductDisplay(item.productId)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {products.length > 0 ? (
                            products.map((product) => (
                              <SelectItem
                                key={product.id}
                                value={product.id.toString()}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {product.product_number} - {product.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {product.category} - Rp{" "}
                                    {parseFloat(
                                      product.unit_price
                                    ).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              {productsLoaded
                                ? "No products available"
                                : "Loading products..."}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Product Details</Label>
                        {selectedProduct ? (
                          <div className="p-3 bg-muted/50 rounded-md text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Number:</span>
                                <p>{selectedProduct.product_number}</p>
                              </div>
                              <div>
                                <span className="font-medium">Category:</span>
                                <p>{selectedProduct.category}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">
                                  Description:
                                </span>
                                <p className="mt-1">
                                  {selectedProduct.description}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Unit Price:</span>
                                <p className="text-green-600 font-semibold">
                                  Rp{" "}
                                  {parseFloat(
                                    selectedProduct.unit_price
                                  ).toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground text-center">
                            {item.productId ? (
                              <div>
                                <p>Product not found in system</p>
                                <p className="text-xs mt-1">
                                  ID: {item.productId}
                                </p>
                              </div>
                            ) : (
                              <p>Select a product to view details</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            placeholder="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            required
                            min="1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`notes-${index}`}>
                            Notes (optional)
                          </Label>
                          <Textarea
                            id={`notes-${index}`}
                            placeholder="Additional notes for this product"
                            value={item.notes}
                            onChange={(e) =>
                              handleItemChange(index, "notes", e.target.value)
                            }
                          />
                        </div>

                        {selectedProduct &&
                          item.quantity &&
                          parseInt(item.quantity) > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  Total Price:
                                </span>
                                <span className="text-blue-700 font-bold text-lg">
                                  Rp{" "}
                                  {(
                                    parseFloat(selectedProduct.unit_price) *
                                    parseInt(item.quantity)
                                  ).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                          )}
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
                          <IconTrash size={14} className="mr-1" /> Remove
                          Product
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
                disabled={!productsLoaded}
              >
                <IconPlus size={14} className="mr-1" /> Add Product
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Terms</Label>
              {terms.map((term, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
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
                      <IconTrash size={14} />
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
                <IconPlus size={14} className="mr-1" /> Add Term
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="signature_name">Signature Name</Label>
                <Input
                  id="signature_name"
                  name="signature_name"
                  value={form.signature_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature_title">Signature Title</Label>
                <Input
                  id="signature_title"
                  name="signature_title"
                  value={form.signature_title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              {existingAttachments.length > 0 && (
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {existingAttachments.map((file, i) => (
                    <li key={i}>
                      <span>{file.file_name}</span>
                      {file.file_data && (
                        <a
                          href={`data:${file.file_type};base64,${Buffer.from(
                            file.file_data.replace(/^\\x/, ""),
                            "hex"
                          ).toString("base64")}`}
                          download={file.file_name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 ml-2 hover:underline"
                        >
                          View
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleAttachmentsChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature_image">Signature Image</Label>
              {existingSignature && (
                <div className="my-2">
                  <img
                    src={existingSignature}
                    alt="Signature"
                    className="h-24 border rounded-md shadow-sm"
                  />
                </div>
              )}
              <Input
                id="signature_image"
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading || !isDataLoaded}>
                {loading ? (
                  <>
                    <IconLoader className="animate-spin mr-2" size={16} />{" "}
                    {mode === "edit" ? "Updating..." : "Creating..."}
                  </>
                ) : mode === "edit" ? (
                  "Update Purchase Order"
                ) : (
                  "Create Purchase Order"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

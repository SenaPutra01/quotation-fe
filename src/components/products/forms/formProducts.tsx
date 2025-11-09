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
import { Switch } from "@/components/ui/switch";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import {
  createProductAction,
  updateProductAction,
} from "@/actions/product-actions";

export default function ProductForm({
  initialData = null,
  mode = "create",
}: {
  initialData?: any;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    product_number: "",
    name: "",
    description: "",
    unit_price: "",
    category: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((prev) => {
        const newForm = {
          product_number: initialData.product_number || "",
          name: initialData.name || "",
          description: initialData.description || "",
          unit_price: initialData.unit_price?.toString() || "",
          category: initialData.category || "",
          is_active:
            initialData.is_active !== undefined
              ? Boolean(initialData.is_active)
              : true,
        };

        if (JSON.stringify(prev) !== JSON.stringify(newForm)) {
          return newForm;
        }
        return prev;
      });
    }
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, category: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const request = {
        product_number: form.product_number?.trim(),
        name: form.name.trim(),
        description: form.description?.trim(),
        unit_price: Number(form.unit_price) ?? 0,
        category: form.category?.trim(),
        is_active:
          form.is_active !== undefined ? Boolean(form.is_active) : true,
      };

      let response;
      if (mode === "edit" && initialData?.id) {
        response = await updateProductAction(
          initialData.id.toString(),
          request
        );
      } else {
        response = await createProductAction(request);
      }

      if (response?.success) {
        toast({
          title: "Success",
          description:
            response.message ||
            `Product ${mode === "edit" ? "updated" : "created"} successfully.`,
        });
        router.push("/products");
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to save product.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      toast({
        title: "Error",
        description: "Something went wrong while saving product.",
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
          onClick={() => router.push("/products")}
        >
          <IconArrowLeft size={16} className="mr-1" /> Back to Products
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Product Number</Label>
                <Input
                  name="product_number"
                  value={form.product_number}
                  onChange={handleChange}
                  placeholder="e.g. PRD-001"
                  required
                />
              </div>

              <div>
                <Label>Product Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Web Design Service"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter product details or specifications..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Unit Price (IDR)</Label>
                <Input
                  name="unit_price"
                  type="number"
                  min="0"
                  value={form.unit_price}
                  onChange={handleChange}
                  placeholder="e.g. 5000000"
                  required
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">
                      Web Development
                    </SelectItem>
                    <SelectItem value="Mobile Development">
                      Mobile Development
                    </SelectItem>
                    <SelectItem value="API Development">
                      API Development
                    </SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Enterprise System">
                      Enterprise System
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end">
                <Label>Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <span>{form.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <IconLoader2 className="animate-spin mr-2" size={16} />
                    Saving...
                  </>
                ) : mode === "edit" ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

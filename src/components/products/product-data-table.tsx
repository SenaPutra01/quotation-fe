"use client";

import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  IconCircleCheckFilled,
  IconX,
  IconDotsVertical,
  IconLoader2,
  IconSearch,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { getProductsAction } from "@/actions/product-actions";
import { toast } from "sonner";

export default function ProductTable() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const handleAddProduct = () => router.push("/products/create");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters = {
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: pageSize,
      };

      const res = await getProductsAction(filters);

      if (res.success && Array.isArray(res.data)) {
        setData(res.data);
        setTotal(res.total || res.data.length);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleReset = () => {
    setStatusFilter("");
    setSearch("");
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
  };

  const statusColumn: ColumnDef<any> = {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <Badge
          variant={active ? "outline" : "secondary"}
          className="flex items-center gap-1.5 px-2 py-0.5 capitalize"
        >
          {active ? (
            <>
              <IconCircleCheckFilled className="fill-green-500" />
              Active
            </>
          ) : (
            <>
              <IconX className="text-red-500" />
              Inactive
            </>
          )}
        </Badge>
      );
    },
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "product_number",
      header: "Product Number",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.product_number}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => row.original.name || "-",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category || "-",
    },
    {
      accessorKey: "unit_price",
      header: "Unit Price",
      cell: ({ row }) => (
        <span className="text-left block">
          {Number(row.original.unit_price).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="truncate block max-w-xs text-muted-foreground">
          {row.original.description || "-"}
        </span>
      ),
    },
    statusColumn,
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => router.push(`/products/${product.id}/edit`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/products/${product.id}`)}
              >
                View Detail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm(`Delete Product ${product.name}?`)) {
                    toast({
                      title: "Feature not implemented",
                      description: "Delete function belum diimplementasi.",
                    });
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 sm:w-auto">
          <Input
            placeholder="Search product name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={handleSearch}>
            <IconSearch size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <IconLoader2 className="animate-spin mr-2" /> Loading products...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          page={page}
          pageSize={pageSize}
          totalCount={total}
          isLoading={loading}
          onPageChange={setPage}
          onAdd={handleAddProduct}
          addButtonLabel="Add Product"
        />
      )}
    </>
  );
}

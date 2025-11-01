"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  IconClock,
  IconDotsVertical,
  IconLoader2,
  IconSearch,
  IconX,
  IconTruckDelivery,
  IconFileInvoice,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { getPurchaseOrderAction } from "@/actions/purchaseOrder-actions";
import { SendEmailDialog } from "@/components/emails/modal";

export default function PurchaseOrderTabel() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any | null>(null);

  const handleAddPO = () => {
    router.push("/purchase-orders/create");
  };

  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: pageSize,
      };

      const res = await getPurchaseOrderAction(filters);

      if (res.success && Array.isArray(res.data)) {
        setData(res.data);
        const metaTotal =
          res.meta?.total ?? (Array.isArray(res.data) ? res.data.length : 0);
        setTotal(metaTotal);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, pageSize]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const statusColumn: ColumnDef<any> = {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase() || "";
      const getStatusIcon = () => {
        switch (status) {
          case "approved":
          case "done":
            return (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            );
          case "rejected":
          case "cancelled":
            return <IconX className="text-red-500 dark:text-red-400" />;
          case "draft":
            return <IconClock className="text-gray-400 dark:text-gray-500" />;
          case "pending":
            return (
              <IconFileInvoice className="text-blue-500 dark:text-blue-400" />
            );
          case "delivered":
            return <IconTruckDelivery className="text-amber-500" />;
          default:
            return (
              <IconLoader2 className="animate-spin text-muted-foreground" />
            );
        }
      };
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 px-2 py-0.5 text-muted-foreground capitalize"
        >
          {getStatusIcon()}
          {row.original.status || "-"}
        </Badge>
      );
    },
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "po_number",
      header: "PO Number",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.po_number}</span>
      ),
    },
    {
      accessorKey: "quotation_number",
      header: "Quotation Ref",
      cell: ({ row }) => row.original.quotation?.quotation_number || "-",
    },
    {
      accessorKey: "client",
      header: "Company",
      cell: ({ row }) => row.original.client?.company_name || "-",
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      cell: ({ row }) => row.original.project_name || "-",
    },
    {
      accessorKey: "order_date",
      header: "Order Date",
      cell: ({ row }) =>
        row.original.order_date
          ? new Date(row.original.order_date).toLocaleDateString("id-ID")
          : "-",
    },
    {
      accessorKey: "delivery_date",
      header: "Delivery Date",
      cell: ({ row }) =>
        row.original.delivery_date
          ? new Date(row.original.delivery_date).toLocaleDateString("id-ID")
          : "-",
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => (
        <span>
          {Number(row.original.total_amount || 0).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </span>
      ),
    },
    statusColumn,
    {
      id: "actions",
      cell: ({ row }) => {
        const po = row.original;
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
                onClick={() => router.push(`/purchase-orders/${po.id}/edit`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/purchase-orders/${po.id}`)}
              >
                View Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPO(po);
                  setIsEmailModalOpen(true);
                }}
              >
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm(`Delete Purchase Order ${po.po_number}?`)) {
                    alert("Delete function belum diimplementasi");
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
            placeholder="Search company or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                fetchPurchaseOrders();
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              fetchPurchaseOrders();
            }}
          >
            <IconSearch size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            onClick={() => {
              setStatusFilter("");
              setSearch("");
              setPage(1);
              fetchPurchaseOrders();
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <IconLoader2 className="animate-spin mr-2" /> Loading purchase
          orders...
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={data}
            page={page}
            pageSize={pageSize}
            totalCount={total}
            isLoading={loading}
            onAdd={handleAddPO}
            addButtonLabel="Add Purchase Order"
            onPageChange={(p) => {
              setPage(p);
              fetchPurchaseOrders();
            }}
          />
        </div>
      )}

      <SendEmailDialog
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        type="purchase-order"
        number={selectedPO?.po_number || ""}
        defaultSubject={`Purchase Order ${selectedPO?.po_number || ""}`}
        defaultMessage="Berikut lampiran purchase order Anda."
      />
    </>
  );
}

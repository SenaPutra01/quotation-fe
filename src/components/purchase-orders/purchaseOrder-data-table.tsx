"use client";

import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  IconClock,
  IconFileCheck,
  IconLoader2,
  IconSearch,
  IconX,
  IconSend,
  IconLock,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { SendEmailDialog } from "../emails/modal";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { StatusBadge } from "@/components/status-badges";
import { TableActions } from "../table-actions";
import {
  getPurchaseOrderAction,
  updatePurchaseOrderStatusAction,
} from "@/actions/purchaseOrder-actions";

import {
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderFilters,
  safeValidatePurchaseOrderResponse,
  extractPurchaseOrdersFromResponse,
  extractTotalFromResponse,
} from "@/types/purchaseOrder";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color:
      "text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800",
    icon: IconClock,
    iconClass: "text-gray-400 dark:text-gray-500",
  },
  submit: {
    label: "Submit",
    color:
      "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    icon: IconFileCheck,
    iconClass: "text-blue-500 dark:text-blue-400",
  },
  sent: {
    label: "Sent",
    color:
      "text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
    icon: IconSend,
    iconClass: "text-green-500 dark:text-green-400",
  },
  cancel: {
    label: "Cancelled",
    color:
      "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
    icon: IconX,
    iconClass: "text-red-500 dark:text-red-400",
  },
  close: {
    label: "Close",
    color:
      "text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800",
    icon: IconLock,
    iconClass: "text-purple-500 dark:text-purple-400",
  },
};

export default function PurchaseOrderTable() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrder | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();

  const handleAddPurchaseOrder = () => {
    router.push("/purchase-orders/create");
  };

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: PurchaseOrderFilters = {
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: pageSize,
      };

      const response = await getPurchaseOrderAction(filters);

      const validationResult = safeValidatePurchaseOrderResponse(response);

      if (validationResult.success) {
        const purchaseOrders = extractPurchaseOrdersFromResponse(
          validationResult.data
        );
        const totalCount = extractTotalFromResponse(validationResult.data);

        setData(purchaseOrders);
        setTotal(totalCount);

        if (purchaseOrders.length === 0) {
          setError("No purchase orders found");
        }
      } else {
        console.warn("Using manual parsing fallback");

        let purchaseOrders: PurchaseOrder[] = [];
        let totalCount = 0;

        if (response && response.success !== false) {
          if (Array.isArray(response.data)) {
            purchaseOrders = response.data;
            totalCount = response.meta?.total ?? response.data.length;
          } else if (response.data && Array.isArray(response.data.data)) {
            purchaseOrders = response.data.data;
            totalCount =
              response.data.pagination?.total ?? response.data.data.length;
          }
        }

        setData(purchaseOrders);
        setTotal(totalCount);

        if (purchaseOrders.length === 0) {
          setError("No purchase orders found");
        }
      }
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setError("Failed to fetch purchase orders");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [statusFilter, search, page, pageSize]);

  const handleStatusChange = async (
    purchaseOrderId: number,
    newStatus: PurchaseOrderStatus
  ) => {
    try {
      const updatedBy = 1;

      const result = await updatePurchaseOrderStatusAction(
        purchaseOrderId.toString(),
        newStatus,
        updatedBy
      );

      if (result.success) {
        fetchPurchaseOrders();
        toast({
          title: "Status updated successfully",
          description: `Purchase order status has been changed to ${newStatus}.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to update status",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Failed to update status",
        description: "An error occurred while updating status",
        variant: "destructive",
      });
    }
  };

  const handleCancelPurchaseOrder = async (purchaseOrder: PurchaseOrder) => {
    const confirmed = await confirmDialog.confirm({
      title: "Cancel Purchase Order",
      description: `Are you sure you want to cancel purchase order ${purchaseOrder.po_number}? This action cannot be undone.`,
      confirmText: "Yes, Cancel Purchase Order",
      variant: "destructive",
      onConfirm: async () => {
        await handleStatusChange(purchaseOrder.id, "cancel");
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const handleDeletePurchaseOrder = async (purchaseOrder: PurchaseOrder) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Purchase Order",
      description: `Are you sure you want to delete purchase order ${purchaseOrder.po_number}? This action cannot be undone and all data will be permanently removed.`,
      confirmText: "Yes, Delete Purchase Order",
      variant: "destructive",
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: "Purchase order deleted",
          description: `Purchase order ${purchaseOrder.po_number} has been deleted.`,
          variant: "default",
        });

        fetchPurchaseOrders();
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const columns: ColumnDef<PurchaseOrder>[] = [
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
      cell: ({ row }) => row.original.quotation.quotation_number,
    },
    {
      accessorKey: "client",
      header: "Company",
      cell: ({ row }) => row.original.client.company_name,
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      cell: ({ row }) => row.original.project_name,
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
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const purchaseOrder = row.original;

        return (
          <TableActions
            item={purchaseOrder}
            basePath="/purchase-orders"
            onCancel={handleCancelPurchaseOrder}
            onDelete={handleDeletePurchaseOrder}
            onSendEmail={(purchaseOrder) => {
              setSelectedPurchaseOrder(purchaseOrder);
              setIsEmailModalOpen(true);
            }}
          />
        );
      },
    },
  ];

  const handleEmailSuccess = () => {
    toast({
      title: "Email sent successfully",
      description: `Purchase order ${selectedPurchaseOrder?.po_number} has been sent via email.`,
      variant: "default",
    });

    setSelectedPurchaseOrder(null);
    fetchPurchaseOrders();
  };

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
              <SelectItem value="all">All Status</SelectItem>
              {(
                Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>
              ).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
                </SelectItem>
              ))}
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

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <IconLoader2 className="animate-spin mr-2" /> Loading purchase
          orders...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          page={page}
          pageSize={pageSize}
          totalCount={total}
          isLoading={loading}
          onPageChange={(p) => {
            setPage(p);
            fetchPurchaseOrders();
          }}
          onAdd={handleAddPurchaseOrder}
          addButtonLabel="Add Purchase Order"
        />
      )}

      <SendEmailDialog
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        type="purchase-order"
        number={selectedPurchaseOrder?.po_number || ""}
        defaultSubject={`Purchase Order ${
          selectedPurchaseOrder?.po_number || ""
        }`}
        defaultMessage="Berikut lampiran purchase order Anda."
        onSuccess={handleEmailSuccess}
      />

      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={confirmDialog.closeDialog}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
        onConfirm={confirmDialog.onConfirm!}
        onCancel={confirmDialog.onCancel}
      />
    </>
  );
}

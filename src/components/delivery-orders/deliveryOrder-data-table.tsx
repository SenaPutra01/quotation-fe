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
  IconLoader2,
  IconSearch,
  IconX,
  IconTruckDelivery,
  IconFileInvoice,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { SendEmailDialog } from "../emails/modal";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { StatusBadge } from "@/components/status-badges";
import { TableActions } from "../table-actions";
import { getDeliveryOrderAction } from "@/actions/deliveryOrder-action";

interface Client {
  id: number;
  company_name: string;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  project_name: string;
}

interface DeliveryOrder {
  id: number;
  do_number: string;
  status: DeliveryOrderStatus;
  do_date: string;
  client: Client;
  purchase_order: PurchaseOrder;
}

type DeliveryOrderStatus =
  | "draft"
  | "pending"
  | "approved"
  | "delivered"
  | "rejected"
  | "cancelled";

interface DeliveryOrderFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface DeliveryOrderResponse {
  success: boolean;
  data: DeliveryOrder[] | { data: DeliveryOrder[]; pagination?: any };
  meta?: { total: number };
  error?: string;
}

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color:
      "text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800",
    icon: IconClock,
    iconClass: "text-gray-400 dark:text-gray-500",
  },
  pending: {
    label: "Pending",
    color:
      "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    icon: IconFileInvoice,
    iconClass: "text-blue-500 dark:text-blue-400",
  },
  approved: {
    label: "Approved",
    color:
      "text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
    icon: IconCircleCheckFilled,
    iconClass: "text-green-500 dark:text-green-400",
  },
  delivered: {
    label: "Delivered",
    color:
      "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800",
    icon: IconTruckDelivery,
    iconClass: "text-amber-500 dark:text-amber-400",
  },
  rejected: {
    label: "Rejected",
    color:
      "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
    icon: IconX,
    iconClass: "text-red-500 dark:text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    color:
      "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
    icon: IconX,
    iconClass: "text-red-500 dark:text-red-400",
  },
};

const safeValidateDeliveryOrderResponse = (
  response: any
): { success: boolean; data?: DeliveryOrderResponse } => {
  if (!response) {
    return { success: false };
  }

  if (response.success === false) {
    return { success: false };
  }

  const hasValidData =
    Array.isArray(response.data) ||
    (response.data && Array.isArray(response.data.data));

  if (!hasValidData) {
    return { success: false };
  }

  return { success: true, data: response };
};

const extractDeliveryOrdersFromResponse = (
  response: DeliveryOrderResponse
): DeliveryOrder[] => {
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
};

const extractTotalFromResponse = (response: DeliveryOrderResponse): number => {
  if (response.meta?.total) {
    return response.meta.total;
  } else if (
    response.data &&
    !Array.isArray(response.data) &&
    response.data.pagination?.total
  ) {
    return response.data.pagination.total;
  } else if (Array.isArray(response.data)) {
    return response.data.length;
  }
  return 0;
};

export default function DeliveryOrderTable() {
  const [data, setData] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] =
    useState<DeliveryOrder | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();

  const handleAddDeliveryOrder = () => {
    router.push("/delivery-orders/create");
  };

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: DeliveryOrderFilters = {
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: pageSize,
      };

      const response = await getDeliveryOrderAction(filters);

      const validationResult = safeValidateDeliveryOrderResponse(response);

      if (validationResult.success && validationResult.data) {
        const deliveryOrders = extractDeliveryOrdersFromResponse(
          validationResult.data
        );
        const totalCount = extractTotalFromResponse(validationResult.data);

        setData(deliveryOrders);
        setTotal(totalCount);

        if (deliveryOrders.length === 0) {
          setError("No delivery orders found");
        }
      } else {
        console.warn("Using manual parsing fallback");

        let deliveryOrders: DeliveryOrder[] = [];
        let totalCount = 0;

        if (response && response.success !== false) {
          if (Array.isArray(response.data)) {
            deliveryOrders = response.data;
            totalCount = response.meta?.total ?? response.data.length;
          } else if (response.data && Array.isArray(response.data.data)) {
            deliveryOrders = response.data.data;
            totalCount =
              response.data.pagination?.total ?? response.data.data.length;
          }
        }

        setData(deliveryOrders);
        setTotal(totalCount);

        if (deliveryOrders.length === 0) {
          setError("No delivery orders found");
        }
      }
    } catch (err) {
      console.error("Error fetching delivery orders:", err);
      setError("Failed to fetch delivery orders");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
  }, [statusFilter, search, page, pageSize]);

  const handleCancelDeliveryOrder = async (deliveryOrder: DeliveryOrder) => {
    const confirmed = await confirmDialog.confirm({
      title: "Cancel Delivery Order",
      description: `Are you sure you want to cancel delivery order ${deliveryOrder.do_number}? This action cannot be undone.`,
      confirmText: "Yes, Cancel Delivery Order",
      variant: "destructive",
      onConfirm: async () => {
        toast({
          title: "Delivery order cancelled",
          description: `Delivery order ${deliveryOrder.do_number} has been cancelled.`,
          variant: "default",
        });

        fetchDeliveryOrders();
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const handleDeleteDeliveryOrder = async (deliveryOrder: DeliveryOrder) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Delivery Order",
      description: `Are you sure you want to delete delivery order ${deliveryOrder.do_number}? This action cannot be undone and all data will be permanently removed.`,
      confirmText: "Yes, Delete Delivery Order",
      variant: "destructive",
      onConfirm: async () => {
        toast({
          title: "Delivery order deleted",
          description: `Delivery order ${deliveryOrder.do_number} has been deleted.`,
          variant: "default",
        });

        fetchDeliveryOrders();
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const columns: ColumnDef<DeliveryOrder>[] = [
    {
      accessorKey: "do_number",
      header: "DO Number",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.do_number}</span>
      ),
    },
    {
      accessorKey: "po_number",
      header: "PO Number Ref",
      cell: ({ row }) => row.original.purchase_order?.po_number || "-",
    },
    {
      accessorKey: "client",
      header: "Company",
      cell: ({ row }) => row.original.client?.company_name || "-",
    },
    {
      accessorKey: "project_name",
      header: "Project Name",
      cell: ({ row }) => row.original.purchase_order?.project_name || "-",
    },
    {
      accessorKey: "do_date",
      header: "DO Date",
      cell: ({ row }) =>
        row.original.do_date
          ? new Date(row.original.do_date).toLocaleDateString("id-ID")
          : "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const deliveryOrder = row.original;

        return (
          <TableActions
            item={deliveryOrder}
            basePath="/delivery-orders"
            onCancel={handleCancelDeliveryOrder}
            onDelete={handleDeleteDeliveryOrder}
            onSendEmail={(deliveryOrder) => {
              setSelectedDeliveryOrder(deliveryOrder);
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
      description: `Delivery order ${selectedDeliveryOrder?.do_number} has been sent via email.`,
      variant: "default",
    });

    setSelectedDeliveryOrder(null);
    fetchDeliveryOrders();
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
                fetchDeliveryOrders();
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              fetchDeliveryOrders();
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
              fetchDeliveryOrders();
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
          <IconLoader2 className="animate-spin mr-2" /> Loading delivery
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
            fetchDeliveryOrders();
          }}
          onAdd={handleAddDeliveryOrder}
          addButtonLabel="Add Delivery Order"
        />
      )}

      <SendEmailDialog
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        type="delivery-order"
        number={selectedDeliveryOrder?.do_number || ""}
        defaultSubject={`Delivery Order ${
          selectedDeliveryOrder?.do_number || ""
        }`}
        defaultMessage="Berikut lampiran delivery order Anda."
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

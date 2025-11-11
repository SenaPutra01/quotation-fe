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
  IconFileInvoice,
  IconLoader2,
  IconSearch,
  IconX,
  IconCircleCheckFilled,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { SendEmailDialog } from "../emails/modal";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { StatusBadge } from "@/components/status-badges";
import { TableActions } from "../table-actions";
import {
  getInvoiceAction,
  updateInvoiceStatusAction,
} from "@/actions/invoice-actions";

import {
  Invoice,
  InvoiceStatus,
  InvoiceFilters,
  safeValidateInvoiceResponse,
  extractInvoicesFromResponse,
  extractTotalFromResponse,
} from "@/types/invoice";

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

export default function InvoiceTable() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();

  const handleAddInvoice = () => {
    router.push("/invoices/create");
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: InvoiceFilters = {
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: pageSize,
      };

      const response = await getInvoiceAction(filters);

      const validationResult = safeValidateInvoiceResponse(response);

      if (validationResult.success) {
        const invoices = extractInvoicesFromResponse(validationResult.data);
        const totalCount = extractTotalFromResponse(validationResult.data);

        setData(invoices);
        setTotal(totalCount);

        if (invoices.length === 0) {
          setError("No invoices found");
        }
      } else {
        console.warn("Using manual parsing fallback");

        let invoices: Invoice[] = [];
        let totalCount = 0;

        if (response && response.success !== false) {
          if (Array.isArray(response.data)) {
            invoices = response.data;
            totalCount = response.meta?.total ?? response.data.length;
          } else if (response.data && Array.isArray(response.data.data)) {
            invoices = response.data.data;
            totalCount =
              response.data.pagination?.total ?? response.data.data.length;
          }
        }

        setData(invoices);
        setTotal(totalCount);

        if (invoices.length === 0) {
          setError("No invoices found");
        }
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("Failed to fetch invoices");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search, page, pageSize]);

  const handleStatusChange = async (
    invoiceId: number,
    newStatus: InvoiceStatus
  ) => {
    try {
      const updatedBy = 1;

      const result = await updateInvoiceStatusAction(
        invoiceId.toString(),
        newStatus,
        updatedBy
      );

      if (result.success) {
        fetchInvoices();
        toast({
          title: "Status updated successfully",
          description: `Invoice status has been changed to ${newStatus}.`,
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

  const handleCancelInvoice = async (invoice: Invoice) => {
    const confirmed = await confirmDialog.confirm({
      title: "Cancel Invoice",
      description: `Are you sure you want to cancel invoice ${invoice.invoice_number}? This action cannot be undone.`,
      confirmText: "Yes, Cancel Invoice",
      variant: "destructive",
      onConfirm: async () => {
        await handleStatusChange(invoice.id, "cancel");
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Invoice",
      description: `Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone and all data will be permanently removed.`,
      confirmText: "Yes, Delete Invoice",
      variant: "destructive",
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: "Invoice deleted",
          description: `Invoice ${invoice.invoice_number} has been deleted.`,
          variant: "default",
        });

        fetchInvoices();
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoice_number",
      header: "Invoice Number",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.invoice_number}</span>
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
      cell: ({ row }) => row.original.project_name || "-",
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => (
        <span className="text-left block">
          {Number(row.original.total_amount || 0).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </span>
      ),
    },
    {
      accessorKey: "invoice_date",
      header: "Invoice Date",
      cell: ({ row }) =>
        row.original.invoice_date
          ? new Date(row.original.invoice_date).toLocaleDateString("id-ID")
          : "-",
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => {
        if (!row.original.invoice_date) return "-";

        const invoiceDate = new Date(row.original.invoice_date);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(invoiceDate.getDate() + 30);

        return dueDate.toLocaleDateString("id-ID");
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;

        return (
          <TableActions
            item={invoice}
            basePath="/invoices"
            dataType="invoice"
            onCancel={handleCancelInvoice}
            onDelete={handleDeleteInvoice}
            onSendEmail={(invoice) => {
              setSelectedInvoice(invoice);
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
      description: `Invoice ${selectedInvoice?.invoice_number} has been sent via email.`,
      variant: "default",
    });

    setSelectedInvoice(null);
    fetchInvoices();
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
                fetchInvoices();
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              fetchInvoices();
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
              fetchInvoices();
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
          <IconLoader2 className="animate-spin mr-2" /> Loading invoices...
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
            fetchInvoices();
          }}
          onAdd={handleAddInvoice}
          addButtonLabel="Add Invoice"
        />
      )}

      <SendEmailDialog
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        type="invoice"
        number={selectedInvoice?.invoice_number || ""}
        defaultSubject={`Invoice ${selectedInvoice?.invoice_number || ""}`}
        defaultMessage="Berikut lampiran invoice Anda."
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

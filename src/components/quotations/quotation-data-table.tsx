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
  getQuotationsAction,
  updateQuotationStatusAction,
} from "@/actions/quotation-actions";
import { Quotation } from "@/types/quotations";
import {
  IconCircleCheckFilled,
  IconClock,
  IconDotsVertical,
  IconFileCheck,
  IconLoader,
  IconLoader2,
  IconSearch,
  IconX,
  IconChevronDown,
  IconSend,
  IconLock,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { SendEmailDialog } from "../emails/modal";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { StatusBadge } from "@/components/status-badges";
import { TableActions } from "../table-actions";

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
  close: {
    label: "Close",
    color:
      "text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800",
    icon: IconLock,
    iconClass: "text-purple-500 dark:text-purple-400",
  },
  cancel: {
    label: "Cancel",
    color:
      "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
    icon: IconX,
    iconClass: "text-red-500 dark:text-red-400",
  },
};

export default function QuotationTable() {
  const [data, setData] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );

  const router = useRouter();
  const { toast } = useToast();

  const confirmDialog = useConfirmDialog();

  const handleAddQuotation = () => {
    router.push("/quotations/create");
  };

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: pageSize,
      };

      const res = await getQuotationsAction(filters);

      if (res.success && Array.isArray(res.data)) {
        setData(res.data);
        setTotal(res.meta?.total ?? res.data.length ?? 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, search, page, pageSize]);

  const handleStatusChange = async (quotationId: string, newStatus: string) => {
    try {
      const updatedBy = 1;

      const result = await updateQuotationStatusAction(
        quotationId,
        newStatus,
        updatedBy
      );

      if (result.success) {
        fetchQuotations();
        toast({
          title: "Status updated successfully",
          description: `Quotation status has been changed to ${newStatus}.`,
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

  const handleCancelQuotation = async (quotation: Quotation) => {
    const confirmed = await confirmDialog.confirm({
      title: "Cancel Quotation",
      description: `Are you sure you want to cancel quotation ${quotation.quotation_number}? This action cannot be undone.`,
      confirmText: "Yes, Cancel Quotation",
      variant: "destructive",
      onConfirm: async () => {
        await handleStatusChange(quotation.id, "cancel");
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const handleDeleteQuotation = async (quotation: Quotation) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Quotation",
      description: `Are you sure you want to delete quotation ${quotation.quotation_number}? This action cannot be undone and all data will be permanently removed.`,
      confirmText: "Yes, Delete Quotation",
      variant: "destructive",
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: "Quotation deleted",
          description: `Quotation ${quotation.quotation_number} has been deleted.`,
          variant: "default",
        });

        fetchQuotations();
        confirmDialog.closeDialog();
      },
      onCancel: () => {
        confirmDialog.closeDialog();
      },
    });
  };

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: "quotation_number",
      header: "Quotation No.",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.quotation_number}</span>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.original.client?.company_name || "-",
    },
    {
      accessorKey: "project_name",
      header: "Project",
      cell: ({ row }) => <span>{row.original.project_name}</span>,
    },
    {
      accessorKey: "requestor",
      header: "Requestor",
      cell: ({ row }) => row.original.client?.contact_person || "-",
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => (
        <span className="text-left block">
          {Number(row.original.total_amount).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </span>
      ),
    },
    {
      accessorKey: "valid_until",
      header: "Valid Until",
      cell: ({ row }) => (
        <span>{new Date(row.original.valid_until).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status || "draft"} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const quotation = row.original;

        return (
          <TableActions
            item={quotation}
            basePath="/quotations"
            onCancel={handleCancelQuotation}
            onDelete={handleDeleteQuotation}
            onSendEmail={(quotation) => {
              setSelectedQuotation(quotation);
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
      description: `Quotation ${selectedQuotation?.quotation_number} has been sent via email.`,
      variant: "default",
    });

    setSelectedQuotation(null);
    fetchQuotations();
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
                fetchQuotations();
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              fetchQuotations();
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
                  {STATUS_CONFIG[status].label}
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
              fetchQuotations();
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <IconLoader2 className="animate-spin mr-2" /> Loading quotations...
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
            fetchQuotations();
          }}
          onAdd={handleAddQuotation}
          addButtonLabel="Add Quotation"
        />
      )}

      <SendEmailDialog
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        type="quotation"
        number={selectedQuotation?.quotation_number || ""}
        defaultSubject={`Quotation ${
          selectedQuotation?.quotation_number || ""
        }`}
        defaultMessage="Berikut lampiran quotation Anda."
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

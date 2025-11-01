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
import { getQuotationsAction } from "@/actions/quotation-actions";
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
  IconPlus,
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

  const statusColumn: ColumnDef<Quotation> = {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase() || "";
      const getStatusIcon = () => {
        switch (status) {
          case "accepted":
          case "done":
          case "approved":
            return (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            );
          case "rejected":
          case "cancelled":
            return <IconX className="text-red-500 dark:text-red-400" />;
          case "draft":
            return <IconClock className="text-gray-400 dark:text-gray-500" />;
          case "sent":
            return (
              <IconFileCheck className="text-blue-500 dark:text-blue-400" />
            );
          default:
            return (
              <IconLoader className="animate-spin text-muted-foreground" />
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
    statusColumn,
    {
      id: "actions",
      cell: ({ row }) => {
        const quotation = row.original;

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
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => router.push(`/quotations/${quotation.id}/edit`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/quotations/${quotation.id}`)}
              >
                View Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedQuotation(quotation);
                  setIsEmailModalOpen(true);
                }}
              >
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (
                    confirm(`Delete quotation ${quotation.quotation_number}?`)
                  ) {
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
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
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
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
        onSuccess={() => {
          setSelectedQuotation(null);
        }}
      />
    </>
  );
}

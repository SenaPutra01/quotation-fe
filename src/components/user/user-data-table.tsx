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
  IconUser,
  IconEdit,
  IconKey,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { getUsersAction, getRolesAction } from "@/actions/user-actions";
import { toast } from "sonner";
import { Role, User } from "@/types/users";
import Link from "next/link";
import { AddUserModal } from "./add-user-modal";
import { EditUserModal } from "./edit-user-modal";

export default function UserTable() {
  const router = useRouter();

  const [data, setData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const filters = {
          search: search || undefined,
          status: statusFilter || undefined,
          page,
          limit: pageSize,
        };
        const res = await getUsersAction(filters);

        if (res.success && Array.isArray(res.data)) {
          setData(res.data);
          setTotal(res.total || res.data.length);
        } else {
          setData([]);
          setTotal(0);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await getRolesAction();
        if (res.success) setRoles(res.data);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };

    fetchUsers();
    fetchRoles();
  }, [page, pageSize, search, statusFilter]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleReset = () => {
    setStatusFilter("");
    setSearch("");
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
  };

  const handleUserAdded = () => {
    toast.success("User added successfully!");
  };

  const handleUserUpdated = () => {
    toast.success("User updated successfully!");
  };

  const onEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const onResetPassword = (user: User) => {
    toast.info(`Reset password for ${user.username}`);
  };

  const onDelete = (user: User) => {
    toast.error(`Deleted ${user.username}`);
  };

  const statusColumn: ColumnDef<User> = {
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

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <IconUser className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user.username}</span>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <Badge
              key={role.id}
              variant="outline"
              className="px-1.5 text-xs capitalize"
            >
              {role.name.replace("_", " ")}
            </Badge>
          ))}
        </div>
      ),
    },
    statusColumn,
    {
      accessorKey: "last_login",
      header: "Last Login",
      cell: ({ row }) => {
        const lastLogin = row.getValue("last_login") as string;
        return (
          <div className="text-sm text-muted-foreground">
            {lastLogin ? new Date(lastLogin).toLocaleDateString() : "Never"}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDotsVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <IconEdit className="size-4 mr-2" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(user)}>
                <IconKey className="size-4 mr-2" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconEye className="size-4 mr-2" />
                <Link href={`/users/${user.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(user)}
              >
                <IconTrash className="size-4 mr-2" />
                Delete User
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
            placeholder="Search username or email..."
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
          <Button onClick={() => setAddUserModalOpen(true)}>Add User</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <IconLoader2 className="animate-spin mr-2" /> Loading users...
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
        />
      )}

      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
        roles={roles}
      />
    </>
  );
}

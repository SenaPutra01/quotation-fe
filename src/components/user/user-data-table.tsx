"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconCircleCheckFilled,
  IconLoader,
  IconUser,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconKey,
  IconEye,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddUserModal } from "@/components/user/add-user-modal";
import { EditUserModal } from "@/components/user/edit-user-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { Role, User } from "@/types/users";
import { useModal } from "@/hooks/use-modal";
import { getUsersAction, getRolesAction } from "@/actions/user-actions";
import Link from "next/link";

interface UsersDataTableProps {
  initialData?: User[];
}

interface UserActionsProps {
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onViewDetails: (user: User) => void;
  onDelete: (user: User) => void;
}

const getUserColumns = ({
  onEdit,
  onResetPassword,
  onViewDetails,
  onDelete,
}: UserActionsProps): ColumnDef<User>[] => [
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
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => <div>{row.getValue("first_name") || "-"}</div>,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => <div>{row.getValue("last_name") || "-"}</div>,
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.getValue("roles") as User["roles"];
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <Badge
              key={role.id}
              variant="outline"
              className={`px-1.5 text-xs capitalize ${
                role.name === "super_admin"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : role.name === "admin"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {role.name.replace("_", " ")}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`px-2 py-1 text-xs ${
          row.getValue("is_active")
            ? "text-green-600 border-green-200 bg-green-50"
            : "text-red-600 border-red-200 bg-red-50"
        }`}
      >
        {row.getValue("is_active") ? (
          <IconCircleCheckFilled className="size-3 fill-green-500 mr-1" />
        ) : (
          <IconLoader className="size-3 mr-1" />
        )}
        {row.getValue("is_active") ? "Active" : "Inactive"}
      </Badge>
    ),
  },
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
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 data-[state=open]:bg-muted text-muted-foreground"
              size="icon"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Open menu</span>
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
              <Link href={`/user/${user.id}`}>View Details</Link>
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

export function UsersDataTable({ initialData }: UsersDataTableProps) {
  const [data, setData] = useState<User[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const addUserModal = useModal();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleResetPassword = useCallback((user: User) => {
    toast.info(`Reset password for ${user.username} coming soon`);
  }, []);

  const handleViewDetails = useCallback((user: User) => {
    toast.info(`View details for ${user.username} coming soon`);
  }, []);

  const handleDelete = useCallback((user: User) => {
    toast.info(`Delete ${user.username} coming soon`);
  }, []);

  const columns = getUserColumns({
    onEdit: handleEdit,
    onResetPassword: handleResetPassword,
    onViewDetails: handleViewDetails,
    onDelete: handleDelete,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (initialData) return;

      try {
        setIsLoading(true);
        setError(null);

        const result = await getUsersAction();

        if (result.success) {
          setData(result.data || []);
        } else {
          throw new Error(result.error || "Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [initialData]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await getRolesAction();
        if (result.success && result.data) {
          setRoles(result.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    if (isEditModalOpen) {
      fetchRoles();
    }
  }, [isEditModalOpen]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleAddUser = () => {
    addUserModal.onOpen();
  };

  const handleUserAdded = () => {
    toast.success("User added successfully");
    window.location.reload();
  };

  const handleUserUpdated = () => {
    toast.success("User updated successfully");
    window.location.reload();
  };

  const tabs = [
    {
      value: "all",
      label: "All Users",
      count: data.length,
    },
    {
      value: "active",
      label: "Active Users",
      count: data.filter((user) => user.is_active).length,
    },
    {
      value: "admins",
      label: "Administrators",
      count: data.filter((user) =>
        user.roles.some((role) => role.name.includes("admin"))
      ).length,
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        searchColumn="username"
        searchPlaceholder="Search users..."
        tabs={tabs}
        defaultTab="all"
        onAdd={handleAddUser}
        addButtonLabel="Add User"
        enableDragAndDrop={false}
        enableRowSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={10}
        totalCount={data.length}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
      />

      <AddUserModal
        isOpen={addUserModal.isOpen}
        onClose={addUserModal.onClose}
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

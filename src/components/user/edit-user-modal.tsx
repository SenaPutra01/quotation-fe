"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Role } from "@/types/users";
import { updateUserAction, getRolesAction } from "@/actions/user-actions";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
  user: User | null;
  roles?: Role[];
}

interface EditUserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export function EditUserModal({
  isOpen,
  onClose,
  onUserUpdated,
  user,
  roles = [],
}: EditUserModalProps) {
  const { toast } = useToast();
  const [availableRoles, setAvailableRoles] = useState<Role[]>(roles);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await getRolesAction();
        if (result.success && result.data) {
          setAvailableRoles(result.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive",
        });
      }
    };

    if (isOpen && availableRoles.length === 0) {
      fetchRoles();
    }
  }, [isOpen, availableRoles.length, toast]);

  const form = useForm<EditUserFormData>({
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.roles?.[0]?.name || "",
        is_active: user.is_active,
      });
    }
  }, [user, isOpen, form]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const result = await updateUserAction(user.id, data);

      if (result.success) {
        const updatedUser = {
          ...user,
          ...data,
          roles: availableRoles.filter((role) => role.name === data.role),
        };
        onUserUpdated(updatedUser);
        onClose();
      } else {
        throw new Error(result.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit User"
      description="Update user information and permissions"
      size="md"
      showCloseButton={false}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={availableRoles.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableRoles.length === 0
                            ? "Loading roles..."
                            : "Select a role"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        <div className="flex flex-col">
                          <span className="font-medium capitalize">
                            {role.name.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    User can login and access the system
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-3 w-full pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}

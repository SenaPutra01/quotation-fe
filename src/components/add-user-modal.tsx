"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconLoader,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreateUserData, createUserSchema, Role } from "@/types/createUser";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  return { checks, strength };
};

export function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
    strength: 0,
  });
  const [hasFetchedRoles, setHasFetchedRoles] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "",
    },
  });

  const passwordValue = form.watch("password");

  useEffect(() => {
    if (passwordValue) {
      setPasswordStrength(checkPasswordStrength(passwordValue));
    } else {
      setPasswordStrength({
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
        strength: 0,
      });
    }
  }, [passwordValue]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const initializeModal = async () => {
      form.reset({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "",
      });

      if (roles.length === 0 && isMounted) {
        try {
          const token = localStorage.getItem("accessToken");
          if (!token) return;

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/roles`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (isMounted && response.ok) {
            const result = await response.json();
            setRoles(result.roles.filter((role: Role) => role.is_active));
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
        }
      }
    };

    initializeModal();

    return () => {
      isMounted = false;
    };
  }, [isOpen, form]);

  const onSubmit = async (data: CreateUserData) => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${process.env.BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          errorData.message || `Failed to create user: ${response.status}`
        );
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: `User ${data.username} created successfully`,
      });

      form.reset();
      onUserAdded();
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return "text-red-500";
    if (strength <= 4) return "text-yellow-500";
    return "text-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. All fields are required.
          </DialogDescription>
        </DialogHeader>

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
                      <Input
                        placeholder="Enter first name"
                        {...field}
                        value={field.value || ""}
                      />
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
                      <Input
                        placeholder="Enter last name"
                        {...field}
                        value={field.value || ""}
                      />
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
                    <Input
                      placeholder="Enter username"
                      {...field}
                      value={field.value || ""}
                    />
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
                    <Input
                      type="email"
                      placeholder="Enter email"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...field}
                          value={field.value || ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <IconEyeOff className="h-4 w-4" />
                          ) : (
                            <IconEye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {passwordValue && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Password strength:
                            </span>
                            <Badge
                              variant="outline"
                              className={getStrengthColor(
                                passwordStrength.strength
                              )}
                            >
                              {getStrengthText(passwordStrength.strength)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              {passwordStrength.checks.length ? (
                                <IconCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <IconX className="h-3 w-3 text-red-500" />
                              )}
                              <span>8+ characters</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {passwordStrength.checks.uppercase ? (
                                <IconCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <IconX className="h-3 w-3 text-red-500" />
                              )}
                              <span>Uppercase</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {passwordStrength.checks.lowercase ? (
                                <IconCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <IconX className="h-3 w-3 text-red-500" />
                              )}
                              <span>Lowercase</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {passwordStrength.checks.number ? (
                                <IconCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <IconX className="h-3 w-3 text-red-500" />
                              )}
                              <span>Number</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {passwordStrength.checks.special ? (
                                <IconCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <IconX className="h-3 w-3 text-red-500" />
                              )}
                              <span>Special character</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          <div className="flex flex-col">
                            <span className="font-medium capitalize">
                              {role.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                            <span className="text-xs text-blue-600">
                              {role.user_count} users
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || passwordStrength.strength < 3}
              >
                {isLoading ? (
                  <>
                    <IconLoader className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

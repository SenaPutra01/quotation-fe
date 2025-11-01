"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreateUserData, createUserSchema, Role } from "@/types/users";
import { getRolesAction, createUserAction } from "@/actions/user-actions";

interface PasswordStrength {
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  strength: number;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
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

const getStrengthColor = (strength: number): string => {
  if (strength <= 2) return "text-red-500";
  if (strength <= 4) return "text-yellow-500";
  return "text-green-500";
};

const getStrengthText = (strength: number): string => {
  if (strength <= 2) return "Weak";
  if (strength <= 4) return "Medium";
  return "Strong";
};

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
    strength: 0,
  });
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

    const fetchRoles = async () => {
      try {
        const result = await getRolesAction();

        if (result.success && result.data) {
          setRoles(result.data.filter((role: Role) => role.is_active));
        } else {
          throw new Error(result.error || "Failed to load roles");
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

    form.reset({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "",
    });

    fetchRoles();
  }, [isOpen]);

  const onSubmit = async (data: CreateUserData) => {
    try {
      setIsLoading(true);

      const result = await createUserAction(data);

      if (result.success) {
        toast({
          title: "Success",
          description:
            result.message || `User ${data.username} created successfully`,
        });

        form.reset();
        onUserAdded();
        onClose();
      } else {
        throw new Error(result.error || "Failed to create user");
      }
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

  const footerContent = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading || passwordStrength.strength < 3}
        className="flex-1"
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
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      description="Create a new user account. All fields are required."
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
                    <Input
                      placeholder="Enter first name"
                      {...field}
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Password Strength Indicator */}
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
                  disabled={isLoading}
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
                            {role.name.replace("_", " ")}
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
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || passwordStrength.strength < 3}
              className="flex-1"
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
          </div>
        </form>
      </Form>
    </Modal>
  );
}

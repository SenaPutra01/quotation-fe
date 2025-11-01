"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconEdit,
  IconMail,
  IconUser,
  IconCalendar,
  IconShield,
  IconCheck,
  IconX,
  IconRefresh,
  IconKey,
} from "@tabler/icons-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UserDetail } from "@/types/users";
import { getUserDetailAction } from "@/actions/user-actions";
import Link from "next/link";

interface UserDetailContentProps {
  initialUser: UserDetail | null;
  userId: string;
}

export function UserDetailContent({
  initialUser,
  userId,
}: UserDetailContentProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserDetail | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (initialUser) return;

      try {
        setIsLoading(true);
        setError(null);

        const result = await getUserDetailAction(userId.toString());

        if (result.success && result.data) {
          setUser(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch user details");
        }
      } catch (err) {
        console.error("❌ Error in component:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch user details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId, initialUser]);

  const handleEditUser = () => {
    toast({
      title: "Edit User",
      description: "Edit functionality will be implemented soon.",
    });
  };

  const handleResetPassword = () => {
    toast({
      title: "Reset Password",
      description: "Password reset functionality will be implemented soon.",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp");
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/user">
            <Button variant="outline" size="icon">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-2">Error</div>
              <div className="text-gray-600 mb-4">{error}</div>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/users">
            <Button variant="outline" size="icon">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">User not found</div>
              <Button onClick={() => router.push("/users")} className="mt-4">
                Back to Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
            <p className="text-muted-foreground">
              View and manage user information, roles, and permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetPassword}>
            <IconKey className="h-4 w-4 mr-2" />
            Reset Password
          </Button>
          <Button onClick={handleEditUser}>
            <IconEdit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* User Profile Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Basic information about the user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.first_name} {user.last_name}
                    </h2>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconMail className="h-4 w-4" />
                      Email Address
                    </div>
                    <div className="font-medium">{user.email}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconUser className="h-4 w-4" />
                      Status
                    </div>
                    <div>
                      <Badge
                        variant={user.is_active ? "default" : "secondary"}
                        className={
                          user.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {user.is_active ? (
                          <>
                            <IconCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <IconX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconCalendar className="h-4 w-4" />
                      Member Since
                    </div>
                    <div className="font-medium">
                      {formatDate(user.created_at)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconRefresh className="h-4 w-4" />
                      Last Login
                    </div>
                    <div className="font-medium">
                      {user.last_login ? formatDate(user.last_login) : "Never"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roles Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>User role assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <div key={role.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {role.name?.replace("_", " ") || "Unnamed Role"}
                        </span>
                        {role.is_system && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description || "No description available"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No roles assigned
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Roles Card */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Roles</CardTitle>
                <CardDescription>Roles assigned to this user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <IconShield className="h-4 w-4 text-blue-500" />
                          <span className="font-medium capitalize">
                            {role.name?.replace("_", " ") || "Unnamed Role"}
                          </span>
                          {role.is_system && (
                            <Badge variant="secondary" className="text-xs">
                              System Role
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {role.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No roles assigned to this user
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Permissions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Effective Permissions</CardTitle>
                <CardDescription>
                  All permissions granted through roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.permissions && user.permissions.length > 0 ? (
                    user.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                permission.action === "read"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : permission.action === "write"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : permission.action === "delete"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }
                            >
                              {permission.action}
                            </Badge>
                            <span className="font-medium capitalize">
                              {permission.resource}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No permissions assigned
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permission Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Permission Summary</CardTitle>
              <CardDescription>
                Overview of user permissions by resource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.permissions && user.permissions.length > 0 ? (
                  Array.from(
                    new Set(user.permissions.map((p) => p.resource))
                  ).map((resource) => {
                    const resourcePermissions = user.permissions!.filter(
                      (p) => p.resource === resource
                    );

                    return (
                      <div
                        key={resource}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="space-y-2">
                          <div className="font-medium capitalize">
                            {resource.replace(":", " ")}
                          </div>
                          <div className="flex gap-2">
                            {resourcePermissions.map((permission) => (
                              <Badge
                                key={permission.id}
                                variant="secondary"
                                className={
                                  permission.action === "read"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : permission.action === "write"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : permission.action === "delete"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                }
                              >
                                {permission.action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {resourcePermissions.length} permission
                          {resourcePermissions.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No permissions available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                Recent activity and access information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Account Created
                  </div>
                  <div className="font-medium">
                    {formatDate(user.created_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="font-medium">
                    {formatDate(user.updated_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Last Login
                  </div>
                  <div className="font-medium">
                    {user.last_login
                      ? formatDate(user.last_login)
                      : "Never logged in"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Account Status
                  </div>
                  <div>
                    <Badge
                      variant={user.is_active ? "default" : "secondary"}
                      className={
                        user.is_active
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center text-muted-foreground py-8">
                <IconCalendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed activity log will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

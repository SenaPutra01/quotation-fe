"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/users";
import { deleteUserAction } from "@/actions/user-actions";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: (userId: string) => void;
  user: User | null;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onUserDeleted,
  user,
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await deleteUserAction(user.id);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "User deleted successfully",
        });

        onUserDeleted(user.id);
        onClose();
      } else {
        throw new Error(result.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
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
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Deleting...
          </>
        ) : (
          "Delete User"
        )}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      description="This action cannot be undone"
      footer={footerContent}
      size="sm"
      showCloseButton={false}
    >
      <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="font-medium text-red-800">
            Are you sure you want to delete this user?
          </p>
          <div className="text-sm text-red-600 space-y-1">
            <p>
              This will permanently delete{" "}
              <strong>
                {user?.first_name} {user?.last_name}
              </strong>{" "}
              ({user?.email}) from the system.
            </p>
            <p className="font-medium">
              All user data and associated records will be lost.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

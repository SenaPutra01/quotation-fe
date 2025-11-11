import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconLoader2, IconX } from "@tabler/icons-react";

interface DropdownActionsProps<T> {
  item: T;

  itemId?: string;

  basePath: string;

  statusField?: string;

  onCancel?: (item: T) => void | Promise<void>;
  onDelete?: (item: T) => void | Promise<void>;
  onSendEmail?: (item: T) => void;

  customActions?: Array<{
    label: string;
    onClick: (item: T) => void;
    icon?: React.ReactNode;
    className?: string;
    separator?: boolean;
  }>;

  showCancelCondition?: (item: T) => boolean;
  showSendEmailCondition?: (item: T) => boolean;

  dataType?: "default" | "invoice";

  externalUpdating?: boolean;

  align?: "start" | "center" | "end";
  className?: string;
}

export function TableActions<T extends Record<string, any>>({
  item,
  itemId = "id",
  basePath,
  statusField = "status",
  onCancel,
  onDelete,
  onSendEmail,
  customActions = [],
  showCancelCondition,
  showSendEmailCondition,
  dataType = "default",
  externalUpdating,
  align = "end",
  className = "w-48",
}: DropdownActionsProps<T>) {
  const router = useRouter();
  const [internalUpdating, setInternalUpdating] = useState(false);

  const updating =
    externalUpdating !== undefined ? externalUpdating : internalUpdating;

  const defaultShowCancelCondition = (item: T) =>
    item[statusField]?.toLowerCase() !== "cancel";

  const defaultShowSendEmailCondition = (item: T) =>
    ["submit", "sent"].includes(item[statusField]?.toLowerCase());

  const invoiceShowSendEmailCondition = (item: T) =>
    item[statusField]?.toLowerCase() === "draft";

  const shouldShowCancel = showCancelCondition
    ? showCancelCondition(item)
    : defaultShowCancelCondition(item);

  const getSendEmailCondition = () => {
    if (showSendEmailCondition) {
      return showSendEmailCondition(item);
    }

    if (dataType === "invoice") {
      return invoiceShowSendEmailCondition(item);
    }

    return defaultShowSendEmailCondition(item);
  };

  const shouldShowSendEmail = getSendEmailCondition();

  const handleAction = async (action: (item: T) => void | Promise<void>) => {
    if (externalUpdating === undefined) {
      setInternalUpdating(true);
    }

    try {
      await action(item);
    } finally {
      if (externalUpdating === undefined) {
        setInternalUpdating(false);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={updating}>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          {updating ? (
            <IconLoader2 className="animate-spin size-4" />
          ) : (
            <IconDotsVertical />
          )}
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        {shouldShowCancel && onCancel && (
          <>
            <DropdownMenuItem
              onClick={() => handleAction(onCancel)}
              className="text-red-600 flex items-center gap-2"
            >
              <IconX className="text-red-500 size-4" />
              <span>Set to Cancel</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={() => router.push(`${basePath}/${item[itemId]}/edit`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`${basePath}/${item[itemId]}`)}
        >
          View Details
        </DropdownMenuItem>

        {shouldShowSendEmail && onSendEmail && (
          <DropdownMenuItem onClick={() => onSendEmail(item)}>
            Send Email
          </DropdownMenuItem>
        )}

        {customActions.map((action, index) => (
          <div key={index}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => action.onClick(item)}
              className={action.className}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleAction(onDelete)}
            >
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

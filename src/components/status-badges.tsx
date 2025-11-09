import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconClock,
  IconX,
  IconFileInvoice,
  IconFileCheck,
  IconSend,
  IconLock,
} from "@tabler/icons-react";

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
  pending: {
    label: "Pending",
    color:
      "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800",
    icon: IconClock,
    iconClass: "text-yellow-500 dark:text-yellow-400",
  },
  approved: {
    label: "Approved",
    color:
      "text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
    icon: IconCircleCheckFilled,
    iconClass: "text-green-500 dark:text-green-400",
  },
  delivered: {
    label: "Delivered",
    color:
      "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    icon: IconFileInvoice,
    iconClass: "text-blue-500 dark:text-blue-400",
  },
  rejected: {
    label: "Rejected",
    color:
      "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
    icon: IconX,
    iconClass: "text-red-500 dark:text-red-400",
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusKey = status.toLowerCase() as keyof typeof STATUS_CONFIG;
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft;
  const IconComponent = config.icon;

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 px-2 py-0.5 capitalize ${config.color} ${className}`}
    >
      <IconComponent className={`h-3 w-3 ${config.iconClass}`} />
      {config.label}
    </Badge>
  );
}

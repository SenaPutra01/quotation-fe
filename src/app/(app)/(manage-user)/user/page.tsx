import { UsersDataTable } from "@/components/user/user-data-table";
import { getUsersAction } from "@/actions/user-actions";
import { getAuthStatus } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const authStatus = await getAuthStatus();

  if (!authStatus.isAuthenticated) {
    redirect("/login");
  }

  const usersResult = await getUsersAction();

  return (
    <UsersDataTable initialData={usersResult.success ? usersResult.data : []} />
  );
}

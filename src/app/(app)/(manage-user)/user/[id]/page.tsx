import { UserDetailContent } from "@/components/user/user-detail-content";
import { getUserDetailAction } from "@/actions/user-actions";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  const result = await getUserDetailAction(userId);

  return (
    <UserDetailContent
      initialUser={result.success ? result.data : null}
      userId={userId}
    />
  );
}

import {
  getCustomRequests,
  getCustomRequestStats,
} from "@/actions/custom-requests";
import { CustomRequestsClient } from "@/components/admin/custom-requests-client";

interface AdminCustomRequestsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function AdminCustomRequestsPage({
  searchParams,
}: AdminCustomRequestsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const [result, stats] = await Promise.all([
    getCustomRequests({
      page,
      status: params.status ?? "all",
      search: params.search,
      category: params.category ?? "all",
      sort: params.sort ?? "newest",
    }),
    getCustomRequestStats(),
  ]);

  return (
    <CustomRequestsClient
      requests={result.requests}
      stats={stats}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      totalCount={result.totalCount}
    />
  );
}

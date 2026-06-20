"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  convertCustomRequestToOrder,
  updateCustomRequest,
} from "@/actions/custom-requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  CUSTOM_REQUEST_STATUS_COLORS,
  CUSTOM_REQUEST_STATUSES,
  PRODUCT_CATEGORIES,
  type CustomRequest,
  type CustomRequestStatus,
} from "@/types";

type CustomRequestStats = Record<CustomRequestStatus, number> & {
  total: number;
};

interface CustomRequestsClientProps {
  requests: CustomRequest[];
  stats: CustomRequestStats;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const statusTabs: { label: string; value: string; countKey?: CustomRequestStatus }[] = [
  { label: "All", value: "all" },
  { label: "New Requests", value: "New Request", countKey: "New Request" },
  { label: "Under Review", value: "Under Review", countKey: "Under Review" },
  { label: "Negotiating", value: "Negotiating", countKey: "Negotiating" },
  { label: "Approved", value: "Approved", countKey: "Approved" },
  { label: "Rejected", value: "Rejected", countKey: "Rejected" },
  { label: "Converted", value: "Converted", countKey: "Converted" },
];

const summaryCards = [
  {
    label: "New Requests",
    status: "New Request" as const,
    helper: "Needs review",
    icon: FileText,
    iconClass: "bg-kling-yellow/20 text-kling-gold",
  },
  {
    label: "Under Review",
    status: "Under Review" as const,
    helper: "Being checked",
    icon: Eye,
    iconClass: "bg-kling-blue/15 text-kling-blue",
  },
  {
    label: "Negotiating",
    status: "Negotiating" as const,
    helper: "With customer",
    icon: MessageSquare,
    iconClass: "bg-purple-100 text-purple-600",
  },
  {
    label: "Approved",
    status: "Approved" as const,
    helper: "Ready to convert",
    icon: CheckCircle2,
    iconClass: "bg-kling-green/15 text-green-600",
  },
  {
    label: "Rejected",
    status: "Rejected" as const,
    helper: "Not proceeding",
    icon: XCircle,
    iconClass: "bg-red-100 text-red-500",
  },
];

const categoryColors = {
  Bracelet: "bg-kling-pink/20 text-pink-700 border-kling-pink/30",
  Charm: "bg-kling-blue/15 text-blue-700 border-kling-blue/25",
  Keychain: "bg-kling-yellow/20 text-amber-700 border-kling-yellow/30",
  Necklace: "bg-purple-100 text-purple-700 border-purple-200",
};

function formatRequestId(request: CustomRequest) {
  const date = new Date(request.created_at);
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `CR${y}${m}${d}-${request.id.slice(0, 3).toUpperCase()}`;
}

function CustomRequestRow({ request }: { request: CustomRequest }) {
  const router = useRouter();
  const [status, setStatus] = useState<CustomRequestStatus>(request.status);
  const [price, setPrice] = useState(
    request.negotiated_price ? String(request.negotiated_price) : ""
  );
  const [notes, setNotes] = useState(request.admin_notes ?? "");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  async function handleStatusChange(nextStatus: CustomRequestStatus) {
    setStatus(nextStatus);
    const result = await updateCustomRequest(request.id, { status: nextStatus });

    if (result.error) {
      toast.error(result.error);
      setStatus(request.status);
      return;
    }

    toast.success("Custom request status updated.");
    router.refresh();
  }

  async function handleSaveDetails() {
    const negotiatedPrice = price ? Number(price) : null;

    if (negotiatedPrice !== null && (!Number.isFinite(negotiatedPrice) || negotiatedPrice < 0)) {
      toast.error("Enter a valid negotiated price.");
      return;
    }

    setLoading(true);
    const result = await updateCustomRequest(request.id, {
      negotiatedPrice,
      adminNotes: notes.trim() || null,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Custom request details saved.");
    router.refresh();
  }

  async function handleConvert() {
    setConverting(true);
    const result = await convertCustomRequestToOrder(request.id);
    setConverting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Custom request converted to an order.");
    router.refresh();
  }

  return (
    <tr className="border-b bg-white/70 last:border-b-0">
      <td className="px-4 py-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-kling-pink/10">
          {request.reference_image_url ? (
            <Image
              src={request.reference_image_url}
              alt={`${request.category} reference`}
              fill
              className="object-cover"
            />
          ) : (
            <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-kling-pink" />
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold text-kling-forest">#{formatRequestId(request)}</div>
        <Badge className={CUSTOM_REQUEST_STATUS_COLORS[status]} variant="outline">
          {status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium">{request.full_name}</div>
        <div className="text-sm text-muted-foreground">{request.contact_number}</div>
      </td>
      <td className="px-4 py-3">
        <Badge className={categoryColors[request.category]} variant="outline">
          {request.category}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(request.created_at)}</td>
      <td className="px-4 py-3">
        <Select value={status} onValueChange={(value) => handleStatusChange(value as CustomRequestStatus)}>
          <SelectTrigger className="h-9 w-40 rounded-full border-kling-pink/25 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CUSTOM_REQUEST_STATUSES.map((item) => (
              <SelectItem
                key={item}
                value={item}
                disabled={item === "Converted" && status !== "Converted"}
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-kling-pink/25 text-kling-pink">
                <Eye className="h-4 w-4" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-kling-forest">
                  Custom Request #{formatRequestId(request)}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-kling-pink/10">
                  {request.reference_image_url ? (
                    <Image
                      src={request.reference_image_url}
                      alt={`${request.category} reference`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Sparkles className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-kling-pink" />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Customer</p>
                      <p className="font-medium text-kling-forest">{request.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Contact</p>
                      <p className="font-medium text-kling-forest">{request.contact_number}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Category</p>
                      <p className="font-medium text-kling-forest">{request.category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Landmark</p>
                      <p className="font-medium text-kling-forest">{request.landmark}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Description</p>
                    <p className="mt-1 rounded-xl bg-muted/60 p-3 text-sm leading-6">{request.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`price-${request.id}`}>Negotiated Price</Label>
                      <Input
                        id={`price-${request.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={status} onValueChange={(value) => handleStatusChange(value as CustomRequestStatus)}>
                        <SelectTrigger className="rounded-full border-kling-pink/25 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOM_REQUEST_STATUSES.map((item) => (
                            <SelectItem
                              key={item}
                              value={item}
                              disabled={item === "Converted" && status !== "Converted"}
                            >
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${request.id}`}>Admin Notes</Label>
                    <Textarea
                      id={`notes-${request.id}`}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Add negotiation notes or confirmed details..."
                      className="min-h-24 rounded-xl bg-white"
                    />
                  </div>

                  {request.negotiated_price ? (
                    <p className="text-sm font-semibold text-kling-forest">
                      Current price: {formatCurrency(request.negotiated_price)}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={handleSaveDetails} disabled={loading}>
                      {loading ? "Saving..." : "Save Details"}
                    </Button>
                    <Button
                      onClick={handleConvert}
                      disabled={converting || status !== "Approved"}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {converting ? "Converting..." : "Convert to Order"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {status === "Approved" ? (
            <Button
              variant="outline"
              size="sm"
              className="border-kling-green/30 text-green-700 hover:bg-kling-green/10"
              onClick={handleConvert}
              disabled={converting}
            >
              <RefreshCw className="h-4 w-4" />
              Convert
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function CustomRequestsClient({
  requests,
  stats,
  currentPage,
  totalPages,
  totalCount,
}: CustomRequestsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "all";
  const currentCategory = searchParams.get("category") ?? "all";
  const currentSort = searchParams.get("sort") ?? "newest";
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all" && !(key === "sort" && value === "newest")) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");
    router.push(`/admin/custom-requests?${params.toString()}`);
  }

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/admin/custom-requests?${params.toString()}`;
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("search", search);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-kling-forest" />
          <h1 className="font-display text-3xl font-bold text-kling-forest">Custom Requests</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Manage and review custom order requests from customers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map(({ label, status, helper, icon: Icon, iconClass }) => (
          <div key={status} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", iconClass)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-kling-forest">{stats[status]}</p>
                <p className="text-sm font-semibold">{label}</p>
                <p className={cn("mt-1 text-xs", iconClass.split(" ").find((item) => item.startsWith("text-")))}>
                  {helper}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm">
        <div className="flex overflow-x-auto border-b">
          {statusTabs.map((tab) => {
            const count = tab.countKey ? stats[tab.countKey] : stats.total;
            const active = currentStatus === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateParam("status", tab.value)}
                className={cn(
                  "flex min-w-max items-center gap-2 border-b-2 px-6 py-4 text-sm font-semibold transition",
                  active
                    ? "border-kling-pink text-kling-forest"
                    : "border-transparent text-muted-foreground hover:text-kling-forest"
                )}
              >
                {tab.label}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleSearch} className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requests..."
              className="pl-10"
            />
          </form>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[32rem]">
            <Select value={currentCategory} onValueChange={(value) => updateParam("category", value)}>
              <SelectTrigger className="rounded-full border-kling-pink/25 bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentSort} onValueChange={(value) => updateParam("sort", value)}>
              <SelectTrigger className="rounded-full border-kling-pink/25 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort: Newest First</SelectItem>
                <SelectItem value="oldest">Sort: Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-sm font-semibold text-kling-forest">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <CustomRequestRow key={request.id} request={request} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No custom requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {requests.length === 0 ? 0 : (currentPage - 1) * 5 + 1} to{" "}
            {(currentPage - 1) * 5 + requests.length} of {totalCount} requests
          </p>
          {totalPages > 1 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => router.push(pageHref(currentPage - 1))}
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => router.push(pageHref(page))}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => router.push(pageHref(currentPage + 1))}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-kling-pink/20 bg-kling-pink/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-kling-pink">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-kling-forest">How it works</p>
              <p className="text-sm text-muted-foreground">
                Review details, negotiate price, approve, then convert to a normal order.
              </p>
            </div>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
            <p><span className="font-semibold text-kling-pink">1.</span> Review customer request</p>
            <p><span className="font-semibold text-kling-pink">2.</span> Negotiate price and details</p>
            <p><span className="font-semibold text-kling-pink">3.</span> Approve and convert order</p>
          </div>
        </div>
      </div>
    </div>
  );
}

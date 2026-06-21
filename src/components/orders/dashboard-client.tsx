"use client";

import { useState } from "react";
import { 
  Package, 
  Sparkles, 
  Tag, 
  MapPin, 
  Eye, 
  Lightbulb, 
  Send, 
  MessageSquare, 
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { OrderCard } from "./order-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency, formatDate, generateOrderId, cn } from "@/lib/utils";
import { 
  CUSTOM_REQUEST_STATUS_COLORS, 
  type Order, 
  type OrderItem, 
  type Product, 
  type CustomRequest, 
  type ProductCategory 
} from "@/types";

interface DashboardClientProps {
  orders: (Order & {
    order_items: (OrderItem & { product: Product })[];
  })[];
  customRequests: CustomRequest[];
}

export function DashboardClient({ orders, customRequests }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "custom_requests">("orders");
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);

  const activeCount = customRequests.filter(
    (req) => 
      req.status === "New Request" || 
      req.status === "Under Review" || 
      req.status === "Negotiating"
  ).length;

  const categoryTagColors: Record<ProductCategory, string> = {
    Bracelet: "bg-kling-pink/10 text-kling-pink border-kling-pink/20",
    Charm: "bg-kling-blue/10 text-kling-blue border-kling-blue/20",
    Keychain: "bg-kling-yellow/15 text-amber-700 border-kling-yellow/20",
    Necklace: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex rounded-full border border-kling-pink/10 bg-kling-pink/5 p-1 w-full max-w-sm">
        <button
          onClick={() => setActiveTab("orders")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-all duration-300",
            activeTab === "orders"
              ? "bg-white text-kling-forest shadow-sm"
              : "text-kling-forest/70 hover:bg-white/40 hover:text-kling-forest"
          )}
        >
          <Package className="h-4 w-4" />
          Orders
        </button>
        <button
          onClick={() => setActiveTab("custom_requests")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-all duration-300 relative",
            activeTab === "custom_requests"
              ? "bg-white text-kling-forest shadow-sm"
              : "text-kling-forest/70 hover:bg-white/40 hover:text-kling-forest"
          )}
        >
          <Sparkles className="h-4 w-4 text-kling-pink" />
          Custom Requests
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-kling-pink text-[10px] font-bold text-white ml-1">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-16 w-16 text-muted-foreground/30" />
              <p className="mt-4 text-lg text-muted-foreground">No orders yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Requests Tab Content */}
      {activeTab === "custom_requests" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-kling-forest">My Custom Requests</h2>
            <Button asChild className="h-10 rounded-full border border-kling-pink text-kling-pink bg-transparent hover:bg-kling-pink/5 hover:text-kling-pink shadow-none">
              <Link href="/?category=Custom#collection" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Custom Order
              </Link>
            </Button>
          </div>

          {customRequests.length === 0 ? (
            <div className="py-16 text-center border border-dashed rounded-2xl border-kling-pink/20 bg-white/50">
              <Sparkles className="mx-auto h-16 w-16 text-kling-pink/30" />
              <p className="mt-4 text-lg text-muted-foreground">No custom requests yet.</p>
              <Button asChild className="mt-4 h-10 rounded-full bg-kling-pink text-white hover:bg-kling-pink/90">
                <Link href="/?category=Custom#collection">
                  Request a Custom Order
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {customRequests.map((request) => {
                const isRejected = request.status === "Rejected";
                const isFinal = request.status === "Approved" || request.status === "Converted";

                return (
                  <div key={request.id} className="flex flex-col rounded-2xl border border-white/80 bg-white/60 p-5 shadow-sm transition hover:shadow-md backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Reference Image */}
                      <div className="relative aspect-square w-full sm:w-32 shrink-0 overflow-hidden rounded-xl border border-muted bg-slate-50">
                        {request.reference_image_url ? (
                          <img
                            src={request.reference_image_url}
                            alt={`Reference design for ${request.category}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-slate-100">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-kling-forest text-base truncate">
                              Custom Request #CR-{generateOrderId(request.id)}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Submitted on {formatDate(request.created_at)}
                            </p>
                          </div>
                          <Badge className={cn("border px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 shadow-none capitalize", CUSTOM_REQUEST_STATUS_COLORS[request.status])} variant="outline">
                            {request.status}
                          </Badge>
                        </div>

                        <div className="grid gap-1.5 text-sm text-kling-forest">
                          <div className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-[11px] text-muted-foreground">Category:</span>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", categoryTagColors[request.category])}>
                              {request.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-[11px] text-muted-foreground">Meet-up Location:</span>
                            <span className="text-xs truncate max-w-[150px] sm:max-w-[200px]" title={request.landmark}>
                              {request.landmark}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="block text-[10px] font-medium text-muted-foreground">Description</span>
                            <p className="text-xs text-kling-forest line-clamp-1 mt-0.5">{request.description}</p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            {isRejected ? (
                              <>
                                <span className="block text-[10px] font-medium text-rose-500">Reason</span>
                                <span className="text-xs font-semibold text-rose-600 truncate block max-w-[100px]" title={request.admin_notes || "Design not possible"}>
                                  {request.admin_notes || "Design not possible"}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="block text-[10px] font-medium text-muted-foreground">
                                  {isFinal ? "Final Price" : "Estimated Price"}
                                </span>
                                <span className="text-sm font-bold text-kling-pink">
                                  {request.negotiated_price ? formatCurrency(Number(request.negotiated_price)) : "Negotiable"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                      className="w-full mt-4 h-9 rounded-full border-kling-pink/35 text-kling-pink hover:bg-kling-pink/5 hover:text-kling-pink text-xs font-medium"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* How it works info footer */}
          <div className="mt-8 rounded-xl border border-kling-yellow/30 bg-gradient-to-r from-kling-yellow/5 to-transparent p-5">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-full bg-kling-yellow/20 p-2 text-kling-gold">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <span className="font-display font-bold text-kling-forest text-lg">How it works</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between flex-1 gap-4 md:ml-8">
                {/* Step 1 */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-kling-pink/10 p-2 text-kling-pink">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-kling-forest">1. Submit your request</h5>
                    <p className="text-xs text-muted-foreground">Fill out the custom order form.</p>
                  </div>
                </div>
                
                <span className="hidden sm:block text-muted-foreground/40 font-light text-xl">→</span>
                
                {/* Step 2 */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-kling-blue/15 p-2 text-kling-blue">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-kling-forest">2. We review & respond</h5>
                    <p className="text-xs text-muted-foreground">We&apos;ll get back to you soon.</p>
                  </div>
                </div>
                
                <span className="hidden sm:block text-muted-foreground/40 font-light text-xl">→</span>
                
                {/* Step 3 */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-kling-green/15 p-2 text-kling-green">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-kling-forest">3. Approve & create</h5>
                    <p className="text-xs text-muted-foreground">Once approved, we&apos;ll start crafting!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-6 overflow-hidden">
          {selectedRequest && (
            <div className="space-y-5">
              <DialogHeader className="pb-2 border-b">
                <DialogTitle className="font-display text-xl font-bold text-kling-forest">
                  Custom Request Details
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Reference ID: #CR-{generateOrderId(selectedRequest.id)}
                </DialogDescription>
              </DialogHeader>

              {/* Reference Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-slate-50 flex items-center justify-center">
                {selectedRequest.reference_image_url ? (
                  <img
                    src={selectedRequest.reference_image_url}
                    alt="Reference design"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-slate-100">
                    No Reference Image
                  </div>
                )}
              </div>

              {/* Core Information Details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                  <Badge className={cn("mt-1 border px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize", CUSTOM_REQUEST_STATUS_COLORS[selectedRequest.status])} variant="outline">
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</span>
                  <span className="inline-block mt-1 font-semibold text-kling-forest">{selectedRequest.category}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact Number</span>
                  <span className="block mt-1 font-medium text-kling-forest">{selectedRequest.contact_number}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meet-up Location</span>
                  <span className="block mt-1 font-medium text-kling-forest truncate" title={selectedRequest.landmark}>
                    {selectedRequest.landmark}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Description of Order
                </span>
                <div className="text-xs leading-relaxed text-kling-forest bg-white border border-slate-100 p-3 rounded-lg max-h-24 overflow-y-auto">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Admin notes or reason */}
              {selectedRequest.admin_notes && (
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {selectedRequest.status === "Rejected" ? "Reason for Rejection" : "Admin Notes"}
                  </span>
                  <div className={cn(
                    "text-xs leading-relaxed p-3 rounded-lg border",
                    selectedRequest.status === "Rejected" 
                      ? "bg-rose-50/50 border-rose-100 text-rose-800" 
                      : "bg-slate-50/50 border-slate-100 text-kling-forest"
                  )}>
                    {selectedRequest.admin_notes}
                  </div>
                </div>
              )}

              {/* Pricing & View Order link */}
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {selectedRequest.status === "Rejected" 
                      ? "Status Details" 
                      : (selectedRequest.status === "Approved" || selectedRequest.status === "Converted") 
                        ? "Final Price" 
                        : "Estimated Price"}
                  </span>
                  <span className="text-lg font-bold text-kling-pink mt-1 block">
                    {selectedRequest.status === "Rejected" 
                      ? "Rejected" 
                      : selectedRequest.negotiated_price 
                        ? formatCurrency(Number(selectedRequest.negotiated_price)) 
                        : "Negotiable"}
                  </span>
                </div>

                {selectedRequest.status === "Converted" && selectedRequest.order_id && (
                  <Button 
                    size="sm" 
                    className="rounded-full bg-kling-forest text-white hover:bg-kling-forest/90"
                    onClick={() => {
                      setSelectedRequest(null);
                      setActiveTab("orders");
                    }}
                  >
                    View Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

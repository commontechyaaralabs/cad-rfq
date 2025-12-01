"use client";
import { useState } from "react";

interface DocumentDetail {
  id: string;
  type: string;
  supplier: string;
  status: string;
  matchStatus: string;
  confidence: number;
  lastUpdated: string;
  source: string;
  extractedData?: any;
  timeline?: Array<{ stage: string; timestamp: string; status: string }>;
  matchingResults?: any;
  auditLog?: Array<{ action: string; timestamp: string; user: string }>;
}

interface DocumentDetailDrawerProps {
  document: DocumentDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentDetailDrawer = ({ document, isOpen, onClose }: DocumentDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "order" | "payment" | "history">("overview");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!isOpen || !document) return null;

  // Business-focused timeline
  const businessTimeline = [
    { step: "Order Received", timestamp: "2024-01-15 08:00 AM", status: "completed" },
    { step: "Verified", timestamp: "2024-01-15 08:05 AM", status: "completed" },
    { step: "Payment Scheduled", timestamp: "2024-01-15 08:20 AM", status: "completed" },
    { step: "Payment Posted", timestamp: "2024-01-15 10:30 AM", status: document.status === "Processed" ? "completed" : "pending" },
  ];

  // Business order data
  const orderData = {
    supplier: document.supplier,
    orderNumber: document.id,
    orderDate: "2024-01-15",
    totalAmount: "₹45,230",
    paymentStatus: document.status === "Processed" ? "Approved" : document.status === "In Review" ? "Pending Review" : "Blocked",
    items: [
      { description: "Component A", quantity: 10, unitPrice: "₹1,255", total: "₹12,550" },
      { description: "Component B", quantity: 5, unitPrice: "₹900", total: "₹4,500" },
      { description: "Component C", quantity: 20, unitPrice: "₹1,409", total: "₹28,180" },
    ],
  };

  // Business history
  const businessHistory = [
    { action: "Order received from supplier", timestamp: "2024-01-15 08:00 AM", user: "System" },
    { action: "Order verified and confirmed", timestamp: "2024-01-15 08:05 AM", user: "System" },
    { action: "Payment approved", timestamp: "2024-01-15 08:10 AM", user: "John Smith" },
    { action: "Payment scheduled", timestamp: "2024-01-15 08:20 AM", user: "System" },
    { action: "Payment posted to accounts", timestamp: "2024-01-15 10:30 AM", user: "System" },
  ];

  const getStatusColor = (status: string) => {
    if (status === "completed" || status === "Processed" || status === "Matched" || status === "Approved") return "bg-green-100 text-green-800";
    if (status === "In Review" || status === "Partial" || status === "Pending Review") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 mt-1">{document.supplier} • {document.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "order", label: "Order Details" },
              { id: "payment", label: "Payment Status" },
              { id: "history", label: "History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "text-[#5332FF] border-b-2 border-[#5332FF]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200/50 p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Supplier</p>
                    <p className="text-sm font-semibold text-gray-900">{orderData.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Order Number</p>
                    <p className="text-sm font-semibold text-gray-900">{orderData.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Order Date</p>
                    <p className="text-sm font-semibold text-gray-900">{orderData.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">{orderData.totalAmount}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(orderData.paymentStatus)}`}>
                      {orderData.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {document.status !== "Processed" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="flex items-center gap-3">
                    {document.status === "In Review" && (
                      <>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                          Approve Payment
                        </button>
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
                          Hold Payment
                        </button>
                      </>
                    )}
                    {document.status === "Exception" && (
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                        Review Issue
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Business Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Timeline</h3>
                <div className="space-y-4">
                  {businessTimeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === "completed" ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          {item.status === "completed" ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                        {index < businessTimeline.length - 1 && (
                          <div className={`w-0.5 h-12 ml-3.5 ${
                            item.status === "completed" ? "bg-green-200" : "bg-gray-200"
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">{item.step}</p>
                          <p className="text-xs text-gray-500">{item.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details (Collapsible) */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className={`w-4 h-4 transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showTechnicalDetails ? "Hide" : "Show"} technical details
                </button>
                {showTechnicalDetails && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-2">Document Type: {document.type}</p>
                      <p className="text-xs text-gray-600 mb-2">Source: {document.source}</p>
                      <p className="text-xs text-gray-600 mb-2">Match Status: {document.matchStatus}</p>
                      <p className="text-xs text-gray-600">Last Updated: {document.lastUpdated}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Order Details Tab */}
          {activeTab === "order" && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity} × {item.unitPrice}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{item.total}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Total</p>
                <p className="text-lg font-bold text-gray-900">{orderData.totalAmount}</p>
              </div>
            </div>
          )}

          {/* Payment Status Tab */}
          {activeTab === "payment" && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(orderData.paymentStatus)}`}>
                    {orderData.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-bold text-gray-900">{orderData.totalAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supplier</span>
                  <span className="text-sm font-semibold text-gray-900">{orderData.supplier}</span>
                </div>
                {document.status === "Processed" && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium">Payment posted successfully</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Order History</h3>
              <div className="space-y-4">
                {businessHistory.map((log, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#5332FF] mt-2"></div>
                      {index < businessHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 ml-0.5"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-xs text-gray-500 mt-1">by {log.user}</p>
                        </div>
                        <p className="text-xs text-gray-500">{log.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

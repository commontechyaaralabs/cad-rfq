"use client";
import { useState } from "react";
import { TailSpinner } from "@/components/TailSpinner";
import { DocumentStatus as APIDocumentStatus } from "@/utils/supplyChainApi";

interface ParsingStageProps {
  documentId?: string;
  onApprove?: () => void;
  isProcessing?: boolean;
  onProcess?: () => void;
  isProcessed?: boolean;
  documents?: APIDocumentStatus[];
}

export const ParsingStage = ({ 
  documentId, 
  onApprove, 
  isProcessing = false,
  onProcess,
  isProcessed = false,
  documents = [],
}: ParsingStageProps) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Get the first document or document by ID
  const currentDoc = documentId 
    ? documents.find(d => d.id === documentId) || documents[0]
    : documents[0];

  // Extract real data from document
  const extracted = currentDoc?.extracted_data;
  const orderData = extracted ? {
    supplier: extracted.supplier || "Unknown Supplier",
    orderNumber: extracted.order_number || currentDoc?.id || "N/A",
    orderDate: extracted.order_date || new Date(currentDoc?.created_at || Date.now()).toISOString().split('T')[0],
    totalAmount: extracted.total_amount 
      ? `₹${(extracted.total_amount / 100000).toFixed(1)}L` 
      : "₹0",
    status: currentDoc?.status === "completed" || currentDoc?.status === "approved" 
      ? "verified" 
      : currentDoc?.error || extracted?.confidence === "low" 
        ? "needs_review" 
        : "verified",
    items: extracted.line_items?.map(item => ({
      description: item.description || "Item",
      quantity: item.quantity || 0,
      unitPrice: `₹${((item.unit_price || 0) / 1000).toFixed(1)}K`,
      total: `₹${((item.total || 0) / 1000).toFixed(1)}K`,
    })) || [],
    issues: currentDoc?.error ? [currentDoc.error] : (extracted?.confidence === "low" ? ["Low confidence extraction - needs review"] : []),
  } : null;

  // Show empty state if no documents
  if (!currentDoc && !isProcessing && !isProcessed) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-600">No documents available for processing. Please upload documents first.</p>
        </div>
      </div>
    );
  }

  // Show process button if not processed yet
  if (!isProcessed && !isProcessing && onProcess) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#5332FF]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#5332FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Parse Documents</h3>
            <p className="text-sm text-gray-600 mb-6">Extract and structure data from your uploaded documents</p>
            <button
              onClick={onProcess}
              className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg mx-auto"
            >
              Process Documents
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Processing Animation - Show when processing */}
      {isProcessing && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <TailSpinner size={48} />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Documents</h3>
              <p className="text-gray-600">Extracting order details and verifying information...</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Verification Result - Show only after processing */}
      {isProcessed && !isProcessing && orderData && (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${
        orderData.status === "verified" ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {orderData.status === "verified" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Verified and Ready</h3>
                    <p className="text-sm text-gray-600">Order details confirmed and ready for payment processing</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Needs Review</h3>
                    <p className="text-sm text-gray-600">Some details need verification before proceeding</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
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

          {/* Order Items */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Order Items</p>
              <div className="space-y-2">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × {item.unitPrice}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.total}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Issues (if any) */}
        {orderData.issues.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">Items Requiring Attention</p>
                <ul className="space-y-1">
                  {orderData.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-amber-700">• {issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
          {showTechnicalDetails && currentDoc && (
            <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400">
                {JSON.stringify({
                  document_id: currentDoc.id,
                  extraction_method: "AI OCR",
                  confidence: extracted?.confidence || "medium",
                  extracted_data: extracted,
                  processing_time: currentDoc.updated_at ? `${((new Date(currentDoc.updated_at).getTime() - new Date(currentDoc.created_at).getTime()) / 1000).toFixed(1)}s` : "N/A"
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Approve Button - Show only after processing */}
      {isProcessed && !isProcessing && onApprove && (
        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onApprove}
            className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {orderData?.status === "verified" ? "Approve & Continue" : "Review & Continue"}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

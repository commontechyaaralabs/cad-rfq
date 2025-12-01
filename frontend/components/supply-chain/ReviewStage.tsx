"use client";
import { useState, useEffect } from "react";
import { TailSpinner } from "@/components/TailSpinner";
import { Document } from "@/app/supply-chain-document-automation/page";

interface ReviewStageProps {
  onApprove?: () => void;
  isProcessing?: boolean;
  onProcess?: () => void;
  isProcessed?: boolean;
  documents?: Document[];
}

export const ReviewStage = ({ 
  onApprove, 
  isProcessing = false,
  onProcess,
  isProcessed = false,
  documents = [],
}: ReviewStageProps) => {
  // Convert real documents to payment decisions format
  const [decisions, setDecisions] = useState<Array<{
    id: string;
    supplier: string;
    orderNumber: string;
    orderValue: string;
    financialImpact?: string;
    issue: string;
    recommendation: string;
    status: "pending" | "approved" | "rejected";
  }>>([]);

  // Update decisions when documents change
  useEffect(() => {
    setDecisions(
      documents.map(doc => ({
        id: doc.id,
        supplier: doc.supplier,
        orderNumber: doc.id,
        orderValue: doc.orderValue ? `₹${(doc.orderValue / 100000).toFixed(1)}L` : "₹0",
        financialImpact: doc.financialImpact ? `₹${(doc.financialImpact / 1000).toFixed(0)}K at risk` : undefined,
        issue: doc.issueDescription || "Review required",
        recommendation: doc.status === "Exception" ? "Review and resolve issue before payment" : "Approve for payment",
        status: doc.status === "Processed" ? "approved" : "pending",
      }))
    );
  }, [documents]);

  const handleApprove = (id: string) => {
    setDecisions(decisions.map(d => d.id === id ? { ...d, status: "approved" } : d));
  };

  const handleReject = (id: string) => {
    setDecisions(decisions.map(d => d.id === id ? { ...d, status: "rejected" } : d));
  };

  const handleHold = (id: string) => {
    // Hold payment - keep as pending
  };

  const pendingDecisions = decisions.filter(d => d.status === "pending");
  const approvedDecisions = decisions.filter(d => d.status === "approved");
  const totalValueAtRisk = decisions
    .filter(d => d.financialImpact)
    .reduce((sum, d) => {
      const value = parseFloat(d.financialImpact?.replace(/[₹,L]/g, '') || '0');
      return sum + value;
    }, 0);

  // Show processing spinner
  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <TailSpinner size={48} />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviewing Documents</h3>
              <p className="text-gray-600">Analyzing payment decisions and quality checks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show process button if not processed yet
  if (!isProcessed && onProcess) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#5332FF]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#5332FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Review</h3>
            <p className="text-sm text-gray-600 mb-6">Review payment decisions and verify document quality</p>
            <button
              onClick={onProcess}
              className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg mx-auto"
            >
              Process Review
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
      {/* Payment Decision Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Decision Queue</h3>
            <p className="text-sm text-gray-700">
              {pendingDecisions.length} {pendingDecisions.length === 1 ? 'payment needs' : 'payments need'} your decision
            </p>
          </div>
          {totalValueAtRisk > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Total at Risk</p>
              <p className="text-2xl font-bold text-red-700">₹{(totalValueAtRisk / 100000).toFixed(1)}L</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
            <div className="text-sm font-medium text-gray-600 mb-1">Awaiting Decision</div>
            <div className="text-3xl font-bold text-amber-600">{pendingDecisions.length}</div>
            <div className="text-xs text-gray-500 mt-1">payments on hold</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
            <div className="text-sm font-medium text-gray-600 mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-600">{approvedDecisions.length}</div>
            <div className="text-xs text-gray-500 mt-1">ready for payment</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Value</div>
            <div className="text-3xl font-bold text-gray-900">
              ₹{decisions.reduce((sum, d) => {
                const value = parseFloat(d.orderValue.replace(/[₹,L]/g, '') || '0');
                return sum + value;
              }, 0) / 100000}L
            </div>
            <div className="text-xs text-gray-500 mt-1">in review</div>
          </div>
        </div>
      </div>

      {/* Payment Decision Cards */}
      <div className="space-y-4">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              decision.status === "approved"
                ? "border-green-200 bg-green-50/30"
                : decision.status === "rejected"
                ? "border-red-200 bg-red-50/30"
                : "border-amber-200 bg-amber-50/30"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{decision.supplier}</h4>
                    <p className="text-sm text-gray-600">{decision.orderNumber} • {decision.orderValue}</p>
                  </div>
                </div>
                {decision.financialImpact && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {decision.financialImpact}
                  </div>
                )}
              </div>
              {decision.status === "pending" && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                  Needs Decision
                </span>
              )}
              {decision.status === "approved" && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Approved
                </span>
              )}
              {decision.status === "rejected" && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  Rejected
                </span>
              )}
            </div>

            {/* Issue Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-start gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Issue Found</p>
                  <p className="text-sm text-gray-700">{decision.issue}</p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded text-xs font-semibold">Recommended</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{decision.recommendation}</p>
                  <p className="text-xs text-gray-600 mt-1">87% of similar cases resolved this way</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {decision.status === "pending" && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(decision.id)}
                  className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Approve Payment
                </button>
                <button
                  onClick={() => handleHold(decision.id)}
                  className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Hold Payment
                </button>
                <button
                  onClick={() => handleReject(decision.id)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Approve Button */}
      {onApprove && (
        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onApprove}
            className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            Proceed to Matching
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

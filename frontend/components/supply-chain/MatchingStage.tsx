"use client";
import { useState, useEffect } from "react";
import { TailSpinner } from "@/components/TailSpinner";
import { Document } from "@/app/supply-chain-document-automation/page";

interface MatchingStageProps {
  onApprove?: () => void | Promise<void>;
  isProcessing?: boolean;
  onProcess?: () => void | Promise<void>;
  isProcessed?: boolean;
  documents?: Document[];
}

export const MatchingStage = ({ 
  onApprove, 
  isProcessing = false,
  onProcess,
  isProcessed = false,
  documents = [],
}: MatchingStageProps) => {
  // Convert real documents to shipment alerts format
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    supplier: string;
    orderNumber: string;
    shipmentValue: string;
    financialImpact: string;
    issue: string;
    scenario: string;
    recommendation: string;
    severity: "high" | "medium" | "low";
    status: "pending" | "resolved";
  }>>([]);

  // Update alerts when documents change
  useEffect(() => {
    setAlerts(
      documents
        .filter(doc => doc.status === "Exception" || doc.matchStatus === "Failed" || doc.matchStatus === "Partial")
        .map(doc => ({
          id: doc.id,
          supplier: doc.supplier,
          orderNumber: doc.id,
          shipmentValue: doc.orderValue ? `₹${(doc.orderValue / 100000).toFixed(1)}L` : "₹0",
          financialImpact: doc.financialImpact ? `₹${(doc.financialImpact / 100000).toFixed(1)}L at risk` : "₹0 at risk",
          issue: doc.issueDescription || "Document matching issue detected",
          scenario: doc.matchStatus === "Failed" ? "Matching failed - documents do not match" : "Partial match - some discrepancies found",
          recommendation: doc.matchStatus === "Failed" ? "Review and resolve matching issues" : "Review discrepancies and approve if acceptable",
          severity: doc.financialImpact && doc.financialImpact > 100000 ? "high" : doc.financialImpact && doc.financialImpact > 0 ? "medium" : "low",
          status: doc.status === "Processed" ? "resolved" : "pending",
        }))
    );
  }, [documents]);

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: "resolved" } : a));
  };

  const pendingAlerts = alerts.filter(a => a.status === "pending");
  const totalAtRisk = alerts
    .filter(a => a.status === "pending")
    .reduce((sum, a) => {
      const value = parseFloat(a.financialImpact.replace(/[₹,L at risk]/g, '') || '0');
      return sum + value;
    }, 0);

  const getSeverityColor = (severity: string) => {
    if (severity === "high") return "bg-red-100 text-red-800 border-red-200";
    if (severity === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  // Show processing spinner
  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <TailSpinner size={48} />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Matching Documents</h3>
              <p className="text-gray-600">Cross-referencing PO, BoL, GRN, and Invoice documents...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Matching</h3>
            <p className="text-sm text-gray-600 mb-6">Cross-reference PO, BoL, GRN, and Invoice documents</p>
            <button
              onClick={onProcess}
              className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg mx-auto"
            >
              Process Matching
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
      {/* Shipment Alerts Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipment Alerts</h3>
            <p className="text-sm text-gray-700">
              {pendingAlerts.length} {pendingAlerts.length === 1 ? 'shipment has' : 'shipments have'} issues that need your attention
            </p>
          </div>
          {totalAtRisk > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Total at Risk</p>
              <p className="text-2xl font-bold text-red-700">₹{(totalAtRisk / 100000).toFixed(1)}L</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
            <div className="text-sm font-medium text-gray-600 mb-1">Active Alerts</div>
            <div className="text-3xl font-bold text-red-600">{pendingAlerts.length}</div>
            <div className="text-xs text-gray-500 mt-1">need resolution</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
            <div className="text-sm font-medium text-gray-600 mb-1">Resolved</div>
            <div className="text-3xl font-bold text-green-600">{alerts.filter(a => a.status === "resolved").length}</div>
            <div className="text-xs text-gray-500 mt-1">issues fixed</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/80">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Shipments</div>
            <div className="text-3xl font-bold text-gray-900">{alerts.length}</div>
            <div className="text-xs text-gray-500 mt-1">checked today</div>
          </div>
        </div>
      </div>

      {/* Shipment Alert Cards */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              alert.status === "resolved"
                ? "border-green-200 bg-green-50/30"
                : alert.severity === "high"
                ? "border-red-200 bg-red-50/30"
                : "border-amber-200 bg-amber-50/30"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{alert.supplier}</h4>
                    <p className="text-sm text-gray-600">{alert.orderNumber} • {alert.shipmentValue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity === "high" ? "High Priority" : alert.severity === "medium" ? "Medium Priority" : "Low Priority"}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {alert.financialImpact}
                  </div>
                </div>
              </div>
              {alert.status === "resolved" && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Resolved
                </span>
              )}
            </div>

            {/* Business Scenario */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-start gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">What Happened</p>
                  <p className="text-sm text-gray-700">{alert.scenario}</p>
                </div>
              </div>
            </div>

            {/* Issue Details */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900 mb-1">Issue Details</p>
                  <p className="text-sm text-amber-700">{alert.issue}</p>
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
                    <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded text-xs font-semibold">Recommended Action</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{alert.recommendation}</p>
                  <p className="text-xs text-gray-600 mt-1">Based on similar past cases and contract terms</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {alert.status === "pending" && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Accept Recommendation
                </button>
                <button
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Contact Supplier
                </button>
                <button
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Choose Different Action
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
            Proceed to Payment Processing
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

"use client";
import { useState } from "react";
import { TailSpinner } from "@/components/TailSpinner";
import { Header } from "@/components/Header";
import { UploadWizard } from "@/components/UploadWizard";
import { VendorCard } from "@/components/VendorCard";
import { InsightsSummary } from "@/components/InsightsSummary";
import { ComparisonGrid } from "@/components/ComparisonGrid";
import { BusinessActions } from "@/components/BusinessActions";
import { getApiUrl } from "@/utils/api";

export default function VendorRfqComparisonPage() {
  const [vendorRfqFiles, setVendorRfqFiles] = useState<File[]>([]);
  const [vendorPart, setVendorPart] = useState<string>("");
  const [isVendorDragging, setIsVendorDragging] = useState(false);
  const [selectedVendorFiles, setSelectedVendorFiles] = useState<Set<number>>(new Set());
  const [visibleVendorFiles, setVisibleVendorFiles] = useState<Set<number>>(new Set());
  const [isVendorComparing, setIsVendorComparing] = useState(false);
  const [vendorResult, setVendorResult] = useState<null | {
    vendors: Array<{
      vendor_name: string;
      certification_level?: string | null;
      pricing?: {
        unit_price_inr?: number | null;
        extended_price?: number | null;
        quantity_discount?: string | null;
        shipping_terms?: string | null;
      };
      delivery?: {
        initial_days?: number | null;
        subsequent_days?: number | null;
        emergency_days?: number | null;
      };
      warranty?: string | null;
      technical?: {
        product_type?: string | null;
        part_number?: string | null;
        dimensions?: any;
        specifications?: any;
      };
    }>;
    comparison?: {
      best_price_vendor?: string;
      best_delivery_vendor?: string;
      best_warranty_vendor?: string;
      overall_recommendation?: string;
    };
  }>(null);

  const handleDetectVendors = async () => {
    const visibleFilesArray = Array.from(visibleVendorFiles);
    if (visibleFilesArray.length < 2) {
      // If no visible files set, use all files
      const allIndices = Array.from({ length: vendorRfqFiles.length }, (_, i) => i);
      setVisibleVendorFiles(new Set(allIndices));
      visibleFilesArray.push(...allIndices);
    }

    if (visibleFilesArray.length < 2) {
      alert("Please upload at least 2 RFQ files to compare");
      return;
    }

    try {
      setIsVendorComparing(true);
      const selectedFiles = visibleFilesArray
        .sort((a, b) => a - b)
        .map(idx => vendorRfqFiles[idx]);
      
      const form = new FormData();
      selectedFiles.forEach((file) => {
        form.append("files", file);
      });

      const res = await fetch(getApiUrl("/compare-vendor"), {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setVendorResult(data);
    } catch (err) {
      console.error("Error comparing vendor RFQs:", err);
      alert(err instanceof Error ? err.message : "Failed to compare vendor RFQs");
    } finally {
      setIsVendorComparing(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setVendorRfqFiles(files);
    // Auto-select all files for comparison
    const allIndices = Array.from({ length: files.length }, (_, i) => i);
    setVisibleVendorFiles(new Set(allIndices));
    setSelectedVendorFiles(new Set(allIndices));
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    alert("PDF download feature coming soon");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Vendor RFQ Comparison",
        text: "Check out this vendor comparison",
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    alert("Save comparison feature coming soon");
  };

  const handleRequestQuote = () => {
    // TODO: Implement request quote functionality
    alert("Request revised quote feature coming soon");
  };

  // Find recommended vendor
  const getRecommendedVendorName = () => {
    if (!vendorResult?.comparison?.overall_recommendation) return null;
    
    const recommendation = vendorResult.comparison.overall_recommendation.toLowerCase();
    let recommendedVendorName = '';
    let earliestIndex = Infinity;
    
    for (const vendor of vendorResult.vendors) {
      const vendorName = vendor.vendor_name?.toLowerCase() || '';
      if (vendorName && recommendation.includes(vendorName)) {
        const index = recommendation.indexOf(vendorName);
        if (index < earliestIndex) {
          earliestIndex = index;
          recommendedVendorName = vendor.vendor_name;
        }
      }
    }
    
    return recommendedVendorName || null;
  };

  const recommendedVendorName = getRecommendedVendorName();

  return (
    <main className="min-h-screen w-full font-sans relative overflow-hidden bg-gray-50">
      <Header />
      
      <div className="pt-28 pb-8 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Vendor RFQ Comparison</h1>
              <p className="text-sm text-gray-600">Compare vendor quotes and make informed procurement decisions</p>
            </div>
            {vendorResult && !isVendorComparing && (
              <button
                onClick={() => {
                  setVendorRfqFiles([]);
                  setSelectedVendorFiles(new Set());
                  setVisibleVendorFiles(new Set());
                  setVendorResult(null);
                  setVendorPart("");
                  setIsVendorComparing(false);
                }}
                className="px-5 py-2.5 text-base text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Start New Comparison
              </button>
            )}
          </div>

          {/* Upload Wizard - Show when no results */}
          {!vendorResult && (
            <UploadWizard
              files={vendorRfqFiles}
              onFilesChange={handleFilesChange}
              isDetecting={isVendorComparing}
              onDetect={handleDetectVendors}
              visibleFiles={visibleVendorFiles}
              onVisibleFilesChange={setVisibleVendorFiles}
            />
          )}

          {/* Loading State */}
          {isVendorComparing && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <TailSpinner size={48} />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Vendor RFQs</h3>
                  <p className="text-gray-600">Extracting vendor data and generating insights...</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {vendorResult && !isVendorComparing && (
            <>
              {/* AI Insights Summary */}
              <InsightsSummary
                comparison={vendorResult.comparison}
                vendors={vendorResult.vendors}
              />

              {/* Vendor Cards Grid */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Vendor Profiles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {vendorResult.vendors.map((vendor, idx) => (
                    <VendorCard
                      key={idx}
                      vendor={vendor}
                      isRecommended={vendor.vendor_name === recommendedVendorName}
                    />
                  ))}
                </div>
              </div>

              {/* Comparison Grid */}
              <ComparisonGrid vendors={vendorResult.vendors} />

              {/* Business Actions */}
              <BusinessActions
                onDownloadPDF={handleDownloadPDF}
                onShare={handleShare}
                onSave={handleSave}
                onRequestQuote={handleRequestQuote}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

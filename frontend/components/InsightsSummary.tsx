"use client";

interface InsightsSummaryProps {
  comparison?: {
    best_price_vendor?: string;
    best_delivery_vendor?: string;
    best_warranty_vendor?: string;
    overall_recommendation?: string;
  };
  vendors: Array<{
    vendor_name: string;
    pricing?: {
      unit_price_inr?: number | null;
    };
    delivery?: {
      initial_days?: number | null;
    };
    warranty?: string | null;
  }>;
}

export const InsightsSummary = ({ comparison, vendors }: InsightsSummaryProps) => {
  if (!comparison) return null;

  const getVendorPrice = (vendorName: string) => {
    const vendor = vendors.find(v => v.vendor_name === vendorName);
    return vendor?.pricing?.unit_price_inr;
  };

  const getVendorDelivery = (vendorName: string) => {
    const vendor = vendors.find(v => v.vendor_name === vendorName);
    return vendor?.delivery?.initial_days;
  };

  const getVendorWarranty = (vendorName: string) => {
    const vendor = vendors.find(v => v.vendor_name === vendorName);
    return vendor?.warranty;
  };

  const insights = [
    {
      label: "Best Price",
      vendor: comparison.best_price_vendor,
      value: comparison.best_price_vendor ? `₹${getVendorPrice(comparison.best_price_vendor)?.toLocaleString('en-IN') || 'N/A'}` : 'N/A',
      color: "bg-green-100 text-green-700 border-green-200",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: "Fastest Delivery",
      vendor: comparison.best_delivery_vendor,
      value: comparison.best_delivery_vendor ? `${getVendorDelivery(comparison.best_delivery_vendor)} days` : 'N/A',
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      label: "Best Warranty",
      vendor: comparison.best_warranty_vendor,
      value: comparison.best_warranty_vendor ? getVendorWarranty(comparison.best_warranty_vendor) || 'N/A' : 'N/A',
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">AI Insights Summary</h2>
        <p className="text-sm text-gray-500">Key recommendations at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${insight.color}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center">{insight.icon}</span>
              <span className="text-sm font-semibold uppercase tracking-wide">{insight.label}</span>
            </div>
            {insight.vendor ? (
              <>
                <p className="text-base font-bold mb-0.5">{insight.value}</p>
                <p className="text-sm opacity-80">{insight.vendor}</p>
              </>
            ) : (
              <p className="text-sm">No data available</p>
            )}
          </div>
        ))}
      </div>

      {comparison.overall_recommendation && (
        <div className="bg-gradient-to-r from-[#5332FF]/10 to-[#059669]/10 rounded-lg p-4 border border-[#5332FF]/20">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-[#5332FF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Overall Recommendation</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comparison.overall_recommendation}</p>
        </div>
      )}
    </div>
  );
};


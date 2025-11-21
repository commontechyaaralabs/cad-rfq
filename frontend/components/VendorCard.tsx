"use client";

interface VendorCardProps {
  vendor: {
    vendor_name: string;
    certification_level?: string | null;
    pricing?: {
      unit_price_inr?: number | null;
    };
    delivery?: {
      initial_days?: number | null;
    };
    warranty?: string | null;
  };
  isRecommended?: boolean;
  onClick?: () => void;
}

export const VendorCard = ({ vendor, isRecommended, onClick }: VendorCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
        isRecommended ? 'border-[#059669] shadow-sm' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1.5">{vendor.vendor_name || 'Unknown Vendor'}</h3>
          {vendor.certification_level && (
            <span className="inline-block px-2 py-0.5 text-sm font-medium bg-blue-100 text-blue-700 rounded whitespace-nowrap">
              {vendor.certification_level}
            </span>
          )}
        </div>
        {isRecommended && (
          <span className="px-2 py-0.5 bg-[#059669] text-white text-xs font-semibold rounded-full whitespace-nowrap ml-2 flex-shrink-0">
            Recommended
          </span>
        )}
      </div>
      
      <div className="space-y-3 flex-1">
        {vendor.pricing?.unit_price_inr && (
          <div>
            <p className="text-sm text-gray-500 mb-0.5">Unit Price</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{vendor.pricing.unit_price_inr.toLocaleString('en-IN')}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          {vendor.delivery?.initial_days && (
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Delivery</p>
              <p className="text-sm font-semibold text-gray-900">{vendor.delivery.initial_days} days</p>
            </div>
          )}
          {vendor.warranty && (
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Warranty</p>
              <p className="text-sm font-semibold text-gray-900">{vendor.warranty}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


"use client";

interface ComparisonGridProps {
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
    };
  }>;
}

export const ComparisonGrid = ({ vendors }: ComparisonGridProps) => {
  if (vendors.length === 0) return null;

  // Extract all unique attributes
  const attributes = [
    { key: 'certification', label: 'Certification Level', getValue: (v: any) => v.certification_level || '—' },
    { key: 'unit_price', label: 'Unit Price (INR)', getValue: (v: any) => v.pricing?.unit_price_inr ? `₹${v.pricing.unit_price_inr.toLocaleString('en-IN')}` : '—' },
    { key: 'extended_price', label: 'Extended Price', getValue: (v: any) => v.pricing?.extended_price ? `₹${v.pricing.extended_price.toLocaleString('en-IN')}` : '—' },
    { key: 'quantity_discount', label: 'Quantity Discount', getValue: (v: any) => v.pricing?.quantity_discount || '—' },
    { key: 'shipping_terms', label: 'Shipping Terms', getValue: (v: any) => v.pricing?.shipping_terms || '—' },
    { key: 'delivery_initial', label: 'Initial Delivery (Days)', getValue: (v: any) => v.delivery?.initial_days || '—' },
    { key: 'delivery_subsequent', label: 'Subsequent Delivery (Days)', getValue: (v: any) => v.delivery?.subsequent_days || '—' },
    { key: 'warranty', label: 'Warranty', getValue: (v: any) => v.warranty || '—' },
    { key: 'product_type', label: 'Product Type', getValue: (v: any) => v.technical?.product_type || '—' },
    { key: 'part_number', label: 'Part Number', getValue: (v: any) => v.technical?.part_number || '—' },
  ];

  // Helper to find best/worst values for numeric comparisons
  const getBestWorst = (key: string) => {
    const numericKeys = ['unit_price', 'extended_price', 'delivery_initial', 'delivery_subsequent'];
    if (!numericKeys.includes(key)) return { best: null, worst: null };

    const values = vendors.map((v, idx) => {
      const attr = attributes.find(a => a.key === key);
      if (!attr) return null;
      const val = attr.getValue(v);
      if (val === '—') return null;
      if (key.includes('price')) {
        const num = parseFloat(val.replace(/[₹,]/g, ''));
        return { idx, value: num };
      }
      if (key.includes('delivery')) {
        const num = parseFloat(val);
        return { idx, value: num };
      }
      return null;
    }).filter(Boolean) as Array<{ idx: number; value: number }>;

    if (values.length === 0) return { best: null, worst: null };

    if (key.includes('price')) {
      const best = values.reduce((min, curr) => curr.value < min.value ? curr : min);
      const worst = values.reduce((max, curr) => curr.value > max.value ? curr : max);
      return { best: best.idx, worst: worst.idx };
    } else {
      const best = values.reduce((min, curr) => curr.value < min.value ? curr : min);
      const worst = values.reduce((max, curr) => curr.value > max.value ? curr : max);
      return { best: best.idx, worst: worst.idx };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Detailed Comparison</h2>
        <p className="text-sm text-gray-600 mt-0.5">Side-by-side vendor comparison</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-20">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-30 min-w-[160px] border-r border-gray-200">
                Attribute
              </th>
              {vendors.map((vendor, idx) => (
                <th key={idx} className="text-left px-4 py-2.5 text-sm font-semibold text-gray-700 min-w-[140px]">
                  {vendor.vendor_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr, attrIdx) => {
              const { best, worst } = getBestWorst(attr.key);
              return (
                <tr key={attrIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                    {attr.label}
                  </td>
                  {vendors.map((vendor, vendorIdx) => {
                    const value = attr.getValue(vendor);
                    const isBest = best === vendorIdx;
                    const isWorst = worst === vendorIdx && best !== worst;
                    
                    return (
                      <td
                        key={vendorIdx}
                        className={`px-4 py-2.5 text-sm ${
                          isBest ? 'bg-green-50 text-green-700 font-semibold' :
                          isWorst ? 'bg-red-50 text-red-700' :
                          'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {value}
                          {isBest && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                              Best
                            </span>
                          )}
                          {isWorst && best !== worst && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                              Highest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


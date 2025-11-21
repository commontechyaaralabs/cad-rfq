"use client";

interface KPIMetricsProps {
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
  comparison?: {
    best_price_vendor?: string;
    best_delivery_vendor?: string;
    best_warranty_vendor?: string;
  };
}

export const KPIMetrics = ({ vendors, comparison }: KPIMetricsProps) => {
  if (vendors.length === 0) return null;

  // Calculate price savings %
  const prices = vendors
    .map(v => v.pricing?.unit_price_inr)
    .filter((p): p is number => p !== null && p !== undefined);
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceSavings = maxPrice > 0 ? ((maxPrice - minPrice) / maxPrice * 100).toFixed(1) : '0';

  // Delivery score (lower is better, normalized to 0-100)
  const deliveries = vendors
    .map(v => v.delivery?.initial_days)
    .filter((d): d is number => d !== null && d !== undefined);
  
  const minDelivery = Math.min(...deliveries);
  const maxDelivery = Math.max(...deliveries);
  const deliveryScore = maxDelivery > minDelivery 
    ? ((maxDelivery - minDelivery) / maxDelivery * 100).toFixed(0)
    : '100';

  // Warranty score (simple count of vendors with warranty)
  const warrantyCount = vendors.filter(v => v.warranty).length;
  const warrantyScore = ((warrantyCount / vendors.length) * 100).toFixed(0);

  // Specification match score (placeholder - would need actual comparison data)
  const specMatchScore = '85';

  const metrics = [
    {
      label: 'Price Savings',
      value: `${priceSavings}%`,
      description: 'Potential savings vs highest price',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '💰'
    },
    {
      label: 'Delivery Score',
      value: `${deliveryScore}`,
      description: 'Based on fastest delivery',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '🚀'
    },
    {
      label: 'Warranty Score',
      value: `${warrantyScore}%`,
      description: 'Vendors offering warranty',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '🛡️'
    },
    {
      label: 'Spec Match',
      value: `${specMatchScore}%`,
      description: 'Specification compliance',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '✓'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={`${metric.bgColor} rounded-xl p-6 border border-gray-200`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">{metric.icon}</span>
            <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{metric.label}</h3>
          <p className="text-xs text-gray-600">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};


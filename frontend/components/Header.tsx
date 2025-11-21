"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  const activeTab = pathname?.includes("vendor-rfq-comparison") ? "vendor" 
    : pathname?.includes("rfq-cad-comparison") ? "compare"
    : "welding";

  return (
    <header className="fixed top-0 left-0 w-full z-50" style={{ backgroundColor: '#010101' }}>
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/yaralabs_logo.png"
              alt="YAARALABS Logo"
              width={180}
              height={60}
              className="h-14 w-auto object-contain"
              priority
              unoptimized
            />
            <span className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              YAARALABS
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/vendor-rfq-comparison">
              <button
                className="px-4 pb-3 pt-2 text-sm font-semibold"
                style={{ color: activeTab === "vendor" ? '#FFFFFF' : '#939394', borderBottom: activeTab === "vendor" ? '3px solid #5332FF' : '3px solid transparent' }}
              >
                Vendor RFQ Comparison
              </button>
            </Link>
            <Link href="/rfq-cad-comparison">
              <button
                className="px-4 pb-3 pt-2 text-sm font-semibold"
                style={{ color: activeTab === "compare" ? '#FFFFFF' : '#939394', borderBottom: activeTab === "compare" ? '3px solid #5332FF' : '3px solid transparent' }}
              >
                RFQ – CAD Comparison
              </button>
            </Link>
            <Link href="/welding-analyzer">
              <button
                className="px-4 pb-3 pt-2 text-sm font-semibold"
                style={{ color: activeTab === "welding" ? '#FFFFFF' : '#939394', borderBottom: activeTab === "welding" ? '3px solid #5332FF' : '3px solid transparent' }}
              >
                Welding Analyzer
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};


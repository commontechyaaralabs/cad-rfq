"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ThemeSwitcherCompact } from "./ThemeSwitcher";
import { useTheme } from "./ThemeProvider";

// Icons for menu items
const DataCaptureIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const WorkflowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const FunctionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IndustryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const UseCaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface DropdownProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  theme: ReturnType<typeof useTheme>['theme'];
}

const Dropdown = ({ label, isOpen, onToggle, onClose, children, align = 'left', theme }: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center px-4 py-2 text-sm font-medium transition-colors"
        style={{ color: isOpen ? '#B90ABD' : '#939394' }}
        onMouseEnter={(e) => !isOpen && (e.currentTarget.style.color = '#FFFFFF')}
        onMouseLeave={(e) => !isOpen && (e.currentTarget.style.color = '#939394')}
      >
        {label}
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div 
          className={`absolute top-full mt-2 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn ${alignmentClasses[align]}`} 
          style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// YAARALABS Brand Colors
const BRAND = {
  black: '#010101',
  magenta: '#B90ABD',
  lightGray: '#D6D9D8',
  purple: '#5332FF',
  white: '#FFFFFF',
  gray: '#939394',
};

export const Header = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { theme, themeName } = useTheme();
  const isDark = themeName === 'dark';

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdown = () => setOpenDropdown(null);

  // Platform menu items
  const platformItems = {
    dataCapture: [
      { label: "Invoices", href: "/supply-chain-document-automation", description: "Extract invoice data automatically" },
      { label: "Purchase Orders", href: "/supply-chain-document-automation", description: "Process PO documents" },
      { label: "Bills of Lading", href: "/supply-chain-document-automation", description: "Capture shipping documents" },
      { label: "CAD Drawings", href: "/rfq-cad-comparison", description: "Analyze engineering drawings" },
      { label: "RFQ Documents", href: "/vendor-rfq-comparison", description: "Compare vendor quotes" },
    ],
    workflows: [
      { label: "Document Processing", href: "/supply-chain-document-automation", icon: WorkflowIcon, description: "End-to-end document automation" },
      { label: "AI Extraction", href: "/welding-analyzer", icon: AIIcon, description: "Intelligent data extraction" },
      { label: "Matching & Reconciliation", href: "/supply-chain-document-automation", icon: WorkflowIcon, description: "Cross-reference documents" },
    ],
    aiAgents: [
      { label: "AI Analysis Engine", href: "/welding-analyzer", icon: AIIcon, description: "Intelligent document analysis" },
    ],
  };

  // Solutions menu items
  const solutionItems = {
    byFunction: [
      { label: "Procurement", href: "/vendor-rfq-comparison", description: "Vendor comparison & selection" },
      { label: "Quality Assurance", href: "/rfq-cad-comparison", description: "CAD & welding inspection" },
      { label: "Supply Chain Ops", href: "/supply-chain-document-automation", description: "Document automation" },
      { label: "Finance & Accounting", href: "/supply-chain-document-automation", description: "Invoice processing" },
    ],
    byIndustry: [
      { label: "Manufacturing", href: "/welding-analyzer", description: "Production & quality" },
      { label: "Logistics", href: "/supply-chain-document-automation", description: "Shipping & receiving" },
      { label: "Automotive", href: "/rfq-cad-comparison", description: "Parts & components" },
      { label: "Engineering", href: "/rfq-cad-comparison", description: "Design validation" },
    ],
    byUseCase: [
      { label: "Vendor Comparison", href: "/vendor-rfq-comparison", description: "Compare multiple RFQs" },
      { label: "CAD Validation", href: "/rfq-cad-comparison", description: "RFQ vs CAD matching" },
      { label: "Document Matching", href: "/supply-chain-document-automation", description: "PO-BoL-GRN-Invoice" },
      { label: "Welding Inspection", href: "/welding-analyzer", description: "Spec extraction & compliance" },
    ],
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50" style={{ backgroundColor: BRAND.black }}>
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/yaralabs_logo.png"
              alt="YAARALABS Logo"
              width={160}
              height={50}
              className="h-10 w-auto object-contain"
              priority
              unoptimized
            />
            <span className="text-xl font-bold" style={{ color: BRAND.white }}>
              YAARALABS
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {/* Platform Dropdown */}
            <Dropdown
              label="Platform"
              isOpen={openDropdown === "platform"}
              onToggle={() => toggleDropdown("platform")}
              onClose={closeDropdown}
              align="right"
              theme={theme}
            >
              <div className="flex min-w-[700px]">
                {/* Data Capture Column */}
                <div className="p-6 border-r flex-1" style={{ borderColor: BRAND.lightGray }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: BRAND.gray }}>Data Capture</h3>
                  <div className="space-y-1">
                    {platformItems.dataCapture.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeDropdown}
                        className="group flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD]">{item.label}</span>
                        <ArrowRightIcon />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Workflows Column */}
                <div className="p-6 border-r flex-1" style={{ borderColor: BRAND.lightGray }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: BRAND.gray }}>Workflows</h3>
                  <div className="space-y-1">
                    {platformItems.workflows.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeDropdown}
                        className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                          <item.icon />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD] block">{item.label}</span>
                          <span className="text-xs" style={{ color: BRAND.gray }}>{item.description}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* AI Agents Column */}
                <div className="p-6 flex-1" style={{ background: `linear-gradient(135deg, ${BRAND.magenta}08, transparent)` }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: BRAND.gray }}>AI Agents</h3>
                  <div className="space-y-1">
                    {platformItems.aiAgents.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeDropdown}
                        className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: BRAND.magenta }}>
                          <item.icon />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD] block">{item.label}</span>
                          <span className="text-xs" style={{ color: BRAND.gray }}>{item.description}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Dropdown>

            {/* Solutions Dropdown */}
            <Dropdown
              label="Solutions"
              isOpen={openDropdown === "solutions"}
              onToggle={() => toggleDropdown("solutions")}
              onClose={closeDropdown}
              align="right"
              theme={theme}
            >
              <div className="flex min-w-[700px]">
                {/* By Function Column */}
                <div className="p-6 border-r flex-1" style={{ borderColor: BRAND.lightGray }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: BRAND.gray }}>
                    <FunctionIcon />
                    By Function
                  </h3>
                  <div className="space-y-1">
                    {solutionItems.byFunction.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeDropdown}
                        className="group flex flex-col px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD]">{item.label}</span>
                        <span className="text-xs" style={{ color: BRAND.gray }}>{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* By Industry Column */}
                <div className="p-6 border-r flex-1" style={{ borderColor: BRAND.lightGray }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: BRAND.gray }}>
                    <IndustryIcon />
                    By Industry
                  </h3>
                  <div className="space-y-1">
                    {solutionItems.byIndustry.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeDropdown}
                        className="group flex flex-col px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD]">{item.label}</span>
                        <span className="text-xs" style={{ color: BRAND.gray }}>{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* By Use Case Column */}
                <div className="p-6 flex-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: BRAND.gray }}>
                    <UseCaseIcon />
                    By Use Case
                  </h3>
                  <div className="space-y-1">
                    {solutionItems.byUseCase.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeDropdown}
                        className="group flex flex-col px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD]">{item.label}</span>
                        <span className="text-xs" style={{ color: BRAND.gray }}>{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Dropdown>

            {/* Company Dropdown */}
            <Dropdown
              label="Company"
              isOpen={openDropdown === "company"}
              onToggle={() => toggleDropdown("company")}
              onClose={closeDropdown}
              align="right"
              theme={theme}
            >
              <div className="p-4 min-w-[220px]">
                <div className="space-y-1">
                  <Link
                    href="/about"
                    onClick={closeDropdown}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND.lightGray, color: BRAND.gray }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD] block">About Us</span>
                      <span className="text-xs" style={{ color: BRAND.gray }}>Learn about YAARALABS</span>
                    </div>
            </Link>
                  <Link
                    href="/contact"
                    onClick={closeDropdown}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND.lightGray, color: BRAND.gray }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#B90ABD] block">Contact</span>
                      <span className="text-xs" style={{ color: BRAND.gray }}>Get in touch with us</span>
                    </div>
            </Link>
                </div>
              </div>
            </Dropdown>

            {/* Theme Switcher */}
            <ThemeSwitcherCompact />

            {/* CTA Button */}
            <Link
              href="/vendor-rfq-comparison"
              className="ml-2 px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg hover:opacity-90"
              style={{ backgroundColor: BRAND.magenta }}
              >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

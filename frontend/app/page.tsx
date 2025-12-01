"use client";
import { Header } from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useTheme, BRAND } from "@/components/ThemeProvider";

export default function HomePage() {
  const { theme } = useTheme();
  
  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden" style={{ backgroundColor: BRAND.black }}>
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B90ABD' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                  style={{ backgroundColor: `${BRAND.magenta}20`, color: BRAND.magenta }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: BRAND.magenta }} />
                  AI-Powered Document Automation
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: BRAND.white }}>
                  Transform Your 
                  <span style={{ color: BRAND.magenta }}> Document Workflows</span>
                </h1>
                <p className="text-xl mb-8 leading-relaxed" style={{ color: BRAND.gray }}>
                  Automate procurement, quality assurance, and supply chain operations with intelligent AI that understands your documents.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/vendor-rfq-comparison"
                    className="px-8 py-4 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    style={{ backgroundColor: BRAND.magenta }}
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/about"
                    className="px-8 py-4 font-semibold rounded-xl transition-all"
                    style={{ backgroundColor: 'transparent', color: BRAND.white, border: `2px solid ${BRAND.gray}` }}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              
              {/* Hero Visual */}
              <div className="relative">
                <div 
                  className="rounded-2xl p-8 shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${BRAND.magenta}, ${BRAND.purple})` }}
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${BRAND.magenta}15` }}
                      >
                        <svg className="w-5 h-5" style={{ color: BRAND.magenta }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: BRAND.black }}>Document Processed</div>
                        <div className="text-xs" style={{ color: BRAND.gray }}>Invoice #INV-2024-001</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: BRAND.gray }}>Vendor</span>
                        <span className="text-sm font-medium" style={{ color: BRAND.black }}>ABC Manufacturing</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: BRAND.gray }}>Amount</span>
                        <span className="text-sm font-medium" style={{ color: BRAND.black }}>₹2,45,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: BRAND.gray }}>Confidence</span>
                        <span className="text-sm font-medium" style={{ color: BRAND.magenta }}>98.5%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: BRAND.lightGray }}>
                        <div className="h-full w-[98%] rounded-full" style={{ backgroundColor: BRAND.magenta }} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg" style={{ borderColor: BRAND.lightGray, borderWidth: 1 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${BRAND.magenta}15` }}>
                      <svg className="w-4 h-4" style={{ color: BRAND.magenta }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium" style={{ color: BRAND.black }}>Matched</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y transition-colors duration-300" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: theme.accent }}>95%</div>
                <div className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: theme.accent }}>99%</div>
                <div className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: theme.accent }}>50K+</div>
                <div className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>Documents Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: theme.accent }}>10x</div>
                <div className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>ROI</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.background }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.foreground }}>
                Powerful Solutions for Every Workflow
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: theme.foregroundSecondary }}>
                From procurement to quality assurance, our AI-powered platform handles it all.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <Link href="/vendor-rfq-comparison" className="group">
                <div 
                  className="rounded-2xl p-6 border hover:shadow-xl transition-all h-full"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})` }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#B90ABD] transition-colors" style={{ color: theme.foreground }}>
                    Vendor RFQ Comparison
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.foregroundSecondary }}>
                    Compare multiple vendor quotes instantly. Get AI-powered recommendations for the best pricing, delivery, and terms.
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.accent }}>
                    Try it now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Feature 2 */}
              <Link href="/rfq-cad-comparison" className="group">
                <div 
                  className="rounded-2xl p-6 border hover:shadow-xl transition-all h-full"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})` }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#B90ABD] transition-colors" style={{ color: theme.foreground }}>
                    RFQ–CAD Validation
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.foregroundSecondary }}>
                    Automatically validate CAD drawings against RFQ specifications. Identify mismatches before they become costly errors.
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.accent }}>
                    Try it now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Feature 3 */}
              <Link href="/supply-chain-document-automation" className="group">
                <div 
                  className="rounded-2xl p-6 border hover:shadow-xl transition-all h-full"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})` }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#B90ABD] transition-colors" style={{ color: theme.foreground }}>
                    Supply Chain Automation
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.foregroundSecondary }}>
                    End-to-end document processing. Match POs, Bills of Lading, GRNs, and Invoices automatically.
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.accent }}>
                    Try it now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Feature 4 */}
              <Link href="/welding-analyzer" className="group">
                <div 
                  className="rounded-2xl p-6 border hover:shadow-xl transition-all h-full"
                  style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})` }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#B90ABD] transition-colors" style={{ color: theme.foreground }}>
                    Welding Analyzer
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.foregroundSecondary }}>
                    Extract welding specifications from CAD drawings. Ensure compliance with quality standards automatically.
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.accent }}>
                    Try it now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.backgroundSecondary }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.foreground }}>
                Built for Industry Leaders
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: theme.foregroundSecondary }}>
                Trusted by manufacturing and logistics companies worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl p-6 text-center border transition-colors duration-300" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold" style={{ color: theme.foreground }}>Manufacturing</h3>
                <p className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>Production & QA</p>
              </div>
              <div className="rounded-xl p-6 text-center border transition-colors duration-300" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold" style={{ color: theme.foreground }}>Logistics</h3>
                <p className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>Shipping & Receiving</p>
              </div>
              <div className="rounded-xl p-6 text-center border transition-colors duration-300" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="font-semibold" style={{ color: theme.foreground }}>Automotive</h3>
                <p className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>Parts & Components</p>
              </div>
              <div className="rounded-xl p-6 text-center border transition-colors duration-300" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <h3 className="font-semibold" style={{ color: theme.foreground }}>Engineering</h3>
                <p className="text-sm mt-1" style={{ color: theme.foregroundSecondary }}>Design Validation</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20" style={{ background: `linear-gradient(135deg, ${BRAND.magenta}, ${BRAND.purple})` }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: BRAND.white }}>
              Ready to Transform Your Workflows?
            </h2>
            <p className="text-xl mb-8" style={{ color: `${BRAND.white}cc` }}>
              Start automating your document processing today. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/vendor-rfq-comparison"
                className="px-8 py-4 font-semibold rounded-xl transition-colors shadow-lg"
                style={{ backgroundColor: BRAND.white, color: BRAND.magenta }}
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 font-semibold rounded-xl transition-colors"
                style={{ backgroundColor: 'transparent', color: BRAND.white, border: `2px solid ${BRAND.white}50` }}
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12" style={{ backgroundColor: BRAND.black, color: BRAND.white }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/yaralabs_logo.png"
                    alt="YAARALABS Logo"
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain"
                    unoptimized
                  />
                  <span className="text-lg font-bold">YAARALABS</span>
                </div>
                <p className="text-sm" style={{ color: BRAND.gray }}>
                  AI-powered document automation for manufacturing and logistics.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm" style={{ color: BRAND.gray }}>
                  <li><Link href="/vendor-rfq-comparison" className="hover:text-white transition-colors">Vendor Comparison</Link></li>
                  <li><Link href="/rfq-cad-comparison" className="hover:text-white transition-colors">CAD Validation</Link></li>
                  <li><Link href="/supply-chain-document-automation" className="hover:text-white transition-colors">Supply Chain</Link></li>
                  <li><Link href="/welding-analyzer" className="hover:text-white transition-colors">Welding Analysis</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm" style={{ color: BRAND.gray }}>
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Industries</h4>
                <ul className="space-y-2 text-sm" style={{ color: BRAND.gray }}>
                  <li>Manufacturing</li>
                  <li>Logistics</li>
                  <li>Automotive</li>
                  <li>Engineering</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 text-center" style={{ borderTop: `1px solid ${BRAND.gray}30` }}>
              <p className="text-sm" style={{ color: BRAND.gray }}>
                © {new Date().getFullYear()} YAARALABS. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
                    }

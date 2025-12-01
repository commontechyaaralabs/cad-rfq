"use client";
import { Header } from "@/components/Header";
import Image from "next/image";

// YAARALABS Brand Colors
const BRAND = {
  black: '#010101',
  magenta: '#B90ABD',
  lightGray: '#D6D9D8',
  purple: '#5332FF',
  white: '#FFFFFF',
  gray: '#939394',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: BRAND.white }}>
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20" style={{ background: `linear-gradient(135deg, ${BRAND.magenta}, ${BRAND.purple})` }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src="/yaralabs_logo.png"
                alt="YAARALABS Logo"
                width={80}
                height={80}
                className="h-16 w-auto object-contain"
                unoptimized
              />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ color: BRAND.white }}>YAARALABS</h1>
            </div>
            <p className="text-xl md:text-2xl max-w-3xl" style={{ color: `${BRAND.white}dd` }}>
              Transforming industrial workflows with AI-powered document automation and intelligent analysis.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16" style={{ backgroundColor: BRAND.white }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ color: BRAND.black }}>Our Mission</h2>
                <p className="text-lg mb-4" style={{ color: BRAND.gray }}>
                  At YAARALABS, we&apos;re on a mission to eliminate manual document processing in manufacturing and logistics. 
                  Our AI-powered platform automates the extraction, validation, and matching of critical business documents.
                </p>
                <p className="text-lg" style={{ color: BRAND.gray }}>
                  We believe that engineers and operations teams should focus on innovation and problem-solving, 
                  not data entry and document reconciliation.
                </p>
              </div>
              <div className="rounded-2xl p-8" style={{ background: `linear-gradient(135deg, ${BRAND.lightGray}60, ${BRAND.lightGray}30)` }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: BRAND.magenta }}>95%</div>
                    <div className="text-sm mt-1" style={{ color: BRAND.gray }}>Time Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: BRAND.magenta }}>99%</div>
                    <div className="text-sm mt-1" style={{ color: BRAND.gray }}>Accuracy Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: BRAND.magenta }}>24/7</div>
                    <div className="text-sm mt-1" style={{ color: BRAND.gray }}>Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: BRAND.magenta }}>10x</div>
                    <div className="text-sm mt-1" style={{ color: BRAND.gray }}>ROI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16" style={{ backgroundColor: `${BRAND.lightGray}40` }}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: BRAND.black }}>What We Do</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow" style={{ backgroundColor: BRAND.white, borderColor: BRAND.lightGray }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND.black }}>Vendor RFQ Comparison</h3>
                <p className="text-sm" style={{ color: BRAND.gray }}>
                  Compare multiple vendor quotes instantly with AI-powered analysis and recommendations.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow" style={{ backgroundColor: BRAND.white, borderColor: BRAND.lightGray }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND.black }}>RFQ–CAD Validation</h3>
                <p className="text-sm" style={{ color: BRAND.gray }}>
                  Automatically validate CAD drawings against RFQ specifications to ensure compliance.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow" style={{ backgroundColor: BRAND.white, borderColor: BRAND.lightGray }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND.black }}>Supply Chain Automation</h3>
                <p className="text-sm" style={{ color: BRAND.gray }}>
                  End-to-end document processing for PO, BoL, GRN, and Invoice matching.
                </p>
              </div>

              {/* Card 4 */}
              <div className="rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow" style={{ backgroundColor: BRAND.white, borderColor: BRAND.lightGray }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND.black }}>Welding Analysis</h3>
                <p className="text-sm" style={{ color: BRAND.gray }}>
                  Extract and validate welding specifications from CAD drawings for quality inspection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16" style={{ backgroundColor: BRAND.white }}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: BRAND.black }}>Powered by Advanced AI</h2>
            <div className="rounded-2xl p-8 md:p-12" style={{ background: `linear-gradient(135deg, ${BRAND.magenta}08, ${BRAND.purple}08)` }}>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full shadow-lg flex items-center justify-center mb-4" style={{ backgroundColor: BRAND.white }}>
                    <svg className="w-8 h-8" style={{ color: BRAND.magenta }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND.black }}>Advanced AI</h3>
                  <p className="text-sm" style={{ color: BRAND.gray }}>State-of-the-art multimodal AI for document understanding</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full shadow-lg flex items-center justify-center mb-4" style={{ backgroundColor: BRAND.white }}>
                    <svg className="w-8 h-8" style={{ color: BRAND.magenta }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND.black }}>Google Cloud</h3>
                  <p className="text-sm" style={{ color: BRAND.gray }}>Enterprise-grade infrastructure with global availability</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full shadow-lg flex items-center justify-center mb-4" style={{ backgroundColor: BRAND.white }}>
                    <svg className="w-8 h-8" style={{ color: BRAND.magenta }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND.black }}>Enterprise Security</h3>
                  <p className="text-sm" style={{ color: BRAND.gray }}>SOC 2 compliant with end-to-end encryption</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16" style={{ background: `linear-gradient(135deg, ${BRAND.magenta}, ${BRAND.purple})` }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: BRAND.white }}>Ready to Transform Your Workflows?</h2>
            <p className="text-lg mb-8" style={{ color: `${BRAND.white}cc` }}>
              Start automating your document processing today with our AI-powered platform.
            </p>
            <a
              href="/vendor-rfq-comparison"
              className="inline-block px-8 py-4 font-semibold rounded-lg transition-colors shadow-lg"
              style={{ backgroundColor: BRAND.white, color: BRAND.magenta }}
            >
              Get Started Free
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12" style={{ backgroundColor: BRAND.black, color: BRAND.white }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
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
                © {new Date().getFullYear()} YAARALABS. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

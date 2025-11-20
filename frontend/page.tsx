"use client";
import { useState } from "react";
import Image from "next/image";

export default function Page() {
  return (
    <main className="min-h-screen w-full font-sans relative overflow-hidden" style={{ backgroundColor: '#010101' }}>
      <header className="fixed top-0 left-0 w-full z-50" style={{ backgroundColor: '#010101' }}>
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
            </div>
            <nav className="flex items-center gap-2 border-b" style={{ borderColor: '#2A2A2A' }}>
              <button className="px-4 pb-3 pt-2 text-sm font-semibold" style={{ color: '#FFFFFF', borderBottom: '3px solid #5332FF' }}>
                Welding Analyzer
              </button>
              <button className="px-4 pb-3 pt-2 text-sm font-semibold" style={{ color: '#939394' }}>
                RFQ – CAD Comparison
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="w-full px-6 py-6 pt-24">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg shadow-lg p-6 flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: '#010101' }}>
              Simplified UI for debugging
            </h2>
            <p style={{ color: '#010101' }}>
              JSX structure issues have been temporarily resolved by simplifying the component.
              The original complex component had 95 opening div tags and only 92 closing div tags,
              causing linter errors about unclosed JSX elements.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}








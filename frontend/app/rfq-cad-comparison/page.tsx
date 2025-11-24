"use client";
import { useState, useEffect } from "react";
import { TailSpinner } from "@/components/TailSpinner";
import { PreviewModal } from "@/components/PreviewModal";
import { formatBytes } from "@/utils/formatBytes";
import { Header } from "@/components/Header";
import { openComparePreview } from "@/utils/previewUtils";

export default function RfqCadComparisonPage() {
  const [rfqFile, setRfqFile] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [comparePart, setComparePart] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);
  const [compareAbort, setCompareAbort] = useState<AbortController | null>(null);
  const [isDraggingRFQ, setIsDraggingRFQ] = useState(false);
  const [isDraggingCAD, setIsDraggingCAD] = useState(false);
  const [compareResult, setCompareResult] = useState<null | {
    match: boolean;
    confidence: string;
    summary: string;
    rfq_requirements: string[];
    cad_findings: string[];
    mismatches: string[];
    recommendations?: string;
    annotated_image?: string | null;
    annotations?: any[];
  }>(null);
  const [compareSubTab, setCompareSubTab] = useState<"summary" | "auto">("summary");
  const [compareSelections, setCompareSelections] = useState<boolean[]>([]);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [showCompareDetails, setShowCompareDetails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"image" | "pdf" | "other">("other");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isPartDropdownOpen, setIsPartDropdownOpen] = useState(false);
  const [partSearchQuery, setPartSearchQuery] = useState<string>("");

  const handleOpenPreview = (targetFile: File | null, kindHint: "rfq" | "cad") => {
    openComparePreview(targetFile, setPreviewUrl, setPreviewKind, setPreviewFile, setIsPreviewOpen, kindHint);
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setIsPreviewOpen(false);
    setPreviewUrl(null);
    setPreviewFile(null);
  };

  useEffect(() => {
    if (!compareResult || !compareResult.rfq_requirements) {
      setCompareSelections([]);
      return;
    }
    const next: boolean[] = compareResult.rfq_requirements.map(() => false);
    setCompareSelections(next);
  }, [compareResult]);

  useEffect(() => {
    if (compareSubTab === "auto") {
      setZoomLevel(100);
    }
  }, [compareSubTab]);

  useEffect(() => {
    // If user is on "auto" tab but there's no annotated image, switch to "summary"
    if (compareSubTab === "auto" && !compareResult?.annotated_image) {
      setCompareSubTab("summary");
    }
  }, [compareResult, compareSubTab]);

  // Determine current step
  const getCurrentStep = () => {
    if (compareResult) return 3;
    if (isComparing || (rfqFile && cadFile && comparePart)) return 2;
    return 1;
  };
  const currentStep = getCurrentStep();

  const handleRFQDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRFQ(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setRfqFile(files[0]);
    }
  };

  const handleCADDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCAD(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setCadFile(files[0]);
    }
  };

  const partOptions = [
    { value: "spark_plug", label: "Spark Plug" },
    { value: "brake_disc", label: "Brake Disc" },
    { value: "horn", label: "Horn" },
  ];

  const filteredPartOptions = partOptions.filter(option =>
    option.label.toLowerCase().includes(partSearchQuery.toLowerCase())
  );

  const selectedPart = partOptions.find(opt => opt.value === comparePart);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.part-dropdown-container')) {
        setIsPartDropdownOpen(false);
        setPartSearchQuery("");
      }
    };

    if (isPartDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPartDropdownOpen]);

  return (
    <main className="min-h-screen w-full font-sans relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <Header />
      <section className="w-full flex justify-center pt-28 pb-8 px-6">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-0.5">RFQ – CAD Comparison</h1>
              <p className="text-sm text-gray-600">Compare RFQ requirements with CAD drawings for compliance and quality assurance</p>
            </div>
            {compareResult && !isComparing && (
              <button
                onClick={() => {
                  setRfqFile(null);
                  setCadFile(null);
                  setCompareResult(null);
                  setComparePart("");
                  setCompareSubTab("summary");
                  setShowCompareDetails(false);
                }}
                className="px-5 py-2.5 text-base text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Start New Comparison
              </button>
            )}
          </div>

          {/* Upload Section - Show when no results */}
          {!compareResult && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-[#5332FF]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= 1 ? 'bg-[#5332FF] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      1
                    </div>
                    <span className="font-medium">Upload Files</span>
                  </div>
                  <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-[#5332FF]' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-[#5332FF]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= 2 ? 'bg-[#5332FF] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      2
                    </div>
                    <span className="font-medium">Analyze & Compare</span>
                  </div>
                  <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-[#5332FF]' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-[#5332FF]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= 3 ? 'bg-[#5332FF] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      3
                    </div>
                    <span className="font-medium">View Results</span>
                  </div>
                </div>
              </div>

              {/* Part Selection */}
              <div className="mb-6 part-dropdown-container relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Select Automotive Part</label>
                <div className="w-full max-w-xs relative">
                  {/* Input Field */}
                  <div
                    onClick={() => {
                      setIsPartDropdownOpen(!isPartDropdownOpen);
                      if (!isPartDropdownOpen) {
                        setPartSearchQuery(selectedPart?.label || "");
                      }
                    }}
                    className="relative cursor-pointer"
                  >
                    <input
                      type="text"
                      placeholder="Select your automotive part"
                      value={isPartDropdownOpen ? partSearchQuery : (selectedPart?.label || "")}
                      onChange={(e) => {
                        setPartSearchQuery(e.target.value);
                        setIsPartDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setIsPartDropdownOpen(true);
                        setPartSearchQuery(selectedPart?.label || "");
                      }}
                      className="w-full text-sm px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#5332FF] focus:border-transparent cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isPartDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown List */}
                  {isPartDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-xl max-h-60 overflow-auto">
                      {filteredPartOptions.length > 0 ? (
                        filteredPartOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              setComparePart(option.value);
                              setIsPartDropdownOpen(false);
                              setPartSearchQuery("");
                            }}
                            className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              comparePart === option.value
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className={`text-sm ${comparePart === option.value ? 'text-blue-900 font-medium' : 'text-gray-900'}`}>
                              {option.label}
                            </span>
                            {comparePart === option.value && (
                              <svg
                                className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">No parts found</div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* File Upload Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* RFQ Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">RFQ File</h3>
                  <div
                    onDrop={handleRFQDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingRFQ(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingRFQ(false);
                    }}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      isDraggingRFQ ? 'border-[#5332FF] bg-[#5332FF]/5' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {rfqFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                          <div className="h-10 w-10 rounded-md flex items-center justify-center text-xs font-semibold bg-[#5332FF]/10 text-[#5332FF]">
                        DOC
                      </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p 
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:underline"
                              onClick={() => handleOpenPreview(rfqFile, "rfq")}
                            >
                              {rfqFile.name}
                            </p>
                            <p className="text-xs text-gray-500">{formatBytes(rfqFile.size)}</p>
                      </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRfqFile(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                    </div>
                    <button
                          onClick={() => document.getElementById('rfq-input')?.click()}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                          Change File
                    </button>
                  </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#5332FF]/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#5332FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">Upload RFQ Document</h4>
                        <p className="text-sm text-gray-600">Drop your RFQ file here or browse to get started</p>
                <button
                  onClick={() => document.getElementById('rfq-input')?.click()}
                          className="px-6 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors"
                >
                          Browse Files
                </button>
                        <p className="text-sm text-gray-500 mt-2">Supports: PDF, DOCX files</p>
                      </div>
                    )}
                <input
                  id="rfq-input"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => setRfqFile(e.target.files?.[0] || null)}
                />
              </div>
                </div>

                {/* CAD Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">CAD File</h3>
                  <div
                    onDrop={handleCADDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingCAD(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingCAD(false);
                    }}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      isDraggingCAD ? 'border-[#5332FF] bg-[#5332FF]/5' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {cadFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                          <div className="h-10 w-10 rounded-md flex items-center justify-center text-xs font-semibold bg-[#5332FF]/10 text-[#5332FF]">
                        IMG
                      </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p 
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:underline"
                              onClick={() => handleOpenPreview(cadFile, "cad")}
                            >
                              {cadFile.name}
                            </p>
                            <p className="text-xs text-gray-500">{formatBytes(cadFile.size)}</p>
                      </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCadFile(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                    </div>
                    <button
                          onClick={() => document.getElementById('cad-input')?.click()}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                          Change File
                    </button>
                  </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#5332FF]/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#5332FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">Upload CAD Drawing</h4>
                        <p className="text-sm text-gray-600">Drop your CAD file here or browse to get started</p>
                <button
                  onClick={() => document.getElementById('cad-input')?.click()}
                          className="px-6 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors"
                >
                          Browse Files
                </button>
                        <p className="text-sm text-gray-500 mt-2">Supports: PNG, JPG, JPEG, WEBP, PDF</p>
                      </div>
                    )}
                <input
                  id="cad-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf,image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setCadFile(e.target.files?.[0] || null)}
                />
              </div>
                </div>
              </div>

              {/* Action Buttons */}
              {rfqFile && cadFile && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setRfqFile(null);
                    setCadFile(null);
                    setCompareResult(null);
                      setComparePart("");
                  }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  disabled={!rfqFile || !cadFile || !comparePart || isComparing}
                  onClick={async () => {
                    if (!rfqFile || !cadFile || !comparePart) return;
                    try {
                      setIsComparing(true);
                      setShowCompareDetails(false);
                      const form = new FormData();
                      form.append("rfq", rfqFile);
                      form.append("cad", cadFile);
                      form.append("part", comparePart);
                      const controller = new AbortController();
                      setCompareAbort(controller);
                      const res = await fetch("http://localhost:8000/compare", {
                        method: "POST",
                        body: form,
                        signal: controller.signal,
                      });
                      if (!res.ok) {
                        let errorMessage = `Request failed (${res.status})`;
                        try {
                          const errorData = await res.json();
                          errorMessage = errorData?.detail || errorData?.message || errorMessage;
                        } catch {
                          const text = await res.text();
                          if (text) {
                            try {
                              const errorData = JSON.parse(text);
                              errorMessage = errorData?.detail || errorData?.message || errorMessage;
                            } catch {
                              errorMessage = text || errorMessage;
                            }
                          }
                        }
                        throw new Error(errorMessage);
                      }
                      const data = await res.json();
                      
                      // Validate response structure
                      if (!data || (data.success === false)) {
                        throw new Error(data?.detail || data?.message || "Invalid response from server");
                      }
                      
                      setCompareResult({
                        match: !!data?.match,
                        confidence: String(data?.confidence || ""),
                        summary: String(data?.summary || ""),
                        rfq_requirements: (data?.rfq_requirements || []) as string[],
                        cad_findings: (data?.cad_findings || []) as string[],
                        mismatches: (data?.mismatches || []) as string[],
                        recommendations: data?.recommendations || "",
                        annotated_image: data?.annotated_image || null,
                        annotations: (data?.annotations || []) as any[],
                      });
                      setCompareSubTab("summary");
                    } catch (err: any) {
                      if (err?.name !== "AbortError") {
                        const errorMessage = err?.message || "Comparison failed. Please try again.";
                        alert(errorMessage);
                        console.error("Comparison error:", err);
                      }
                    } finally {
                      setCompareAbort(null);
                      setIsComparing(false);
                    }
                  }}
                    className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isComparing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Comparing...
                      </>
                    ) : (
                      <>
                        Run Comparison
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                </button>
              </div>
              )}

              {/* Loading State */}
              {isComparing && (
                <div className="mt-8 py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <TailSpinner size={48} />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparing RFQ and CAD</h3>
                      <p className="text-gray-600">Analyzing requirements, dimensions, and specifications...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {compareResult && !isComparing && (
            <div className="space-y-6">
              {/* AI Summary - Horizontal KPI Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      <span className="blink-emoji">✨</span> AI Summary
                    </h4>
                    <p className="text-xs text-gray-500">High-level status of metrics</p>
                  </div>
                  <button
                    onClick={() => setShowCompareDetails(!showCompareDetails)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-[#5332FF] hover:bg-[#5332FF]/5 transition-colors"
                  >
                    {showCompareDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                {(() => {
                  const rfqReq = compareResult?.rfq_requirements || [];
                  const cadFind = compareResult?.cad_findings || [];
                  const annotations = compareResult?.annotations || [];

                  // Prefer annotation-level truth
                  let metrics: {
                    label: string;
                    rfqVal?: string;
                    cadVal?: string;
                    isMatch: boolean;
                    isMissing: boolean;
                  }[] = [];

                  if (annotations && annotations.length > 0) {
                    metrics = annotations.map((a: any) => {
                      const status = (a.match || "").toString();
                      const rfqVal = a.rfq_value ?? "";
                      const cadVal = a.cad_value ?? "";

                      return {
                        label: a.parameter || "",
                        rfqVal,
                        cadVal,
                        isMatch: status === "Match",
                        isMissing: status === "Missing" || !cadVal,
                      };
                    });
                  } else {
                    // fallback: old behavior if no annotations exist
                    metrics = rfqReq.map((rfqItem, idx) => {
                      const cadItem = cadFind[idx] || "";
                      const [labelRaw, rfqValRaw] = String(rfqItem).split(":");
                      const [, cadValRaw] = String(cadItem).split(":");
                      const label = (labelRaw || "").trim();
                      const rfqVal = (rfqValRaw || "").trim();
                      const cadVal = (cadValRaw || "").trim();
                      const hasCad = !!cadVal;
                      const isMatch = !!(rfqVal && cadVal && rfqVal === cadVal);
                      const isMissing = !hasCad;
                      return { label, rfqVal, cadVal, isMatch, isMissing };
                    });
                  }

                  const matchedMetrics = metrics.filter((m) => m.isMatch);
                  const mismatchedMetrics = metrics.filter(
                    (m) => !m.isMatch && !m.isMissing
                  );
                  const missingMetrics = metrics.filter((m) => m.isMissing);

                  const matchedCount = matchedMetrics.length;
                  const mismatchesCount = mismatchedMetrics.length;
                  const missingCount = missingMetrics.length;
                  const total = matchedCount + mismatchesCount + missingCount;

                  if (!total) {
                    return (
                      <div className="rounded-lg bg-gray-50 border border-dashed border-gray-200 px-4 py-6 text-center">
                        <p className="text-sm font-medium text-gray-500">
                          No comparison data yet
                        </p>
                      </div>
                    );
                  }

                  const matchedNames = matchedMetrics.map((m) => m.label);
                  const mismatchedNames = mismatchedMetrics.map((m) => m.label);
                  const missingNames = missingMetrics.map((m) => m.label);

                  const rows = [
                    {
                      key: "matched",
                      label: "Matched",
                      value: matchedCount,
                      colorBg: "#E7F8ED",
                      colorText: "#16A34A",
                      barColor: "#22C55E",
                      helper:
                        matchedCount > 0
                          ? "Dimensions that align across RFQ and CAD."
                          : "No matches identified yet.",
                      metricNames: matchedNames,
                    },
                    {
                      key: "mismatched",
                      label: "Mismatched",
                      value: mismatchesCount,
                      colorBg: "#FDECEC",
                      colorText: "#DC2626",
                      barColor: "#EF4444",
                      helper:
                        mismatchesCount > 0
                          ? "Review conflicting dimensions before approving."
                          : "No mismatches identified.",
                      metricNames: mismatchedNames,
                    },
                    {
                      key: "missing",
                      label: "Missing",
                      value: missingCount,
                      colorBg: "#FEF3C7",
                      colorText: "#D97706",
                      barColor: "#F59E0B",
                      helper:
                        missingCount > 0
                          ? "Dimensions specified in the RFQ but absent on the CAD drawing."
                          : "No missing metrics.",
                      metricNames: missingNames,
                    },
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {rows.map((row) => {
                        const pct = total
                          ? Math.round((row.value / total) * 100)
                          : 0;
                        return (
                          <div
                            key={row.key}
                            className="rounded-lg bg-white border border-gray-100 px-4 py-4 flex flex-col gap-3"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-900 mb-1">
                                  {row.label} items
                                </span>
                                <span className="text-xs text-gray-600 leading-relaxed">
                                  {row.helper}
                                </span>
                              </div>
                              <span
                                className="text-3xl font-bold flex-shrink-0"
                                style={{ color: row.colorText }}
                              >
                                {row.value}
                              </span>
                            </div>

                            {row.value > 0 && total > 0 && (
                              <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: row.barColor,
                                  }}
                                />
                              </div>
                            )}

                            {row.metricNames && row.metricNames.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {(expandedMetrics.has(row.key)
                                  ? row.metricNames
                                  : row.metricNames.slice(0, 3)
                                ).map((name) => (
                                  <span
                                    key={`${row.key}-${name}`}
                                    className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs border border-gray-200 text-gray-700 font-medium"
                                  >
                                    {name}
                                  </span>
                                ))}

                                {row.metricNames.length > 3 && (
                                  <button
                                    onClick={() => {
                                      setExpandedMetrics((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(row.key)) {
                                          next.delete(row.key);
                                        } else {
                                          next.add(row.key);
                                        }
                                        return next;
                                      });
                                    }}
                                    className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                                  >
                                    {expandedMetrics.has(row.key)
                                      ? "Show less"
                                      : `+${row.metricNames.length - 3} more`}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Detailed Comparison with Tabs */}
              {showCompareDetails && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    {/* Tab Navigation */}
                    <div className="flex mb-4 px-1 border-b border-gray-200">
                      <button
                        onClick={() => setCompareSubTab("summary")}
                        className="mr-6 pb-3 px-2 text-sm font-semibold transition-colors"
                        style={{
                          color: compareSubTab === "summary" ? '#0B0B0C' : '#9CA3AF',
                          borderBottom: compareSubTab === "summary" ? '3px solid #5332FF' : '3px solid transparent',
                        }}
                      >
                        Detailed Summary
                      </button>
                      {compareResult?.annotated_image && (
                        <button
                          onClick={() => setCompareSubTab("auto")}
                          className="pb-3 px-2 text-sm font-semibold transition-colors"
                          style={{
                            color: compareSubTab === "auto" ? '#0B0B0C' : '#9CA3AF',
                            borderBottom: compareSubTab === "auto" ? '3px solid #5332FF' : '3px solid transparent',
                          }}
                        >
                          Smart Annotation
                        </button>
                      )}
                    </div>

                    {/* Tab Content */}
                    {compareSubTab === "summary" && (() => {
                    const categorizeMetric = (label: string): string => {
                      const lower = label.toLowerCase();
                      if (lower.includes('thread')) return 'Thread Specifications';
                      if (lower.includes('electrode')) return 'Electrode Specifications';
                      if (lower.includes('terminal')) return 'Terminal Specifications';
                      if (lower.includes('insulator')) return 'Insulator Specifications';
                      if (lower.includes('diameter') || lower.includes('dia') || lower.includes('length') || lower.includes('size') || lower.includes('width') || lower.includes('height') || lower.includes('thickness')) return 'Dimensional Metrics';
                      return 'Other Specifications';
                    };

                    const metricsBySection: Record<string, Array<{ idx: number; label: string; rfqVal: string; cadVal: string; isChecked: boolean }>> = {};
                    
                    (compareResult.rfq_requirements || []).forEach((rfqItem, idx) => {
                      const cadItem = compareResult.cad_findings[idx] || '';
                      const [metricLabel, rfqValRaw] = String(rfqItem).split(':');
                      const [, cadValRaw] = String(cadItem).split(':');
                      const rfqVal = (rfqValRaw || '').trim();
                      const cadVal = (cadValRaw || '').trim();
                      const isChecked = compareSelections[idx] ?? false;
                      
                      const section = categorizeMetric(metricLabel);
                      if (!metricsBySection[section]) {
                        metricsBySection[section] = [];
                      }
                      metricsBySection[section].push({ idx, label: metricLabel, rfqVal, cadVal, isChecked });
                    });

                    const sectionOrder = [
                      'Thread Specifications',
                      'Dimensional Metrics',
                      'Electrode Specifications',
                      'Terminal Specifications',
                      'Insulator Specifications',
                      'Other Specifications'
                    ];

                    const tableRows: Array<{ type: 'section' | 'data'; sectionName?: string; metric?: { idx: number; label: string; rfqVal: string; cadVal: string; isChecked: boolean } }> = [];
                    
                    sectionOrder.forEach((sectionName) => {
                      const metrics = metricsBySection[sectionName];
                      if (!metrics || metrics.length === 0) return;
                      
                      tableRows.push({ type: 'section', sectionName });
                      metrics.forEach((metric) => {
                        tableRows.push({ type: 'data', metric });
                      });
                    });

                    const totalMetrics = (compareResult.rfq_requirements || []).length;
                    const allSelected = totalMetrics > 0 && Array.from({ length: totalMetrics }, (_, idx) => idx).every(idx => compareSelections[idx] === true);

                    return (
                      <div className="w-full rounded-lg overflow-hidden border border-gray-200">
                        <table className="w-full border-collapse text-xs">
                          <thead style={{ backgroundColor: '#F3F4F6' }}>
                            <tr>
                              <th className="text-left px-4 py-2 font-semibold text-gray-600">Metrics</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-600">RFQ Requirements</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-600">CAD Findings</th>
                              <th className="text-center px-4 py-2 font-semibold text-gray-600">
                                <div className="flex items-center justify-center gap-2">
                                  <span>Select All</span>
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={() => {
                                      const newValue = !allSelected;
                                      setCompareSelections(Array(totalMetrics).fill(newValue));
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableRows.map((row, idx) => {
                              if (row.type === 'section') {
                                return (
                                  <tr key={`section-${row.sectionName}`}>
                                    <td colSpan={4} className="px-4 py-2 font-semibold bg-green-50 text-gray-700 border-t border-gray-200">
                                      {row.sectionName}
                                    </td>
                                  </tr>
                                );
                              } else {
                                const metric = row.metric!;
                                return (
                                  <tr key={`row-${metric.idx}`} className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2 text-gray-900">{metric.label}</td>
                                    <td className="px-4 py-2 text-gray-900">{metric.rfqVal}</td>
                                    <td className="px-4 py-2 text-gray-900">{metric.cadVal}</td>
                                    <td className="px-4 py-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={metric.isChecked}
                                        onChange={() => {
                                          setCompareSelections(prev => {
                                            const next = [...prev];
                                            next[metric.idx] = !metric.isChecked;
                                            return next;
                                          });
                                        }}
                                        className="cursor-pointer"
                                      />
                                    </td>
                                  </tr>
                                );
                              }
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                    
                    {compareSubTab === "auto" && compareResult?.annotated_image && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            <span className="blink-emoji">✨</span> CAD Smart Annotation
                          </h3>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}
                              className="px-2 py-1 rounded border text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              −
                            </button>
                            <input
                              type="range"
                              min="25"
                              max="200"
                              step="25"
                              value={zoomLevel}
                              onChange={(e) => setZoomLevel(Number(e.target.value))}
                              className="w-24"
                            />
                            <button
                              onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                              className="px-2 py-1 rounded border text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              +
                            </button>
                            <button
                              onClick={() => setZoomLevel(100)}
                              className="px-3 py-1 rounded border text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              Reset
                            </button>
                            <span className="text-sm font-medium text-gray-600 min-w-[45px]">
                              {zoomLevel}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-gray-700">Mismatch</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-gray-700">Match</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-gray-700">Missing</span>
                          </div>
                        </div>

                        <div className="w-full bg-white rounded-md border border-gray-200 overflow-auto" style={{ maxHeight: '600px' }}>
                          <div className="flex items-center justify-center p-4">
                            <img
                              src={compareResult.annotated_image}
                              alt="Annotated CAD"
                              className="transition-all"
                              style={{
                                width: `${zoomLevel}%`,
                                height: 'auto',
                              }}
                            />
                          </div>
                        </div>

                        {compareResult.annotations && compareResult.annotations.length > 0 && (
                          <div className="w-full rounded-md border border-gray-200 overflow-hidden">
                            <table className="w-full border-collapse text-xs">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Metric</th>
                                  <th className="text-left px-4 py-2 font-semibold text-gray-600">RFQ</th>
                                  <th className="text-left px-4 py-2 font-semibold text-gray-600">CAD</th>
                                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {compareResult.annotations.map((annotation: any, idx: number) => {
                                  const status = annotation.match || 'Missing';
                                  const statusColor = 
                                    status === 'Match' ? '#10B981' :
                                    status === 'Mismatch' ? '#EF4444' :
                                    '#F59E0B';
                                  
                                  return (
                                    <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-2 text-gray-900">{annotation.parameter || '—'}</td>
                                      <td className="px-4 py-2 text-gray-900">{annotation.rfq_value || '—'}</td>
                                      <td className="px-4 py-2 text-gray-900">{annotation.cad_value || '—'}</td>
                                      <td className="px-4 py-2">
                                        <span
                                          className="px-2 py-1 rounded text-xs font-medium"
                                          style={{
                                            backgroundColor: statusColor + '20',
                                            color: statusColor,
                                          }}
                                        >
                                          {status.toUpperCase()}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>


      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        previewUrl={previewUrl}
        previewKind={previewKind}
        fileName={previewFile?.name || null}
      />
    </main>
  );
}

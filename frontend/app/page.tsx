"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Page() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"image" | "pdf" | "other">("other");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [analysisTable, setAnalysisTable] = useState<Array<Record<string, string>> | null>(null);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);
  const [activeTab, setActiveTab] = useState<"welding" | "compare" | "vendor">("welding");

  // RFQ – CAD Comparison state
  const [rfqFile, setRfqFile] = useState<File | null>(null);
  const [cadFile, setCadFile] = useState<File | null>(null);
  const [comparePart, setComparePart] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);
  const [compareAbort, setCompareAbort] = useState<AbortController | null>(null);
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

  // Vendor RFQ Comparison state
  const [vendorRfqFiles, setVendorRfqFiles] = useState<File[]>([]);
  const [vendorPart, setVendorPart] = useState<string>("");
  const [isVendorDragging, setIsVendorDragging] = useState(false);
  const [selectedVendorFiles, setSelectedVendorFiles] = useState<Set<number>>(new Set());
  const [visibleVendorFiles, setVisibleVendorFiles] = useState<Set<number>>(new Set()); // Track visible files for LLM
  const [isVendorComparing, setIsVendorComparing] = useState(false);
  const [vendorResult, setVendorResult] = useState<null | {
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
        dimensions?: any;
        specifications?: any;
      };
    }>;
    comparison?: {
      best_price_vendor?: string;
      best_delivery_vendor?: string;
      best_warranty_vendor?: string;
      overall_recommendation?: string;
    };
  }>(null);

  const onBrowseClick = () => {
    const input = document.getElementById("file-input") as HTMLInputElement | null;
    input?.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const picked = files[0];
    setFile(picked);
    setProgress(0);
    // Simulate upload completion for UI preview
    requestAnimationFrame(() => {
      setProgress(100);
    });
  };

  const openPreview = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (file.type.startsWith("image/")) {
      setPreviewKind("image");
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setPreviewKind("pdf");
    } else {
      setPreviewKind("other");
    }
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setIsPreviewOpen(false);
    setPreviewUrl(null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Vendor RFQ drag and drop handlers
  const onVendorDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVendorDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Check if it's a PDF or DOCX file
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
        if (isPdf || isDocx) {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        setVendorRfqFiles(prev => {
          const newFiles = [...prev, ...validFiles];
          // Auto-add new files to selected and visible
          const newIndices = Array.from({ length: validFiles.length }, (_, i) => prev.length + i);
          setSelectedVendorFiles(prevSelected => new Set([...prevSelected, ...newIndices]));
          setVisibleVendorFiles(prevVisible => new Set([...prevVisible, ...newIndices]));
          return newFiles;
        });
      }
    }
  };

  const onVendorDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isVendorDragging) setIsVendorDragging(true);
  };

  const onVendorDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVendorDragging(false);
  };

  const onCancel = () => {
    // Abort in-flight analyze request if any
    if (abortCtrl) {
      try {
        abortCtrl.abort();
        setImportMessage("Import cancelled.");
      } catch {}
      setAbortCtrl(null);
    }
    setIsImporting(false);
    setFile(null);
    setProgress(0);
    setImportMessage(null);
    setAnalysisTable(null);
  };

  const TailSpinner = ({ size = 24 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="spinner-rotate"
      aria-hidden
    >
      <defs>
        <linearGradient id="fadeTail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5332FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#5332FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" fill="none" />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="url(#fadeTail)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="60 200"
        strokeDashoffset="0"
      />
      <style jsx>{`
        .spinner-rotate {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </svg>
  );

  const renderFileIcon = () => {
    if (!file) return null;
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const circleStyle = { backgroundColor: '#F3F4F6' };
    if (isImage) {
      return (
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={circleStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="#5332FF" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 7a2 2 0 1 1 0 4a2 2 0 0 1 0-4zm11 10l-5-6l-3.5 4.5L8 13l-3 4h14z"></path>
          </svg>
        </div>
      );
    }
    if (isPdf) {
      return (
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={circleStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EF4444" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <path fill="#FFFFFF" d="M8 16h1.5a2 2 0 0 0 0-4H8zm1.5-3a1 1 0 1 1 0 2H9v-2zM12 12h1v4h-1zm2 0h1.8a1.7 1.7 0 0 1 0 3.4H14zM15.8 15a.7.7 0 1 0 0-1.4H15V15z"></path>
            <path fill="#EF4444" d="M14 2v6h6z"></path>
          </svg>
        </div>
      );
    }
    return (
      <div className="h-8 w-8 rounded-full flex items-center justify-center" style={circleStyle}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#6B7280" d="M14 2H6a2 2 0 0 0-2 2v14h2V4h8z"></path>
          <path fill="#6B7280" d="M14 2v6h6z"></path>
        </svg>
      </div>
    );
  };

  const openComparePreview = (targetFile: File | null, kindHint: "rfq" | "cad") => {
    if (!targetFile) return;
    const url = URL.createObjectURL(targetFile);
    setPreviewUrl(url);
    if (kindHint === "cad" && (targetFile.type.startsWith("image/") || targetFile.name.toLowerCase().match(/\.(png|jpe?g|webp)$/))) {
      setPreviewKind("image");
    } else if (targetFile.type === "application/pdf" || targetFile.name.toLowerCase().endsWith(".pdf")) {
      setPreviewKind("pdf");
    } else {
      setPreviewKind("other");
    }
    // reuse existing preview modal title by setting file ref
    setFile(targetFile);
    setIsPreviewOpen(true);
  };

  // When a new comparison result arrives, initialise all checkboxes to unchecked
  useEffect(() => {
    if (!compareResult || !compareResult.rfq_requirements) {
      setCompareSelections([]);
      return;
    }
    // Initialize all checkboxes to false (unchecked)
    const next: boolean[] = compareResult.rfq_requirements.map(() => false);
    setCompareSelections(next);
  }, [compareResult]);

  useEffect(() => {
    if (compareSubTab === "auto") {
      setZoomLevel(100);
    }
  }, [compareSubTab]);

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
              <button
                onClick={() => setActiveTab("welding")}
                className="px-4 pb-3 pt-2 text-sm font-semibold"
                style={{ color: activeTab === "welding" ? '#FFFFFF' : '#939394', borderBottom: activeTab === "welding" ? '3px solid #5332FF' : '3px solid transparent' }}
              >
                Welding Analyzer
              </button>
              <button
                onClick={() => setActiveTab("compare")}
                className="px-4 pb-3 pt-2 text-sm font-semibold"
                style={{ color: activeTab === "compare" ? '#FFFFFF' : '#939394', borderBottom: activeTab === "compare" ? '3px solid #5332FF' : '3px solid transparent' }}
              >
                RFQ – CAD Comparison
              </button>
              <button
                onClick={() => setActiveTab("vendor")}
                className="px-4 pb-3 pt-2 text-sm font-semibold"
                style={{ color: activeTab === "vendor" ? '#FFFFFF' : '#939394', borderBottom: activeTab === "vendor" ? '3px solid #5332FF' : '3px solid transparent' }}
              >
                Vendor RFQ Comparison
              </button>
            </nav>
          </div>
        </div>
      </header>
      {activeTab === "welding" && (
      <section className="w-full flex justify-center pt-24 pb-6 px-6">
        <div className="w-full max-w-[1200px] rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#0B0B0C' }}>
              Upload CAD File
            </h2>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className="w-full rounded-lg grid place-items-center text-center"
              style={{
                height: 170,
                backgroundColor: '#FFFFFF',
                border: `2px dashed ${isDragging ? '#7E64FF' : '#D1D5DB'}`,
                transition: 'border-color 120ms ease'
              }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-3" aria-hidden>
                  <svg width="56" height="56" viewBox="0 0 24 24">
                    <path fill="#7E64FF" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 7V3.5L19.5 9z"></path>
                  </svg>
                </div>
                <p className="text-base font-medium mb-1 leading-tight" style={{ color: '#0B0B0C' }}>
                  Drop your CAD file or drawing here, or browse
                </p>
                <p className="text-xs mb-3 leading-snug" style={{ color: '#6B7280' }}>
                  Supports: PNG, JPG, JPEG, WEBP, PDF (CAD drawings, welding diagrams)
                </p>
                <button
                  onClick={onBrowseClick}
                  className="px-4 py-2 rounded-md text-sm font-semibold"
                  style={{ backgroundColor: '#5332FF', color: '#FFFFFF', marginBottom: 8 }}
                >
                  Browse Files
                </button>
                <input
                  id="file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
            </div>

            {file && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={openPreview}>
                  {renderFileIcon()}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm underline decoration-dotted" style={{ color: '#0B0B0C' }}>{file.name}</p>
                    <p className="text-xs" style={{ color: '#9A9A9A' }}>{formatBytes(file.size)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#9A9A9A' }}>{progress}%</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#7E64FF" d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"></path>
                    </svg>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EAEAEA' }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: '#5332FF',
                      transition: 'width 200ms ease'
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-md text-sm font-semibold"
                    style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!file || isImporting}
                    className="px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                    style={{ backgroundColor: '#5332FF', color: '#FFFFFF' }}
                    onClick={async () => {
                      if (!file || isImporting) return;
                      try {
                        setIsImporting(true);
                        setImportMessage(null);
                        setAnalysisTable(null);
                        const form = new FormData();
                        form.append("file", file);
                        const controller = new AbortController();
                        setAbortCtrl(controller);
                        const res = await fetch("http://localhost:8000/analyze", {
                          method: "POST",
                          body: form,
                          signal: controller.signal,
                        });
                        if (!res.ok) {
                          const text = await res.text();
                          throw new Error(text || `Request failed (${res.status})`);
                        }
                        const data = await res.json();
                        setImportMessage("Imported successfully.");
                        if (Array.isArray(data?.table)) {
                          setAnalysisTable(
                            data.table.map((row: any) => {
                              const clean: Record<string, string> = {};
                              Object.keys(row || {}).forEach((k) => {
                                clean[k] = String(row[k] ?? "");
                              });
                              return clean;
                            })
                          );
                        }
                        // You can access data.report/table/explanations here for further UI
                        // console.log(data);
                      } catch (err: any) {
                        if (err?.name === "AbortError") {
                          setImportMessage("Import cancelled.");
                        } else {
                          setImportMessage(err?.message || "Import failed.");
                        }
                      } finally {
                        setAbortCtrl(null);
                        setIsImporting(false);
                      }
                    }}
                  >
                    {isImporting ? "Importing..." : "Import"}
                  </button>
                </div>
                {importMessage && (
                  <p className="mt-2 text-sm" style={{ color: importMessage.includes("success") ? '#16A34A' : '#DC2626' }}>
                    {importMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {activeTab === "compare" && (
        <section className="w-full flex justify-center pt-24 pb-8 px-6">
          <div className="w-full max-w-[1400px] grid md:grid-cols-3 gap-5">
            {/* LEFT CARD */}
            <div className="md:col-span-2 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: '#0B0B0C' }}>
                    RFQ – CAD Comparison
                  </h2>
                  <select
                    className="text-sm px-3 py-2 rounded-md border"
                    style={{ borderColor: '#D1D5DB', color: '#111827' }}
                    value={comparePart}
                    onChange={(e) => setComparePart(e.target.value)}
                  >
                    <option value="" disabled>Select your automotive part</option>
                    <option value="spark_plug">Spark Plug</option>
                    <option value="brake_disc">Brake Disc</option>
                    <option value="horn">Horn</option>
                  </select>
                </div>
                {/* RFQ Block */}
                <div className="rounded-lg p-4 mb-4" style={{ border: '1px solid #E5E7EB', backgroundColor: '#FBFBFD' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0B0B0C' }}>RFQ File</p>
                  <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
                    Upload the customer's RFQ or specification (PDF or Word document).
                  </p>
                  {rfqFile && (
                    <div
                      className="mb-3 rounded-md px-4 py-3 flex items-center justify-between cursor-pointer"
                      style={{ backgroundColor: '#F3F4F6' }}
                      onClick={() => openComparePreview(rfqFile, "rfq")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: '#E5E7EB', color: '#111827' }}>
                          DOC
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#0B0B0C' }}>{rfqFile.name}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{formatBytes(rfqFile.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setRfqFile(null)}
                        className="px-3 py-1 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => document.getElementById('rfq-input')?.click()}
                    className="w-full text-sm font-semibold px-4 py-2 rounded-md"
                    style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
                  >
                    Browse RFQ
                  </button>
                  <input
                    id="rfq-input"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => setRfqFile(e.target.files?.[0] || null)}
                  />
                </div>
                {/* CAD Block */}
                <div className="rounded-lg p-4" style={{ border: '1px solid #E5E7EB', backgroundColor: '#FBFBFD' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#0B0B0C' }}>CAD File</p>
                  <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
                    Upload the CAD drawing to compare (PNG, JPG, JPEG, WEBP, or PDF).
                  </p>
                  {cadFile && (
                    <div
                      className="mb-3 rounded-md px-4 py-3 flex items-center justify-between cursor-pointer"
                      style={{ backgroundColor: '#F3F4F6' }}
                      onClick={() => openComparePreview(cadFile, "cad")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: '#E5E7EB', color: '#111827' }}>
                          IMG
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#0B0B0C' }}>{cadFile.name}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{formatBytes(cadFile.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCadFile(null)}
                        className="px-3 py-1 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => document.getElementById('cad-input')?.click()}
                    className="w-full text-sm font-semibold px-4 py-2 rounded-md"
                    style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
                  >
                    Browse CAD
                  </button>
                  <input
                    id="cad-input"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf,image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => setCadFile(e.target.files?.[0] || null)}
                  />
                </div>
                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        if (isComparing && compareAbort) {
                          compareAbort.abort();
                          setIsComparing(false);
                          return;
                        }
                        setRfqFile(null);
                        setCadFile(null);
                        setCompareResult(null);
                        setCompareSubTab("summary");
                        setShowCompareDetails(false);
                      }}
                      className="px-4 py-2 rounded-md text-sm font-semibold"
                      style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
                    >
                      Reset
                    </button>
                    <button
                      disabled={!rfqFile || !cadFile || !comparePart || isComparing}
                      className="px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                      style={{ backgroundColor: '#5332FF', color: '#FFFFFF' }}
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
                            const text = await res.text();
                            throw new Error(text || `Request failed (${res.status})`);
                          }
                          const data = await res.json();
                          setCompareResult({
                            match: !!data?.match,
                            confidence: String(data?.confidence || ""),
                            summary: String(data?.summary || ""),
                            rfq_requirements: (data?.rfq_requirements || []) as string[],
                            cad_findings: (data?.cad_findings || []) as string[],
                            mismatches: (data?.mismatches || []) as string[],
                            recommendations: data?.recommendations,
                            annotated_image: data?.annotated_image || null,
                            annotations: data?.annotations || [],
                          });
                          setCompareSubTab("summary");
                        } catch (err: any) {
                          if (err?.name !== "AbortError") {
                            alert(err?.message || "Comparison failed.");
                          }
                        } finally {
                          setCompareAbort(null);
                          setIsComparing(false);
                        }
                      }}
                    >
                      {isComparing ? "Comparing..." : "Compare"}
                    </button>
                  </div>
              </div>
            </div>
            {/* RIGHT CARD */}
            <div className="md:col-span-1 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="p-4">
                <div
                  className="rounded-lg p-4 shadow-sm transition-shadow transform hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                >
                  <h4 className="text-sm font-semibold mb-1" style={{ color: '#0B0B0C' }}>
                    <span className="blink-emoji">✨</span> AI Summary
                  </h4>
                  <p className="text-xs mb-4" style={{ color: '#6B7280' }}>High-level status of metrics</p>
                  {(() => {
                    const rfqReq = compareResult?.rfq_requirements || [];
                    const cadFind = compareResult?.cad_findings || [];

                    // Build a list of metrics with match/mismatch/missing info
                    const metrics = rfqReq.map((rfqItem, idx) => {
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

                    const matchedMetrics = metrics.filter((m) => m.isMatch);
                    const mismatchedMetrics = metrics.filter((m) => !m.isMatch && !m.isMissing && m.cadVal);
                    const missingMetrics = metrics.filter((m) => m.isMissing);

                    const matchedCount = matchedMetrics.length;
                    const mismatchesCount = mismatchedMetrics.length;
                    const missingCount = missingMetrics.length;
                    const total = matchedCount + mismatchesCount + missingCount;

                    if (!total) {
                      // Friendly empty state when no metrics are available yet
                      return (
                        <div className="rounded-lg bg-white border border-dashed border-gray-200 px-4 py-6 text-center">
                          <p className="text-sm font-medium" style={{ color: '#111827' }}>
                            No comparison data yet
                          </p>
                          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                            Upload an RFQ and CAD drawing, then run a comparison to see matched, mismatched, and missing metrics.
                          </p>
                        </div>
                      );
                    }

                    const matchedNames = matchedMetrics.map((m) => m.label);
                    const mismatchedNames = mismatchedMetrics.map((m) => m.label);
                    const missingNames = missingMetrics.map((m) => m.label);

                    const rows = [
                      {
                        key: 'matched',
                        label: 'Matched',
                        value: matchedCount,
                        colorBg: '#E7F8ED',
                        colorText: '#15803D',
                        barColor: '#22C55E',
                        // Check-circle style icon
                        icon: (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                          >
                            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18" />
                            <path
                              d="M10.1 15.3 7.6 12.7a.9.9 0 1 1 1.27-1.27l1.53 1.53 3.7-3.7a.9.9 0 1 1 1.27 1.27l-4.33 4.33a.9.9 0 0 1-1.27 0Z"
                              fill="currentColor"
                            />
                          </svg>
                        ),
                        helper:
                          matchedCount > 0
                            ? 'Dimensions that align across RFQ and CAD.'
                            : 'No matches identified yet.',
                        metricNames: matchedNames,
                      },
                      {
                        key: 'mismatched',
                        label: 'Mismatched',
                        value: mismatchesCount,
                        colorBg: '#FDECEC',
                        colorText: '#B91C1C',
                        barColor: '#EF4444',
                        // Error icon
                        icon: (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                          >
                            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18" />
                            <path
                              d="M12 7.25a.9.9 0 0 1 .9.9v5.1a.9.9 0 1 1-1.8 0v-5.1a.9.9 0 0 1 .9-.9Zm0 9.5a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z"
                              fill="currentColor"
                            />
                          </svg>
                        ),
                        helper:
                          mismatchesCount > 0
                            ? 'Review conflicting dimensions before approving.'
                            : 'No mismatches identified.',
                        metricNames: mismatchedNames,
                      },
                      {
                        key: 'missing',
                        label: 'Missing',
                        value: missingCount,
                        colorBg: '#FEF3C7',
                        colorText: '#92400E',
                        barColor: '#F59E0B',
                        // Warning triangle icon
                        icon: (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                          >
                            <path
                              d="M11.05 4.58c.43-.8 1.47-.8 1.9 0l7.04 13.1c.4.72-.29 1.82-1.32 1.82H5.33c-1.03 0-1.72-1.1-1.32-1.82l7.04-13.1Z"
                              fill="currentColor"
                              opacity="0.18"
                            />
                            <path
                              d="M12 9.1a.9.9 0 0 1 .9.9v4a.9.9 0 1 1-1.8 0v-4a.9.9 0 0 1 .9-.9Zm0 7.2a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z"
                              fill="currentColor"
                            />
                          </svg>
                        ),
                        helper:
                          missingCount > 0
                            ? 'Dimensions specified in the RFQ but absent on the CAD drawing.'
                            : 'No missing metrics.',
                        metricNames: missingNames,
                      },
                    ];

                    return (
                      <div className="space-y-4">
                        {rows.map((row) => {
                          const pct = total ? Math.round((row.value / total) * 100) : 0;
                          return (
                            <div
                              key={row.key}
                              className="rounded-lg bg-white border border-gray-100 px-3 py-3 flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium" style={{ color: '#374151' }}>
                                    {row.label} items
                                  </span>
                                  <span className="text-[11px]" style={{ color: '#6B7280' }}>
                                    {row.helper}
                                  </span>
                                </div>
                                <span
                                  className="text-2xl font-bold px-2"
                                  style={{ color: row.colorText }}
                                >
                                  {row.value}
                                </span>
                              </div>
                              {/* proportion bar only when there is data */}
                              {row.value > 0 && total > 0 && (
                                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${pct}%`, backgroundColor: row.barColor }}
                                  />
                                </div>
                              )}
                              {/* metric name chips */}
                              {row.metricNames && row.metricNames.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(expandedMetrics.has(row.key) ? row.metricNames : row.metricNames.slice(0, 3)).map((name) => (
                                    <span
                                      key={`${row.key}-${name}`}
                                      className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] border border-gray-200"
                                      style={{ color: '#4B5563' }}
                                    >
                                      {name}
                                    </span>
                                  ))}
                                  {row.metricNames.length > 3 && (
                                    <button
                                      onClick={() => {
                                        setExpandedMetrics(prev => {
                                          const next = new Set(prev);
                                          if (next.has(row.key)) {
                                            next.delete(row.key);
                                          } else {
                                            next.add(row.key);
                                          }
                                          return next;
                                        });
                                      }}
                                      className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                      style={{ color: '#4B5563' }}
                                    >
                                      {expandedMetrics.has(row.key) ? 'Show less' : `+${row.metricNames.length - 3} more`}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <button
                          onClick={() => {
                            if (showCompareDetails) {
                              setShowCompareDetails(false);
                            } else {
                              setShowCompareDetails(true);
                              setCompareSubTab("summary");
                              setTimeout(() => {
                                document.getElementById('compare-details')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }
                          }}
                          className="w-full text-sm font-semibold px-4 py-2 rounded-md mt-2"
                          style={{ backgroundColor: '#5332FF', color: '#FFFFFF' }}
                        >
                          {showCompareDetails ? 'Hide details' : 'Show details'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "compare" && showCompareDetails && compareResult && (
        <section className="w-full flex justify-center pb-8 px-6">
          <div className="w-full max-w-[1400px]">
            {/* inner nav above card */}
            <div className="flex mb-2 px-1">
              <button
                onClick={() => setCompareSubTab("summary")}
                className="mr-6 pb-2 text-sm font-semibold"
                style={{
                  color: compareSubTab === "summary" ? '#FFFFFF' : '#9CA3AF',
                  borderBottom: compareSubTab === "summary" ? '3px solid #5332FF' : '3px solid transparent',
                  background: 'transparent',
                }}
              >
                Detailed Summary
              </button>
              <button
                onClick={() => setCompareSubTab("auto")}
                className="pb-2 text-sm font-semibold"
                style={{
                  color: compareSubTab === "auto" ? '#FFFFFF' : '#9CA3AF',
                  borderBottom: compareSubTab === "auto" ? '3px solid #5332FF' : '3px solid transparent',
                  background: 'transparent',
                }}
              >
                Smart Annotation
              </button>
            </div>

            <div id="compare-details" className="space-y-6">
              {isComparing && compareSubTab === "summary" && (
                <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                  <div className="flex flex-col items-center justify-center gap-3 py-10">
                    <TailSpinner size={36} />
                    <span className="text-sm" style={{ color: '#6B7280' }}>Comparing RFQ and CAD…</span>
                  </div>
                </div>
              )}
              {compareSubTab === "summary" && compareResult && !isComparing && (
                <>
                  {/* Comparison Summary Card */}
                  <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <div className="px-6 py-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-semibold" style={{ color: '#0B0B0C' }}>
                            <span className="blink-emoji">✨</span> AI Comparison
                          </h3>
                          {compareResult.summary && (
                            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{compareResult.summary}</p>
                          )}
                          {compareResult.confidence && (
                            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                              Confidence:&nbsp;
                              <span className="font-semibold">{compareResult.confidence}</span>
                            </p>
                          )}
                        </div>
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: compareResult.match ? '#E7F8ED' : '#FDECEC',
                            color: compareResult.match ? '#166534' : '#991B1B',
                          }}
                        >
                          {compareResult.match ? 'Match' : 'Mismatch'}
                        </span>
                      </div>

                      {(() => {
                    // Categorize metrics into sections
                    const categorizeMetric = (label: string): string => {
                      const lower = label.toLowerCase();
                      if (lower.includes('thread')) return 'Thread Specifications';
                      if (lower.includes('electrode')) return 'Electrode Specifications';
                      if (lower.includes('terminal')) return 'Terminal Specifications';
                      if (lower.includes('insulator')) return 'Insulator Specifications';
                      if (lower.includes('diameter') || lower.includes('dia') || lower.includes('length') || lower.includes('size') || lower.includes('width') || lower.includes('height') || lower.includes('thickness')) return 'Dimensional Metrics';
                      return 'Other Specifications';
                    };

                    // Group metrics by category
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

                    // Build flat array of rows (section headers + data rows)
                    const tableRows: Array<{ type: 'section' | 'data'; sectionName?: string; metric?: { idx: number; label: string; rfqVal: string; cadVal: string; isChecked: boolean }; rowInSection?: number }> = [];
                    
                    sectionOrder.forEach((sectionName) => {
                      const metrics = metricsBySection[sectionName];
                      if (!metrics || metrics.length === 0) return;
                      
                      // Add section header
                      tableRows.push({ type: 'section', sectionName });
                      
                      // Add data rows for this section
                      metrics.forEach((metric, rowIdx) => {
                        tableRows.push({ type: 'data', metric, rowInSection: rowIdx });
                      });
                    });

                    // Calculate total metrics count and check if all are selected
                    const totalMetrics = (compareResult.rfq_requirements || []).length;
                    const allSelected = totalMetrics > 0 && Array.from({ length: totalMetrics }, (_, idx) => idx).every(idx => compareSelections[idx] === true);

                    return (
                      <div className="w-full rounded-lg overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
                        <table className="w-full border-collapse text-xs">
                          <thead style={{ backgroundColor: '#F3F4F6' }}>
                            <tr>
                              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>Metrics</th>
                              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>RFQ Requirements</th>
                              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>CAD Findings</th>
                              <th className="text-center px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>
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
                                    <td colSpan={4} className="px-4 py-2 font-semibold" style={{ backgroundColor: '#e7f8ed', color: '#374151', borderTop: idx > 0 ? '1px solid #E5E7EB' : 'none' }}>
                                      {row.sectionName}
                                    </td>
                                  </tr>
                                );
                              } else {
                                const metric = row.metric!;
                                return (
                                  <tr key={`row-${metric.idx}`} style={{ backgroundColor: '#FFFFFF' }}>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>{metric.label}</td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>{metric.rfqVal}</td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>{metric.cadVal}</td>
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
                    </div>
                  </div>

                  {/* Selected Items Card */}
                  {(() => {
                    const selectedMetrics: Array<{ idx: number; label: string; rfqVal: string; cadVal: string; sectionName: string }> = [];
                    
                    if (compareResult && compareResult.rfq_requirements) {
                      const categorizeMetric = (label: string) => {
                        const lower = label.toLowerCase();
                        if (lower.includes('thread')) return 'Thread Specifications';
                        if (lower.includes('electrode')) return 'Electrode Specifications';
                        if (lower.includes('terminal')) return 'Terminal Specifications';
                        if (lower.includes('insulator')) return 'Insulator Specifications';
                        if (lower.includes('diameter') || lower.includes('dia') || lower.includes('length') || lower.includes('size') || lower.includes('width') || lower.includes('height') || lower.includes('thickness')) return 'Dimensional Metrics';
                        return 'Other Specifications';
                      };

                      (compareResult.rfq_requirements || []).forEach((rfqItem, idx) => {
                        if (compareSelections[idx] === true) {
                          const cadItem = compareResult.cad_findings[idx] || '';
                          const [metricLabel, rfqValRaw] = String(rfqItem).split(':');
                          const [, cadValRaw] = String(cadItem).split(':');
                          const rfqVal = (rfqValRaw || '').trim();
                          const cadVal = (cadValRaw || '').trim();
                          const sectionName = categorizeMetric(metricLabel);
                          
                          selectedMetrics.push({
                            idx,
                            label: metricLabel,
                            rfqVal,
                            cadVal,
                            sectionName
                          });
                        }
                      });
                    }

                    if (selectedMetrics.length === 0) {
                      return null;
                    }

                    // Group by section
                    const metricsBySection: Record<string, Array<{ idx: number; label: string; rfqVal: string; cadVal: string }>> = {};
                    selectedMetrics.forEach(metric => {
                      if (!metricsBySection[metric.sectionName]) {
                        metricsBySection[metric.sectionName] = [];
                      }
                      metricsBySection[metric.sectionName].push({
                        idx: metric.idx,
                        label: metric.label,
                        rfqVal: metric.rfqVal,
                        cadVal: metric.cadVal
                      });
                    });

                    const sectionOrder = [
                      'Thread Specifications',
                      'Dimensional Metrics',
                      'Electrode Specifications',
                      'Terminal Specifications',
                      'Insulator Specifications',
                      'Other Specifications'
                    ];

                    const selectedTableRows: Array<{ type: 'section' | 'data'; sectionName?: string; metric?: { idx: number; label: string; rfqVal: string; cadVal: string } }> = [];
                    
                    sectionOrder.forEach((sectionName) => {
                      const metrics = metricsBySection[sectionName];
                      if (!metrics || metrics.length === 0) return;
                      
                      selectedTableRows.push({ type: 'section', sectionName });
                      metrics.forEach((metric) => {
                        selectedTableRows.push({ type: 'data', metric });
                      });
                    });

                    return (
                      <div className="mt-10 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                        <div className="px-6 py-4">
                          <h4 className="text-base font-semibold" style={{ color: '#0B0B0C' }}>
                            Selected Items ({selectedMetrics.length})
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="w-full rounded-lg overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
                            <table className="w-full border-collapse text-xs">
                              <thead style={{ backgroundColor: '#F3F4F6' }}>
                                <tr>
                                  <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>Metrics</th>
                                  <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>RFQ Requirements</th>
                                  <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>CAD Findings</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedTableRows.map((row, idx) => {
                                  if (row.type === 'section') {
                                    return (
                                      <tr key={`selected-section-${row.sectionName}`}>
                                        <td colSpan={3} className="px-4 py-2 font-semibold" style={{ backgroundColor: '#e7f8ed', color: '#374151', borderTop: idx > 0 ? '1px solid #E5E7EB' : 'none' }}>
                                          {row.sectionName}
                                        </td>
                                      </tr>
                                    );
                                  } else {
                                    const metric = row.metric!;
                                    return (
                                      <tr key={`selected-row-${metric.idx}`} style={{ backgroundColor: '#FFFFFF' }}>
                                        <td className="px-4 py-2" style={{ color: '#111827' }}>{metric.label}</td>
                                        <td className="px-4 py-2" style={{ color: '#111827' }}>{metric.rfqVal}</td>
                                        <td className="px-4 py-2" style={{ color: '#111827' }}>{metric.cadVal}</td>
                                      </tr>
                                    );
                                  }
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

                {compareSubTab === "auto" && (
                <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                  <div className="px-6 py-6 space-y-6">
                    {compareResult?.annotated_image ? (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold" style={{ color: '#0B0B0C' }}>
                          <span className="blink-emoji">✨</span> CAD Smart Annotation
                        </h3>
                        
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}
                            className="px-2 py-1 rounded border text-sm"
                            style={{ borderColor: '#D1D5DB', color: '#374151' }}
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
                            className="px-2 py-1 rounded border text-sm"
                            style={{ borderColor: '#D1D5DB', color: '#374151' }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => setZoomLevel(100)}
                            className="px-3 py-1 rounded border text-sm"
                            style={{ borderColor: '#D1D5DB', color: '#374151' }}
                          >
                            Reset
                          </button>
                          <span className="text-sm font-medium" style={{ color: '#6B7280', minWidth: '45px' }}>
                            {zoomLevel}%
                          </span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                          <span style={{ color: '#374151' }}>Mismatch</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                          <span style={{ color: '#374151' }}>Match</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                          <span style={{ color: '#374151' }}>Missing</span>
                        </div>
                      </div>

                      {/* Annotated Image */}
                      <div className="w-full bg-white rounded-md border overflow-auto" style={{ borderColor: '#E5E7EB', maxHeight: '600px' }}>
                        <div className="flex items-center justify-center p-4">
                          <img
                            src={compareResult.annotated_image}
                            alt="Annotated CAD"
                            style={{
                              width: `${zoomLevel}%`,
                              height: 'auto',
                              transition: 'width 0.2s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Comparison Table */}
                      {compareResult.annotations && compareResult.annotations.length > 0 && (
                        <div className="w-full rounded-md border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                          <table className="w-full border-collapse text-xs">
                            <thead style={{ backgroundColor: '#F3F4F6' }}>
                              <tr>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>Metric</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>RFQ</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>CAD</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#4B5563' }}>Status</th>
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
                                  <tr key={idx} style={{ backgroundColor: '#FFFFFF' }}>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>{annotation.parameter || '—'}</td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>{annotation.rfq_value || '—'}</td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>{annotation.cad_value || '—'}</td>
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
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                        Run a comparison to view the annotated CAD image with highlighted dimensions.
                      </p>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "vendor" && (
        <section className="w-full flex justify-center pt-24 pb-8 px-6">
          <div className="w-full max-w-[1200px] space-y-6">
            {/* Card 1: Vendor RFQ Comparison (File Upload Section) */}
            <div className="rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: '#0B0B0C' }}>
                    Vendor RFQ Comparison
                  </h2>
                  <select
                    className="text-sm px-3 py-2 rounded-md border"
                    style={{ borderColor: '#D1D5DB', color: '#111827' }}
                    value={vendorPart}
                    onChange={(e) => setVendorPart(e.target.value)}
                  >
                    <option value="" disabled>Select your automotive part</option>
                    <option value="spark_plug">Spark Plug</option>
                    <option value="brake_disc">Brake Disc</option>
                    <option value="horn">Horn</option>
                  </select>
                </div>
                {/* RFQ Block */}
                <div>
                  {/* Drag and Drop Zone - Always Visible */}
                  <div
                    onDrop={onVendorDrop}
                    onDragOver={onVendorDragOver}
                    onDragLeave={onVendorDragLeave}
                    className="w-full rounded-lg grid place-items-center text-center mb-4"
                    style={{
                      height: 170,
                      backgroundColor: '#FFFFFF',
                      border: `2px dashed ${isVendorDragging ? '#7E64FF' : '#D1D5DB'}`,
                      transition: 'border-color 120ms ease'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-3" aria-hidden>
                        <svg width="56" height="56" viewBox="0 0 24 24">
                          <path fill="#7E64FF" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 7V3.5L19.5 9z"></path>
                        </svg>
                      </div>
                      <p className="text-base font-medium mb-1 leading-tight" style={{ color: '#0B0B0C' }}>
                        Drop your RFQ files here, or browse
                      </p>
                      <p className="text-xs mb-3 leading-snug" style={{ color: '#6B7280' }}>
                        Supports: PDF, DOCX (RFQ or specification documents)
                      </p>
                      <button
                        onClick={() => document.getElementById('vendor-rfq-input')?.click()}
                        className="px-4 py-2 rounded-md text-sm font-semibold"
                        style={{ backgroundColor: '#5332FF', color: '#FFFFFF', marginBottom: 8 }}
                      >
                        Browse Files
                      </button>
                      <input
                        id="vendor-rfq-input"
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const validFiles: File[] = [];
                            for (let i = 0; i < files.length; i++) {
                              validFiles.push(files[i]);
                            }
                            if (validFiles.length > 0) {
                              setVendorRfqFiles(prev => {
                                const newFiles = [...prev, ...validFiles];
                                // Auto-add new files to selected and visible
                                const newIndices = Array.from({ length: validFiles.length }, (_, i) => prev.length + i);
                                setSelectedVendorFiles(prevSelected => new Set([...prevSelected, ...newIndices]));
                                setVisibleVendorFiles(prevVisible => new Set([...prevVisible, ...newIndices]));
                                return newFiles;
                              });
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 2: My Comparison Section */}
            {vendorRfqFiles.length > 0 && (
              <div className="rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <div className="px-6 py-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold" style={{ color: '#0B0B0C' }}>My Comparison</h3>
                        <button
                          onClick={() => {
                            // Clear all vendor-related state
                            setVendorRfqFiles([]);
                            setSelectedVendorFiles(new Set());
                            setVisibleVendorFiles(new Set());
                            setVendorResult(null);
                            setVendorPart("");
                            setIsVendorComparing(false);
                          }}
                          className="text-sm"
                          style={{ color: '#6B7280' }}
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {vendorRfqFiles.map((file, fileIndex) => {
                          const isVisible = visibleVendorFiles.has(fileIndex);
                          return (
                            <div key={fileIndex} className="flex items-center gap-4 flex-shrink-0">
                              {fileIndex > 0 && (
                                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#0B0B0C', color: '#FFFFFF' }}>
                                  VS
                                </div>
                              )}
                              <div className="relative rounded-lg p-4" style={{ border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', minWidth: 200, opacity: isVisible ? 1 : 0.5 }}>
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                  {/* Eye Icon Button */}
                                  <button
                                    onClick={() => {
                                      setVisibleVendorFiles(prev => {
                                        const newSet = new Set(prev);
                                        if (isVisible) {
                                          newSet.delete(fileIndex);
                                        } else {
                                          newSet.add(fileIndex);
                                        }
                                        return newSet;
                                      });
                                    }}
                                    className="h-6 w-6 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#F3F4F6' }}
                                    title={isVisible ? "Hide from comparison" : "Show in comparison"}
                                  >
                                    {isVisible ? (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2"/>
                                      </svg>
                                    ) : (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="1" y1="1" x2="23" y2="23" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </button>
                                  {/* Remove Button */}
                                  <button
                                    onClick={() => {
                                      setVendorRfqFiles(prev => prev.filter((_, i) => i !== fileIndex));
                                      setSelectedVendorFiles(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(fileIndex);
                                        // Adjust indices for remaining files
                                        const adjustedSet = new Set<number>();
                                        newSet.forEach(i => {
                                          if (i > fileIndex) {
                                            adjustedSet.add(i - 1);
                                          } else {
                                            adjustedSet.add(i);
                                          }
                                        });
                                        return adjustedSet;
                                      });
                                      setVisibleVendorFiles(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(fileIndex);
                                        // Adjust indices for remaining files
                                        const adjustedSet = new Set<number>();
                                        newSet.forEach(i => {
                                          if (i > fileIndex) {
                                            adjustedSet.add(i - 1);
                                          } else {
                                            adjustedSet.add(i);
                                          }
                                        });
                                        return adjustedSet;
                                      });
                                    }}
                                    className="h-6 w-6 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#F3F4F6' }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                      <path d="M18 6L6 18M6 6l12 12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                  </button>
                                </div>
                                <div className="flex flex-col items-center text-center pt-2">
                                  <div className="h-12 w-12 rounded-md flex items-center justify-center mb-3" style={{ backgroundColor: '#F3F4F6' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                      <path fill="#5332FF" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 7V3.5L19.5 9z"></path>
                                    </svg>
                                  </div>
                                  <p className="text-sm font-medium mb-1 truncate w-full" style={{ color: '#0B0B0C' }}>{file.name}</p>
                                  <p className="text-xs" style={{ color: '#6B7280' }}>{formatBytes(file.size)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Compare Button */}
                      <div className="mt-6 flex items-center justify-end">
                        <button
                          disabled={visibleVendorFiles.size < 2 || isVendorComparing}
                          className="px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                          style={{ backgroundColor: '#5332FF', color: '#FFFFFF' }}
                          onClick={async () => {
                            const visibleFilesArray = Array.from(visibleVendorFiles);
                            if (visibleFilesArray.length < 2) return;
                            try {
                              setIsVendorComparing(true);
                              const selectedFiles = visibleFilesArray
                                .sort((a, b) => a - b)
                                .map(idx => vendorRfqFiles[idx]);
                              
                              const form = new FormData();
                              selectedFiles.forEach((file) => {
                                form.append("files", file);
                              });

                              const res = await fetch("http://localhost:8000/compare-vendor", {
                                method: "POST",
                                body: form,
                              });

                              if (!res.ok) {
                                const text = await res.text();
                                throw new Error(text || `Request failed (${res.status})`);
                              }

                              const data = await res.json();
                              setVendorResult(data);
                            } catch (err) {
                              console.error("Error comparing vendor RFQs:", err);
                              alert(err instanceof Error ? err.message : "Failed to compare vendor RFQs");
                            } finally {
                              setIsVendorComparing(false);
                            }
                          }}
                        >
                          Compare
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
            {/* Card 3: Vendor Comparison Results */}
            {isVendorComparing && (
              <div className="rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <TailSpinner size={36} />
                  <span className="text-sm" style={{ color: '#6B7280' }}>Comparing vendor RFQs…</span>
                </div>
              </div>
            )}

            {vendorResult && !isVendorComparing && (
              <div className="rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                    <div className="px-6 py-6">
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#0B0B0C' }}>
                        Vendor Comparison Results
                      </h3>
                      
                      {vendorResult.comparison && vendorResult.vendors && vendorResult.vendors.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-base font-semibold mb-3" style={{ color: '#111827' }}>
                            <span className="blink-emoji">✨</span> AI Summary
                          </h4>
                          <div className="rounded-lg overflow-hidden shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                            <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                              <thead>
                                <tr style={{ backgroundColor: '#F9FAFB' }}>
                                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#111827', borderBottom: '1px solid #E5E7EB' }}>Vendor</th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#111827', borderBottom: '1px solid #E5E7EB' }}>Price</th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#111827', borderBottom: '1px solid #E5E7EB' }}>Warranty</th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#111827', borderBottom: '1px solid #E5E7EB' }}>Delivery (Days)</th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#111827', borderBottom: '1px solid #E5E7EB' }}>Recommendation</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  // Find the recommended vendor name from the recommendation text
                                  // The recommended vendor is the one that appears earliest in the recommendation text
                                  const recommendation = vendorResult.comparison?.overall_recommendation || '';
                                  let recommendedVendorName = '';
                                  let earliestIndex = Infinity;
                                  
                                  if (recommendation) {
                                    const recLower = recommendation.toLowerCase();
                                    // Find the vendor name that appears earliest in the recommendation
                                    for (const vendor of vendorResult.vendors) {
                                      const vendorName = vendor.vendor_name?.toLowerCase() || '';
                                      if (vendorName && recLower.includes(vendorName)) {
                                        const index = recLower.indexOf(vendorName);
                                        // Keep the vendor that appears earliest (lowest index)
                                        if (index < earliestIndex) {
                                          earliestIndex = index;
                                          recommendedVendorName = vendorName;
                                        }
                                      }
                                    }
                                  }
                                  
                                  return vendorResult.vendors.map((vendor, idx) => {
                                    const delivery = vendor.delivery;
                                    const deliveryDays = delivery?.initial_days || delivery?.subsequent_days || delivery?.emergency_days || null;
                                    const deliveryStr = deliveryDays ? `${deliveryDays}` : '—';
                                    
                                    // Check if this vendor is the recommended one
                                    const vendorName = vendor.vendor_name?.toLowerCase() || '';
                                    const isRecommended = vendorName === recommendedVendorName && recommendedVendorName !== '';

                                  return (
                                    <tr 
                                      key={idx} 
                                      className="transition-colors duration-150"
                                      style={{ 
                                        backgroundColor: isRecommended ? '#ECFDF5' : '#FFFFFF',
                                        borderBottom: idx < vendorResult.vendors.length - 1 ? '1px solid #E5E7EB' : 'none'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isRecommended) {
                                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                                          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #E5E7EB';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isRecommended) {
                                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                                          e.currentTarget.style.boxShadow = 'none';
                                        }
                                      }}
                                    >
                                      <td className="px-4 py-2 text-xs font-medium" style={{ color: '#111827' }}>
                                        {vendor.vendor_name || '—'}
                                      </td>
                                      <td className="px-4 py-2 text-xs" style={{ color: '#111827' }}>
                                        {vendor.pricing?.unit_price_inr ? (
                                          <span className="font-medium" style={{ color: '#1F2937' }}>
                                            ₹{vendor.pricing.unit_price_inr.toLocaleString('en-IN')}
                                          </span>
                                        ) : (
                                          <span style={{ color: '#111827' }}>—</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-xs" style={{ color: '#111827' }}>
                                        {vendor.warranty || <span style={{ color: '#111827' }}>—</span>}
                                      </td>
                                      <td className="px-4 py-2 text-xs" style={{ color: '#111827' }}>
                                        {deliveryStr !== '—' ? (
                                          <span className="font-medium" style={{ color: '#1F2937' }}>{deliveryStr}</span>
                                        ) : (
                                          <span style={{ color: '#111827' }}>—</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-xs">
                                        {isRecommended ? (
                                          <span 
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                            style={{ 
                                              backgroundColor: '#D1FAE5',
                                              color: '#059669'
                                            }}
                                          >
                                            <span className="mr-1" style={{ fontSize: '12px' }}>✓</span>
                                            Recommended
                                          </span>
                                        ) : (
                                          <span style={{ color: '#111827' }}>—</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                              </tbody>
                            </table>
                            </div>
                            {vendorResult.comparison?.overall_recommendation && (
                              <div className="px-4 py-3 border-t" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}>
                                <div className="text-xs">
                                  <span className="font-medium" style={{ color: '#111827' }}>Recommendation: </span>
                                  <span className="font-semibold" style={{ color: '#111827' }}>
                                    {vendorResult.comparison.overall_recommendation}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {vendorResult.vendors && vendorResult.vendors.length > 0 && (
                        <div className="w-full rounded-lg overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
                          <table className="w-full border-collapse text-xs">
                            <thead style={{ backgroundColor: '#F3F4F6' }}>
                              <tr>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Vendor</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Certification</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Unit Price (INR)</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Extended Price</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Quantity Discount</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Shipping Terms</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Delivery (Days)</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Warranty</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Product Type</th>
                                <th className="text-left px-4 py-2 font-semibold" style={{ color: '#111827' }}>Part Number</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vendorResult.vendors.map((vendor, idx) => {
                                const delivery = vendor.delivery;
                                const deliveryStr = delivery ? [
                                  delivery.initial_days ? `${delivery.initial_days}` : '',
                                  delivery.subsequent_days ? `${delivery.subsequent_days}` : '',
                                  delivery.emergency_days ? `${delivery.emergency_days}` : ''
                                ].filter(Boolean).join(' / ') : '—';

                                return (
                                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFBFD' }}>
                                    <td className="px-4 py-2 font-medium" style={{ color: '#111827' }}>
                                      {vendor.vendor_name || '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.certification_level || '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.pricing?.unit_price_inr ? `₹${vendor.pricing.unit_price_inr}` : '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.pricing?.extended_price ? `₹${vendor.pricing.extended_price}` : '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.pricing?.quantity_discount || '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.pricing?.shipping_terms || '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {deliveryStr || '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.warranty || '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.technical?.product_type || '—'}
                                    </td>
                                    <td className="px-4 py-2" style={{ color: '#111827' }}>
                                      {vendor.technical?.part_number || '—'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Technical Details Section */}
                      {vendorResult.vendors && vendorResult.vendors.some(v => v.technical?.dimensions || v.technical?.specifications) && (() => {
                        // Collect all technical details across vendors
                        const allTechnicalData: Array<{
                          vendor: string;
                          category: 'dimension' | 'specification';
                          key: string;
                          value: string;
                        }> = [];
                        
                        vendorResult.vendors.forEach((vendor, idx) => {
                          const vendorName = vendor.vendor_name || `Vendor ${idx + 1}`;
                          const dimensions = vendor.technical?.dimensions;
                          const specifications = vendor.technical?.specifications;
                          
                          // Parse dimensions
                          if (dimensions) {
                            let dimensionEntries: Array<[string, string]> = [];
                            if (typeof dimensions === 'object' && !Array.isArray(dimensions)) {
                              dimensionEntries = Object.entries(dimensions).map(([k, v]) => [k, String(v || '—')]);
                            } else if (typeof dimensions === 'string') {
                              try {
                                const parsed = JSON.parse(dimensions);
                                if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                                  dimensionEntries = Object.entries(parsed).map(([k, v]) => [k, String(v || '—')]);
                                }
                              } catch {
                                dimensionEntries = [['Dimensions', dimensions]];
                              }
                            }
                            dimensionEntries.forEach(([key, value]) => {
                              allTechnicalData.push({ vendor: vendorName, category: 'dimension', key, value });
                            });
                          }
                          
                          // Parse specifications
                          if (specifications) {
                            let specEntries: Array<[string, string]> = [];
                            if (typeof specifications === 'object' && !Array.isArray(specifications)) {
                              specEntries = Object.entries(specifications).map(([k, v]) => [k, String(v || '—')]);
                            } else if (typeof specifications === 'string') {
                              try {
                                const parsed = JSON.parse(specifications);
                                if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                                  specEntries = Object.entries(parsed).map(([k, v]) => [k, String(v || '—')]);
                                }
                              } catch {
                                specEntries = [['Specifications', specifications]];
                              }
                            }
                            specEntries.forEach(([key, value]) => {
                              allTechnicalData.push({ vendor: vendorName, category: 'specification', key, value });
                            });
                          }
                        });
                        
                        // Group by parameter key to show all vendors for each parameter
                        const parameterMap = new Map<string, Map<string, string>>();
                        const parameterCategories = new Map<string, 'dimension' | 'specification'>();
                        
                        allTechnicalData.forEach(({ vendor, category, key, value }) => {
                          if (!parameterMap.has(key)) {
                            parameterMap.set(key, new Map());
                            parameterCategories.set(key, category);
                          }
                          parameterMap.get(key)!.set(vendor, value);
                        });
                        
                        // Get unique vendors list
                        const uniqueVendors = Array.from(new Set(vendorResult.vendors.map((v, idx) => v.vendor_name || `Vendor ${idx + 1}`)));
                        
                        // Separate dimensions and specifications
                        const dimensionParams = Array.from(parameterMap.entries())
                          .filter(([key]) => parameterCategories.get(key) === 'dimension')
                          .map(([key, vendorMap]) => ({ key, vendorMap }));
                        const specParams = Array.from(parameterMap.entries())
                          .filter(([key]) => parameterCategories.get(key) === 'specification')
                          .map(([key, vendorMap]) => ({ key, vendorMap }));
                        
                        return (
                          <div className="mt-6">
                            <h4 className="text-base font-semibold mb-4" style={{ color: '#0B0B0C' }}>
                              Technical Details
                            </h4>
                            <div className="w-full rounded-lg overflow-hidden border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                              <table className="w-full border-collapse text-xs">
                                <thead>
                                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                                    <th className="px-4 py-3 text-left font-semibold" style={{ color: '#111827', width: '200px' }}>
                                      Parameter
                                    </th>
                                    {uniqueVendors.map((vendor, idx) => (
                                      <th key={idx} className="px-4 py-3 text-left font-semibold" style={{ color: '#111827' }}>
                                        {vendor}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {dimensionParams.length > 0 && (
                                    <>
                                      <tr style={{ backgroundColor: '#e7f8ed' }}>
                                        <td colSpan={uniqueVendors.length + 1} className="px-4 py-2 font-semibold" style={{ color: '#0B0B0C' }}>
                                          Dimensions
                                        </td>
                                      </tr>
                                      {dimensionParams.map(({ key, vendorMap }, paramIdx) => (
                                        <tr key={key} style={{ backgroundColor: paramIdx % 2 === 0 ? '#FFFFFF' : '#FBFBFD' }}>
                                          <td className="px-4 py-2 font-medium" style={{ color: '#374151' }}>
                                            {key}
                                          </td>
                                          {uniqueVendors.map((vendor, vendorIdx) => (
                                            <td key={vendorIdx} className="px-4 py-2" style={{ color: '#111827' }}>
                                              {vendorMap.get(vendor) || '—'}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </>
                                  )}
                                  {specParams.length > 0 && (
                                    <>
                                      <tr style={{ backgroundColor: '#e7f8ed' }}>
                                        <td colSpan={uniqueVendors.length + 1} className="px-4 py-2 font-semibold" style={{ color: '#0B0B0C' }}>
                                          Specifications
                                        </td>
                                      </tr>
                                      {specParams.map(({ key, vendorMap }, paramIdx) => (
                                        <tr key={key} style={{ backgroundColor: paramIdx % 2 === 0 ? '#FFFFFF' : '#FBFBFD' }}>
                                          <td className="px-4 py-2 font-medium" style={{ color: '#374151' }}>
                                            {key}
                                          </td>
                                          {uniqueVendors.map((vendor, vendorIdx) => (
                                            <td key={vendorIdx} className="px-4 py-2" style={{ color: '#111827' }}>
                                              {vendorMap.get(vendor) || '—'}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
          </div>
        </section>
      )}

      {activeTab === "welding" && (isImporting || analysisTable) && (
        <section className="w-full flex justify-center pb-8 px-6">
          <div className="w-full max-w-[1200px] rounded-lg mt-2" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', minHeight: 150 }}>
            <div className={`px-6 py-5 ${isImporting ? 'flex items-center justify-center' : ''}`}>
              <div className={`${isImporting ? 'mb-0' : 'mb-3'}`}>
                {isImporting ? (
                  <div className="w-full flex flex-col items-center justify-center gap-3 text-center">
                    <TailSpinner size={40} />
                    <span className="text-base" style={{ color: '#6B7280' }}>Analyzing CAD file…</span>
                  </div>
                ) : (
                  <h3 className="text-lg font-semibold" style={{ color: '#0B0B0C' }}>
                    <span className="blink-emoji">✨</span> CAD Analysis Result
                  </h3>
                )}
              </div>
              {/* Loading card removed per request */}
              {analysisTable && analysisTable.length > 0 && (
                <div className="w-full overflow-auto border rounded-lg" style={{ borderColor: '#E5E7EB', maxHeight: 420 }}>
                  <table className="w-full border-collapse">
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F9FAFB', zIndex: 1 }}>
                      <tr>
                        {Object.keys(analysisTable[0]).map((col) => (
                          <th key={col} className="text-left text-xs font-semibold px-4 py-2" style={{ color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysisTable.map((row, idx) => (
                        <tr key={idx} className="odd:bg-white even:bg-[#FBFBFD]">
                          {Object.keys(analysisTable[0]).map((col) => (
                            <td key={col} className="text-sm px-4 py-2" style={{ color: '#111827', borderBottom: '1px solid #F3F4F6' }}>
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!isImporting && (!analysisTable || analysisTable.length === 0) && (
                <p className="text-sm" style={{ color: '#9AA0A6' }}>No results to display yet.</p>
              )}
            </div>
          </div>
        </section>
      )}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="relative rounded-lg shadow-xl max-w-[90vw] max-h-[85vh] w-full" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
              <p className="text-sm font-medium" style={{ color: '#0B0B0C' }}>
                Preview — {file?.name}
              </p>
              <button
                onClick={closePreview}
                className="px-3 py-1 rounded-md text-sm font-semibold"
                style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
              >
                Close
              </button>
            </div>
            <div className="p-4">
              {previewKind === "image" && previewUrl && (
                <img src={previewUrl} alt="preview" className="block mx-auto" style={{ maxWidth: '86vw', maxHeight: '72vh' }} />
              )}
              {previewKind === "pdf" && previewUrl && (
                <iframe src={previewUrl} title="PDF preview" className="w-[86vw]" style={{ height: '72vh' }} />
              )}
              {previewKind === "other" && (
                <div className="text-center" style={{ color: '#6B7280' }}>
                  <p className="mb-4">Preview not available for this file type.</p>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      download={file?.name}
                      className="px-4 py-2 rounded-md text-sm font-semibold"
                      style={{ backgroundColor: '#5332FF', color: '#FFFFFF' }}
                    >
                      Download
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
"use client";
import { useState } from "react";
import { TailSpinner } from "@/components/TailSpinner";
import { renderFileIcon } from "@/components/FileIcon";
import { PreviewModal } from "@/components/PreviewModal";
import { formatBytes } from "@/utils/formatBytes";
import { Header } from "@/components/Header";

export default function WeldingAnalyzerPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"image" | "pdf" | "other">("other");
  const [analysisResult, setAnalysisResult] = useState<{
    table: Array<Record<string, string>>;
    message?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);

  // Determine current step for progress indicator
  const getCurrentStep = () => {
    if (analysisResult) return 3;
    if (isAnalyzing || file) return 2;
    return 1;
  };
  const currentStep = getCurrentStep();

  const onBrowseClick = () => {
    const input = document.getElementById("file-input") as HTMLInputElement | null;
    input?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const picked = files[0];
    setFile(picked);
    setAnalysisResult(null);
    setErrorMessage(null);
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

  const handleReset = () => {
    if (abortCtrl) {
      try {
        abortCtrl.abort();
      } catch {}
      setAbortCtrl(null);
    }
    setIsAnalyzing(false);
    setFile(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!file || isAnalyzing) return;
    
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setAnalysisResult(null);
      
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
        throw new Error(text || `Analysis failed (${res.status})`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data?.table)) {
        setAnalysisResult({
          table: data.table.map((row: any) => {
            const clean: Record<string, string> = {};
            Object.keys(row || {}).forEach((k) => {
              clean[k] = String(row[k] ?? "");
            });
            return clean;
          }),
          message: data?.message || "Analysis completed successfully.",
        });
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setErrorMessage("Analysis cancelled.");
      } else {
        setErrorMessage(
          err?.message || "Failed to analyze welding specifications. Please try again."
        );
      }
    } finally {
      setAbortCtrl(null);
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen w-full font-sans relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <Header />
      
      <div className="pt-28 pb-8 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Welding Specification Analyzer</h1>
              <p className="text-sm text-gray-600">Analyze CAD drawings and welding diagrams for compliance and quality inspection</p>
            </div>
            {analysisResult && !isAnalyzing && (
              <button
                onClick={handleReset}
                className="px-5 py-2.5 text-base text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Start New Analysis
              </button>
            )}
          </div>

          {/* Upload Wizard Section - Show when no results */}
          {!analysisResult && (
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
                    <span className="font-medium">Upload Drawing</span>
                  </div>
                  <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-[#5332FF]' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-[#5332FF]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= 2 ? 'bg-[#5332FF] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      2
                    </div>
                    <span className="font-medium">Analyze Specifications</span>
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

              {/* Step 1: Upload */}
              {!file && !isAnalyzing && (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    isDragging ? 'border-[#5332FF] bg-[#5332FF]/5' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#5332FF]/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#5332FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Welding Drawing</h3>
                    <p className="text-sm text-gray-600 mb-6">Drop your CAD file or welding diagram here, or browse to get started</p>
                    <button
                      onClick={onBrowseClick}
                      className="px-6 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors"
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
                    <p className="text-sm text-gray-500 mt-4">Supports: PNG, JPG, JPEG, WEBP, PDF</p>
                  </div>
                </div>
              )}

              {/* Step 2: File Preview & Analyze */}
              {file && !analysisResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Selected Drawing</h3>
                    <button
                      onClick={() => {
                        setFile(null);
                        setAnalysisResult(null);
                        setErrorMessage(null);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3">
                    {renderFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:underline" 
                        onClick={openPreview}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatBytes(file.size)}</p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <p className="text-sm font-medium" style={{ color: '#DC2626' }}>
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze Welding Specifications
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <TailSpinner size={48} />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Welding Specifications</h3>
                      <p className="text-gray-600">Extracting dimensions, specifications, and compliance metrics from your drawing...</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="mt-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                      style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
                    >
                      Cancel Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {analysisResult && !isAnalyzing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  <span className="blink-emoji">✨</span> Welding Specification Analysis
                </h2>
                {analysisResult.message && (
                  <p className="text-sm text-gray-600">{analysisResult.message}</p>
                )}
              </div>

              {analysisResult.table && analysisResult.table.length > 0 ? (
                <div className="w-full overflow-auto border rounded-lg" style={{ borderColor: '#E5E7EB', maxHeight: '600px' }}>
                  <table className="w-full border-collapse text-sm">
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F9FAFB', zIndex: 1 }}>
                      <tr>
                        {Object.keys(analysisResult.table[0]).map((col) => (
                          <th 
                            key={col} 
                            className="text-left text-xs font-semibold px-4 py-3 uppercase tracking-wide" 
                            style={{ color: '#6B7280', borderBottom: '2px solid #E5E7EB' }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.table.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className="hover:bg-gray-50 transition-colors"
                          style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFBFD' }}
                        >
                          {Object.keys(analysisResult.table[0]).map((col) => (
                            <td 
                              key={col} 
                              className="text-sm px-4 py-3" 
                              style={{ color: '#111827', borderBottom: '1px solid #F3F4F6' }}
                            >
                              {row[col] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-gray-500">No analysis data available</p>
                  <p className="text-xs mt-1 text-gray-400">The analysis completed but no structured data was found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        previewUrl={previewUrl}
        previewKind={previewKind}
        fileName={file?.name || null}
      />
    </main>
  );
}

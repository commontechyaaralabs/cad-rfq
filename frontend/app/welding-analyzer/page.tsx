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
  const [progress, setProgress] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"image" | "pdf" | "other">("other");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [analysisTable, setAnalysisTable] = useState<Array<Record<string, string>> | null>(null);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);

  const onBrowseClick = () => {
    const input = document.getElementById("file-input") as HTMLInputElement | null;
    input?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const picked = files[0];
    setFile(picked);
    setProgress(0);
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

  const onCancel = () => {
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

  return (
    <main className="min-h-screen w-full font-sans relative overflow-hidden" style={{ backgroundColor: '#010101' }}>
      <Header />
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
                  {renderFileIcon(file)}
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

      {(isImporting || analysisTable) && (
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


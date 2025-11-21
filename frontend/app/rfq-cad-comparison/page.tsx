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

  return (
    <main className="min-h-screen w-full font-sans relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <Header />
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
                    onClick={() => handleOpenPreview(rfqFile, "rfq")}
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
                    onClick={() => handleOpenPreview(cadFile, "cad")}
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
          {/* RIGHT CARD - AI Summary */}
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
                      helper: matchedCount > 0 ? 'Dimensions that align across RFQ and CAD.' : 'No matches identified yet.',
                      metricNames: matchedNames,
                    },
                    {
                      key: 'mismatched',
                      label: 'Mismatched',
                      value: mismatchesCount,
                      colorBg: '#FDECEC',
                      colorText: '#B91C1C',
                      barColor: '#EF4444',
                      helper: mismatchesCount > 0 ? 'Review conflicting dimensions before approving.' : 'No mismatches identified.',
                      metricNames: mismatchedNames,
                    },
                    {
                      key: 'missing',
                      label: 'Missing',
                      value: missingCount,
                      colorBg: '#FEF3C7',
                      colorText: '#92400E',
                      barColor: '#F59E0B',
                      helper: missingCount > 0 ? 'Dimensions specified in the RFQ but absent on the CAD drawing.' : 'No missing metrics.',
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
                            {row.value > 0 && total > 0 && (
                              <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: row.barColor }}
                                />
                              </div>
                            )}
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

      {showCompareDetails && compareResult && (
        <section className="w-full flex justify-center pb-8 px-6">
          <div className="w-full max-w-[1400px]">
            <div className="flex mb-2 px-1">
              <button
                onClick={() => setCompareSubTab("summary")}
                className="mr-6 pb-2 text-sm font-semibold"
                style={{
                  color: compareSubTab === "summary" ? '#0B0B0C' : '#9CA3AF',
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
                  color: compareSubTab === "auto" ? '#0B0B0C' : '#9CA3AF',
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
                </>
              )}

              {compareSubTab === "auto" && (
                <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                  <div className="px-6 py-6 space-y-6">
                    {compareResult?.annotated_image ? (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold" style={{ color: '#0B0B0C' }}>
                            <span className="blink-emoji">✨</span> CAD Smart Annotation
                          </h3>
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


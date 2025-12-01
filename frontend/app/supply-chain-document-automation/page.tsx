"use client";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { IntakeStage } from "@/components/supply-chain/IntakeStage";
import { ParsingStage } from "@/components/supply-chain/ParsingStage";
import { ReviewStage } from "@/components/supply-chain/ReviewStage";
import { MatchingStage } from "@/components/supply-chain/MatchingStage";
import { DocumentDetailDrawer } from "@/components/supply-chain/DocumentDetailDrawer";
import { Pipeline } from "@/components/supply-chain/Pipeline";
import {
  uploadDocuments,
  getAllDocuments,
  getDocumentStatus,
  pollDocumentStatus,
  approveDocument,
  rejectDocument,
  type DocumentStatus as APIDocumentStatus,
} from "@/utils/supplyChainApi";

// Types
type DocumentType = "PO" | "BoL" | "GRN" | "Packing List" | "Invoice" | "QC Cert";
type DocumentStatus = "Processed" | "In Review" | "Exception";
type MatchStatus = "Matched" | "Partial" | "Failed";
type Severity = "High" | "Medium" | "Low";
type Mode = "upload" | "wizard" | "dashboard";

export interface Document {
  id: string;
  type: DocumentType;
  supplier: string;
  status: DocumentStatus;
  matchStatus: MatchStatus;
  confidence: number;
  lastUpdated: string;
  orderValue?: number; // Business value
  issueDescription?: string; // Business context
  financialImpact?: number; // Money at risk
}

interface Exception {
  id: string;
  title: string;
  documentIds: string[];
  severity: Severity;
  assignedTo: string;
  financialImpact?: number; // Money at risk
  supplierName?: string; // Business context
}

// Convert API document status to UI document format
const convertAPIDocumentToUI = (apiDoc: APIDocumentStatus): Document => {
  const extracted = apiDoc.extracted_data;
  const statusMap: Record<string, DocumentStatus> = {
    "completed": "Processed",
    "approved": "Processed",
    "review": "In Review",
    "matching": "In Review",
    "rejected": "Exception",
    "error": "Exception",
  };
  
  return {
    id: apiDoc.id,
    type: (extracted?.document_type as DocumentType) || "PO",
    supplier: extracted?.supplier || "Unknown",
    status: statusMap[apiDoc.status] || "In Review",
    matchStatus: apiDoc.status === "completed" ? "Matched" : apiDoc.status === "error" ? "Failed" : "Partial",
    confidence: extracted?.confidence === "high" ? 95 : extracted?.confidence === "medium" ? 75 : 50,
    lastUpdated: apiDoc.updated_at || apiDoc.created_at,
    orderValue: extracted?.total_amount ? extracted.total_amount * 100000 : undefined,
    issueDescription: apiDoc.error || (apiDoc.status === "completed" ? "Verified and ready for payment" : "Processing..."),
    financialImpact: apiDoc.status === "error" ? 1000 : undefined,
  };
};

const pipelineStages = [
  { id: 1, name: "Upload Documents", description: "Upload" },
  { id: 2, name: "AI Parsing & Normalization", description: "Extract & structure data" },
  { id: 3, name: "Confidence & Human Review", description: "Quality check" },
  { id: 4, name: "PO–BoL–GRN–Invoice Matching", description: "Cross-reference documents" },
];

export default function SupplyChainDocumentAutomationPage() {
  // State Machine
  const [mode, setMode] = useState<Mode>("upload");
  const [activeStage, setActiveStage] = useState<number>(1);
  const [showTechnicalView, setShowTechnicalView] = useState(false);
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());
  
  // Dashboard state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [apiDocuments, setApiDocuments] = useState<APIDocumentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocTypes, setSelectedDocTypes] = useState<DocumentType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | "">("");
  const [selectedMatchStatus, setSelectedMatchStatus] = useState<MatchStatus | "">("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Dropdown state
  const [isDocTypeDropdownOpen, setIsDocTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMatchStatusDropdownOpen, setIsMatchStatusDropdownOpen] = useState(false);

  const docTypeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const matchStatusDropdownRef = useRef<HTMLDivElement>(null);

  const documentTypes: DocumentType[] = ["PO", "BoL", "GRN", "Packing List", "Invoice", "QC Cert"];
  const statuses: DocumentStatus[] = ["Processed", "In Review", "Exception"];
  const matchStatuses: MatchStatus[] = ["Matched", "Partial", "Failed"];

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (docTypeDropdownRef.current && !docTypeDropdownRef.current.contains(event.target as Node)) {
        setIsDocTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (matchStatusDropdownRef.current && !matchStatusDropdownRef.current.contains(event.target as Node)) {
        setIsMatchStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load documents from API
  useEffect(() => {
    loadDocuments();
    // Set up polling for real-time updates (only if we have documents or are in dashboard mode)
    const interval = setInterval(() => {
      if (mode === "dashboard" || documents.length > 0) {
        loadDocuments();
      }
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [mode, documents.length]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await getAllDocuments();
      setApiDocuments(response.documents); // Store raw API documents
      const uiDocuments = response.documents.map(convertAPIDocumentToUI);
      setDocuments(uiDocuments);
    } catch (error) {
      console.error("Failed to load documents:", error);
      // Don't show error to user, just log it - API might not be available yet
      // Set empty array as fallback
      setDocuments([]);
      setApiDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDocType = selectedDocTypes.length === 0 || selectedDocTypes.includes(doc.type);
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesMatchStatus = !selectedMatchStatus || doc.matchStatus === selectedMatchStatus;
    return matchesSearch && matchesDocType && matchesStatus && matchesMatchStatus;
  });

  const activeFiltersCount = selectedDocTypes.length + (selectedStatus ? 1 : 0) + (selectedMatchStatus ? 1 : 0);

  // Business metrics calculations
  const totalValueProcessed = documents
    .filter(doc => doc.status === "Processed")
    .reduce((sum, doc) => sum + (doc.orderValue || 0), 0);
  
  const totalValueAtRisk = documents
    .filter(doc => doc.financialImpact && doc.financialImpact > 0)
    .reduce((sum, doc) => sum + (doc.financialImpact || 0), 0);

  const needsAttentionCount = documents.filter(doc => 
    doc.status === "In Review" || doc.status === "Exception"
  ).length;

  const autoApprovedCount = documents.filter(doc => 
    doc.status === "Processed" && doc.matchStatus === "Matched"
  ).length;

  const autoApprovedRate = documents.length > 0 ? ((autoApprovedCount / documents.length) * 100).toFixed(0) : "0";

  // Handle view details - sync with pipeline
  const handleViewDetails = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDrawerOpen(true);
    if (doc.status === "Processed") {
      setActiveStage(4);
    } else if (doc.status === "In Review") {
      setActiveStage(3);
    } else {
      setActiveStage(4);
    }
  };

  // Color helpers
  const getStatusColor = (status: DocumentStatus) => {
    if (status === "Processed") return "bg-green-100 text-green-800";
    if (status === "In Review") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  const getMatchStatusColor = (matchStatus: MatchStatus) => {
    if (matchStatus === "Matched") return "bg-green-100 text-green-800";
    if (matchStatus === "Partial") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  const getSeverityColor = (severity: Severity) => {
    if (severity === "High") return "bg-red-100 text-red-800";
    if (severity === "Medium") return "bg-amber-100 text-amber-800";
    return "bg-blue-100 text-blue-800";
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
      return isPdf || isDocx;
    });
    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Store uploaded document IDs for step-by-step processing
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState<string[]>([]);
  const [isProcessingStage, setIsProcessingStage] = useState(false);
  const [processedStages, setProcessedStages] = useState<Set<number>>(new Set());

  // State machine transitions
  const handleProcessDocuments = async () => {
    if (uploadedFiles.length === 0) return;
    
    try {
      setIsUploading(true);
      const response = await uploadDocuments(uploadedFiles);
      
      // Store document IDs for step-by-step processing
      setUploadedDocumentIds(response.document_ids);
      
      // Stage 1 (Intake) is complete when files are uploaded
      // Move to wizard mode and stage 2, but don't process yet
      setMode("wizard");
      setActiveStage(2);
      
      // Clear uploaded files (they're now being processed)
      setUploadedFiles([]);
    } catch (error) {
      console.error("Failed to upload documents:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Process current stage (step-by-step)
  const handleProcessCurrentStage = async () => {
    if (uploadedDocumentIds.length === 0) return;
    
    setIsProcessingStage(true);
    
    try {
      // Poll all documents until current stage completes
      const stagePromises = uploadedDocumentIds.map(docId => 
        pollDocumentStatus(
          docId,
          (status) => {
            // Update document in state
            const uiDoc = convertAPIDocumentToUI(status);
            setApiDocuments(prev => {
              const index = prev.findIndex(d => d.id === docId);
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = status;
                return updated;
              }
              return [...prev, status];
            });
            setDocuments(prev => {
              const index = prev.findIndex(d => d.id === docId);
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = uiDoc;
                return updated;
              }
              return [...prev, uiDoc];
            });
          },
          2000, // Poll every 2 seconds
          120 // Max 4 minutes
        )
      );
      
      await Promise.all(stagePromises);
      
      // Mark current stage as processed
      setProcessedStages(prev => new Set(prev).add(activeStage));
    } catch (error) {
      console.error("Error processing stage:", error);
    } finally {
      setIsProcessingStage(false);
    }
  };

  const handleFinishWizard = () => {
    setMode("dashboard");
    setActiveStage(4);
  };

  const handleStartNewProcessing = () => {
    setMode("upload");
    setActiveStage(1);
    setUploadedFiles([]);
    setUploadedDocumentIds([]);
    setProcessedStages(new Set());
    setSearchQuery("");
    setSelectedDocTypes([]);
    setSelectedStatus("");
    setSelectedMatchStatus("");
  };

  // Stage navigation handlers - step by step
  const handleStageComplete = async (nextStage: number) => {
    // Process current stage before moving to next
    if (activeStage < 4) {
      await handleProcessCurrentStage();
    }
    
    if (nextStage <= 4) {
      setActiveStage(nextStage);
    } else {
      handleFinishWizard();
    }
  };

  return (
    <main className="min-h-screen w-full font-sans relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <Header />
      
      <section className="w-full flex justify-center pt-28 pb-8 px-6">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Business-Focused Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Supply Chain Document Automation</h1>
              <p className="text-sm text-gray-600 leading-relaxed">Automated verification and payment processing for your supply chain documents</p>
            </div>
            {mode === "dashboard" && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleStartNewProcessing}
                  className="px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  Start New Processing
                </button>
              </div>
            )}
          </div>

          {/* Process Flow Pipeline - Always visible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-4 flex-1">
              {/* Helper function to determine stage status */}
              {(() => {
                const getStageStatus = (stageId: number) => {
                  // Stage 1 (Intake) is completed if files are uploaded
                  if (stageId === 1 && uploadedFiles.length > 0) {
                    return "completed";
                  }
                  if (stageId < activeStage) return "completed";
                  if (stageId === activeStage) return "active";
                  return "pending";
                };

                return (
                  <>
                    {/* Stage 1: Upload Documents */}
                    <div className="contents">
                      <button className={`flex flex-col items-center gap-2 flex-shrink-0 min-w-0 transition-all ${
                        getStageStatus(1) === "completed" || getStageStatus(1) === "active" ? "text-[#5332FF]" : "text-gray-400"
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all ${
                          getStageStatus(1) === "completed" || getStageStatus(1) === "active" 
                            ? "bg-[#5332FF] text-white" 
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {getStageStatus(1) === "completed" ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            "1"
                          )}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className={`font-medium text-sm ${
                            getStageStatus(1) === "completed" || getStageStatus(1) === "active" ? "text-[#5332FF]" : "text-gray-400"
                          }`}>Upload Documents</span>
                        </div>
                      </button>
                      <div className={`h-1 flex-1 mt-5 transition-colors ${
                        getStageStatus(2) === "completed" || getStageStatus(2) === "active" ? "bg-[#5332FF]" : "bg-gray-200"
                      }`}></div>
                    </div>

                    {/* Stage 2: AI Parsing & Normalization */}
                    <div className="contents">
                      <button className={`flex flex-col items-center gap-2 flex-shrink-0 min-w-0 transition-all ${
                        getStageStatus(2) === "completed" || getStageStatus(2) === "active" ? "text-[#5332FF]" : "text-gray-400"
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all ${
                          getStageStatus(2) === "completed" || getStageStatus(2) === "active" 
                            ? "bg-[#5332FF] text-white" 
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {getStageStatus(2) === "completed" || getStageStatus(2) === "active" ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            "2"
                          )}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className={`font-medium text-sm ${
                            getStageStatus(2) === "completed" || getStageStatus(2) === "active" ? "text-[#5332FF]" : "text-gray-400"
                          }`}>AI Parsing & Normalization</span>
                        </div>
                      </button>
                      <div className={`h-1 flex-1 mt-5 transition-colors ${
                        getStageStatus(3) === "completed" || getStageStatus(3) === "active" ? "bg-[#5332FF]" : "bg-gray-200"
                      }`}></div>
                    </div>

                    {/* Stage 3: Confidence & Human Review */}
                    <div className="contents">
                      <button className={`flex flex-col items-center gap-2 flex-shrink-0 min-w-0 transition-all ${
                        getStageStatus(3) === "completed" || getStageStatus(3) === "active" ? "text-[#5332FF]" : "text-gray-400"
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all ${
                          getStageStatus(3) === "completed" || getStageStatus(3) === "active" 
                            ? "bg-[#5332FF] text-white" 
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {getStageStatus(3) === "completed" || getStageStatus(3) === "active" ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            "3"
                          )}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className={`font-medium text-sm ${
                            getStageStatus(3) === "completed" || getStageStatus(3) === "active" ? "text-[#5332FF]" : "text-gray-400"
                          }`}>Confidence & Human Review</span>
                        </div>
                      </button>
                      <div className={`h-1 flex-1 mt-5 transition-colors ${
                        getStageStatus(4) === "completed" || getStageStatus(4) === "active" ? "bg-[#5332FF]" : "bg-gray-200"
                      }`}></div>
                    </div>

                    {/* Stage 4: PO–BoL–GRN–Invoice Matching */}
                    <div className="contents">
                      <button className={`flex flex-col items-center gap-2 flex-shrink-0 min-w-0 transition-all ${
                        getStageStatus(4) === "completed" || getStageStatus(4) === "active" ? "text-[#5332FF]" : "text-gray-400"
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all ${
                          getStageStatus(4) === "completed" || getStageStatus(4) === "active" 
                            ? "bg-[#5332FF] text-white" 
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {getStageStatus(4) === "completed" || getStageStatus(4) === "active" ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            "4"
                          )}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <span className={`font-medium text-sm ${
                            getStageStatus(4) === "completed" || getStageStatus(4) === "active" ? "text-[#5332FF]" : "text-gray-400"
                          }`}>PO–BoL–GRN–Invoice Matching</span>
                        </div>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Mode-based Content */}
          {mode === "upload" && (
            <IntakeStage
              uploadedFiles={uploadedFiles}
              onFilesChange={setUploadedFiles}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onProcessDocuments={handleProcessDocuments}
              isUploading={isUploading}
              processingCount={processingDocuments.size}
            />
          )}

          {mode === "wizard" && (
            <div className="space-y-6">
              {activeStage === 1 && (
                <IntakeStage
                  uploadedFiles={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                  isDragging={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              )}
              {activeStage === 2 && (
                <ParsingStage
                  documentId={selectedDocument?.id}
                  onApprove={() => handleStageComplete(3)}
                  isProcessing={isProcessingStage}
                  onProcess={handleProcessCurrentStage}
                  isProcessed={processedStages.has(2)}
                  documents={apiDocuments.filter(doc => {
                    // Show documents that are in parsing stage or completed
                    return doc.stage >= 2 || doc.status === "parsing" || doc.status === "completed" || doc.status === "approved";
                  })}
                />
              )}
              {activeStage === 3 && (
                <ReviewStage
                  onApprove={() => handleStageComplete(4)}
                  isProcessing={isProcessingStage}
                  onProcess={handleProcessCurrentStage}
                  isProcessed={processedStages.has(3)}
                  documents={documents.filter(doc => doc.status === "In Review" || doc.status === "Exception")}
                />
              )}
              {activeStage === 4 && (
                <MatchingStage
                  onApprove={async () => {
                    if (!processedStages.has(4)) {
                      await handleProcessCurrentStage();
                    }
                    handleFinishWizard();
                  }}
                  isProcessing={isProcessingStage}
                  onProcess={handleProcessCurrentStage}
                  isProcessed={processedStages.has(4)}
                  documents={documents}
                />
              )}
            </div>
          )}

          {mode === "dashboard" && (
            <>
              {/* Today's Impact - Business Value Hero Section */}
              <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl border border-green-200/50 shadow-sm p-8">
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 border border-white/80">
                        <div className="text-sm font-medium text-gray-600 mb-2">Payments Approved</div>
                        <div className="text-4xl font-bold text-green-700 mb-2">₹{(totalValueProcessed / 10000000).toFixed(2)}Cr</div>
                        <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ready for payment processing
                        </div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 border border-white/80">
                        <div className="text-sm font-medium text-gray-600 mb-2">Issues Caught</div>
                        <div className="text-4xl font-bold text-red-700 mb-2">₹{(totalValueAtRisk / 100000).toFixed(0)}L</div>
                        <div className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Protected from overpayment
                        </div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 border border-white/80">
                        <div className="text-sm font-medium text-gray-600 mb-2">Time Saved</div>
                        <div className="text-4xl font-bold text-blue-700 mb-2">18 hrs</div>
                        <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          vs manual processing
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgent Attention Cards */}
              {needsAttentionCount > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {needsAttentionCount} {needsAttentionCount === 1 ? 'issue needs' : 'issues need'} your attention
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {totalValueAtRisk > 0 && `₹${(totalValueAtRisk / 100000).toFixed(0)}L in payments are blocked until resolved.`}
                        {totalValueAtRisk === 0 && 'Review required before payment approval.'}
                      </p>
                    </div>
                    <button className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
                      Review Now
                    </button>
                  </div>
                </div>
              )}

              {/* Business KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Auto-Approved Today</span>
                    <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">{autoApprovedCount}</span>
                    <span className="text-sm text-green-600 font-medium">({autoApprovedRate}% automated)</span>
                  </div>
                  <div className="text-xs text-gray-500">No action needed</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Payments Ready</span>
                    <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">₹{(totalValueProcessed / 100000).toFixed(0)}L</span>
                    <span className="text-sm text-green-600 font-medium">Verified</span>
                  </div>
                  <div className="text-xs text-gray-500">Ready for payment</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Issues Blocking Payment</span>
                    <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">{needsAttentionCount}</span>
                    <span className="text-sm text-red-600 font-medium">₹{(totalValueAtRisk / 100000).toFixed(0)}L at risk</span>
                  </div>
                  <div className="text-xs text-gray-500">Requires decision</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Processing Efficiency</span>
                    <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">42</span>
                    <span className="text-sm text-gray-600 font-medium">sec/order</span>
                  </div>
                  <div className="text-xs text-gray-500">23% faster than last month</div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Scenarios Table */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Search and Filters */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search by supplier or order..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5332FF] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div className="relative" ref={statusDropdownRef}>
                        <button
                          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 min-w-[140px] justify-between"
                        >
                          <span>Status</span>
                          <div className="flex items-center gap-1.5">
                            {selectedStatus && (
                              <span className="bg-[#5332FF] text-white text-xs px-2 py-0.5 rounded-full">1</span>
                            )}
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isStatusDropdownOpen && (
                          <div className="absolute z-10 mt-2 w-full min-w-[140px] bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                            <button
                              onClick={() => {
                                setSelectedStatus("");
                                setIsStatusDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                            >
                              All Statuses
                            </button>
                            {statuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setIsStatusDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Scenarios Table */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier & Order</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-5 py-4">
                                <div className="text-sm font-semibold text-gray-900 mb-0.5">{doc.supplier}</div>
                                <div className="text-xs text-gray-500">{doc.type} • {doc.id}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(doc.status)}`}>
                                  {doc.status === "Processed" ? "Ready" : doc.status === "In Review" ? "Review" : "Blocked"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="text-sm font-semibold text-gray-900">
                                  ₹{doc.orderValue ? (doc.orderValue / 100000).toFixed(1) + 'L' : 'N/A'}
                                </div>
                                {doc.financialImpact && doc.financialImpact > 0 && (
                                  <div className="text-xs text-red-600 font-medium mt-0.5">₹{(doc.financialImpact / 100000).toFixed(1)}L at risk</div>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-sm text-gray-700 max-w-xs">{doc.issueDescription || "No issues"}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleViewDetails(doc)}
                                    className="text-sm font-medium text-[#5332FF] hover:text-[#5332FF]/80 hover:underline transition-colors"
                                  >
                                    View Details
                                  </button>
                                  {doc.status === "In Review" && (
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                                      Make Decision
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Issues & Decisions Panel */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-semibold text-gray-900">Issues Requiring Decisions</h2>
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        {documents.filter(doc => doc.status === "Exception" || doc.status === "In Review").length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {documents
                        .filter(doc => doc.status === "Exception" || doc.status === "In Review")
                        .slice(0, 5)
                        .map((doc) => ({
                          id: doc.id,
                          title: doc.issueDescription || "Issue detected",
                          documentIds: [doc.id],
                          severity: doc.financialImpact && doc.financialImpact > 10000 ? "High" : doc.financialImpact && doc.financialImpact > 0 ? "Medium" : "Low" as Severity,
                          assignedTo: "System",
                          financialImpact: doc.financialImpact,
                          supplierName: doc.supplier,
                        }))
                        .map((exception) => (
                        <div key={exception.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 flex-1 pr-2">{exception.supplierName || exception.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getSeverityColor(exception.severity)}`}>
                              {exception.severity}
                            </span>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2 leading-relaxed">{exception.title}</p>
                            {exception.financialImpact && exception.financialImpact > 0 && (
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-semibold text-red-600">₹{(exception.financialImpact / 100000).toFixed(1)}L at risk</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">Assigned: <span className="font-medium text-gray-700">{exception.assignedTo}</span></span>
                            <button className="px-3 py-1.5 text-xs font-semibold text-[#5332FF] bg-[#5332FF]/10 rounded-lg hover:bg-[#5332FF]/20 transition-all duration-200">
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Enhanced Document Detail Drawer */}
      <DocumentDetailDrawer
        document={selectedDocument ? {
          id: selectedDocument.id,
          type: selectedDocument.type,
          supplier: selectedDocument.supplier,
          status: selectedDocument.status,
          matchStatus: selectedDocument.matchStatus,
          confidence: selectedDocument.confidence,
          lastUpdated: selectedDocument.lastUpdated,
          source: "Email / S3 Bucket",
        } : null}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </main>
  );
}

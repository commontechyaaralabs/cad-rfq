/**
 * Supply Chain Document Automation API Service
 * 
 * Handles all API calls for supply chain document processing
 */

import { getApiUrl } from "./api";

export interface DocumentStatus {
  id: string;
  filename: string;
  status: "uploaded" | "intake" | "parsing" | "review" | "matching" | "completed" | "approved" | "rejected" | "error";
  stage: number;
  progress: number;
  created_at: string;
  updated_at?: string;
  file_size: number;
  extracted_data?: {
    document_type: string;
    supplier: string;
    order_number?: string;
    order_date?: string;
    total_amount?: number;
    currency?: string;
    line_items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;
    confidence?: string;
  };
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  document_ids: string[];
  message: string;
}

export interface DocumentsResponse {
  success: boolean;
  documents: DocumentStatus[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Upload supply chain documents for processing
 */
export async function uploadDocuments(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const apiUrl = getApiUrl("supply-chain/upload");
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Handle 404 specifically
      if (response.status === 404) {
        throw new Error(
          `API endpoint not found. Please ensure the backend server is running at ${apiUrl}. ` +
          `If running locally, set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local`
        );
      }
      
      const error = await response.json().catch(() => ({ 
        detail: `Upload failed with status ${response.status}` 
      }));
      throw new Error(error.detail || `Failed to upload documents: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to API server at ${apiUrl}. ` +
        `Please ensure the backend is running. ` +
        `If running locally, check that the server is running on port 8000.`
      );
    }
    throw error;
  }
}

/**
 * Get real-time status of a document
 */
export async function getDocumentStatus(documentId: string): Promise<DocumentStatus> {
  const response = await fetch(getApiUrl(`supply-chain/status/${documentId}`));

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to get status" }));
    throw new Error(error.detail || "Failed to get document status");
  }

  return response.json();
}

/**
 * Get all documents with optional filtering
 */
export async function getAllDocuments(
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<DocumentsResponse> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  try {
    const response = await fetch(getApiUrl(`supply-chain/documents?${params.toString()}`));

    if (!response.ok) {
      // If 404, return empty list (endpoint might not exist or no documents yet)
      if (response.status === 404) {
        return {
          success: true,
          documents: [],
          total: 0,
          limit,
          offset,
        };
      }
      const error = await response.json().catch(() => ({ detail: "Failed to get documents" }));
      throw new Error(error.detail || `Failed to get documents: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Network error or other issues - return empty list
    console.warn("Error fetching documents, returning empty list:", error);
    return {
      success: true,
      documents: [],
      total: 0,
      limit,
      offset,
    };
  }
}

/**
 * Approve a document for payment processing
 */
export async function approveDocument(documentId: string): Promise<DocumentStatus> {
  const response = await fetch(getApiUrl(`supply-chain/approve/${documentId}`), {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to approve" }));
    throw new Error(error.detail || "Failed to approve document");
  }

  const result = await response.json();
  return result.document;
}

/**
 * Reject a document
 */
export async function rejectDocument(documentId: string, reason?: string): Promise<DocumentStatus> {
  const formData = new FormData();
  if (reason) formData.append("reason", reason);

  const response = await fetch(getApiUrl(`supply-chain/reject/${documentId}`), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to reject" }));
    throw new Error(error.detail || "Failed to reject document");
  }

  const result = await response.json();
  return result.document;
}

/**
 * Poll document status until completion or error
 */
export async function pollDocumentStatus(
  documentId: string,
  onUpdate: (status: DocumentStatus) => void,
  interval: number = 2000,
  maxAttempts: number = 60
): Promise<DocumentStatus> {
  let attempts = 0;

  const poll = async (): Promise<DocumentStatus> => {
    const status = await getDocumentStatus(documentId);
    onUpdate(status);

    if (status.status === "completed" || status.status === "error" || status.status === "approved" || status.status === "rejected") {
      return status;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Polling timeout: Document processing took too long");
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, interval));
    return poll();
  };

  return poll();
}


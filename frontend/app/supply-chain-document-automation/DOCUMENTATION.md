# Supply Chain Document Automation - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Pipeline Stages](#pipeline-stages)
4. [State Machine & Workflow](#state-machine--workflow)
5. [Backend API](#backend-api)
6. [Frontend Components](#frontend-components)
7. [Data Models](#data-models)
8. [Real-time Processing](#real-time-processing)
9. [User Flows](#user-flows)
10. [Features & Capabilities](#features--capabilities)
11. [Technical Implementation](#technical-implementation)

---

## Overview

The **Supply Chain Document Automation** module is an AI-powered document processing system that automates the verification, extraction, and matching of supply chain documents including Purchase Orders (PO), Bills of Lading (BoL), Goods Receipt Notes (GRN), Packing Lists, Invoices, and Quality Certificates (QC).

### Purpose
- Automate document intake from manual uploads
- Extract and normalize data using Google Gemini AI
- Validate document quality through confidence scoring
- Match related documents (PO ↔ BoL ↔ GRN ↔ Invoice)
- Provide a comprehensive dashboard for monitoring and exception handling
- Enable real-time document status tracking

### Key Capabilities
- **Manual Document Upload**: Drag-and-drop file upload interface
- **AI-Powered Extraction**: Automatic field extraction using Google Gemini AI with confidence scoring
- **Human-in-the-Loop Review**: Quality checks for low-confidence extractions
- **Intelligent Matching**: Cross-reference related documents to detect discrepancies
- **Real-time Status Updates**: Live polling of document processing status
- **Exception Management**: Track and resolve document mismatches and errors
- **Business-Focused UI**: Metrics and language tailored for business users

### Supported Document Types
- Purchase Orders (PO)
- Bills of Lading (BoL)
- Goods Receipt Notes (GRN)
- Packing Lists
- Invoices
- Quality Certificates (QC Cert)

### Supported File Formats
- PDF (`.pdf`)
- Microsoft Word (`.docx`)

---

## System Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Component Architecture**: Modular React components
- **API Communication**: Fetch API with polling mechanism

#### Backend
- **Framework**: FastAPI (Python)
- **AI Engine**: Google Gemini AI (via Vertex AI)
- **Storage**: In-memory dictionary (production should use Redis or database)
- **File Handling**: FastAPI UploadFile
- **Async Processing**: Python asyncio

### File Structure

```
frontend/
├── app/
│   └── supply-chain-document-automation/
│       ├── page.tsx                    # Main page component
│       └── DOCUMENTATION.md            # This file
├── components/
│   └── supply-chain/
│       ├── IntakeStage.tsx             # Stage 1: Document upload
│       ├── ParsingStage.tsx            # Stage 2: AI parsing
│       ├── ReviewStage.tsx              # Stage 3: Human review
│       ├── MatchingStage.tsx           # Stage 4: Document matching
│       ├── DocumentDetailDrawer.tsx    # Document detail modal
│       └── TailSpinner.tsx             # Loading spinner component
└── utils/
    └── supplyChainApi.ts               # API service layer

backend/
├── api.py                              # FastAPI application with all endpoints
└── (supply-chain endpoints)
```

### Design Patterns
- **State Machine Pattern**: Three distinct modes (upload, wizard, dashboard)
- **Component Composition**: Modular stage components with clear responsibilities
- **Callback Pattern**: Stage progression through callback functions
- **Controlled Components**: All inputs are controlled by React state
- **Polling Pattern**: Real-time status updates via polling mechanism
- **Async Processing**: Backend processes documents asynchronously

---

## Pipeline Stages

The system processes documents through a **4-stage pipeline**:

### Stage 1: Upload Documents
**Component**: `IntakeStage.tsx`

**Purpose**: Collect documents from users via manual upload

**Features**:
- Drag-and-drop file upload area
- Browse files button
- File type validation (PDF, DOCX)
- File size validation (20MB max)
- File list with remove functionality
- "Add Files" button to append more files
- "Clear All" button to remove all files
- "Process Documents" button (triggers transition to Wizard Mode)
- Real-time upload progress indication

**User Actions**:
1. Drag files or click "Browse Files"
2. Review uploaded file list
3. Optionally add more files or remove unwanted files
4. Click "Process Documents" to proceed

**Backend Processing**:
- Validates file types and sizes
- Generates unique document IDs (format: `DOC-XXXXXXXX`)
- Stores initial document status
- Starts asynchronous processing pipeline
- Returns document IDs to frontend

**Output**: Array of uploaded files ready for processing

---

### Stage 2: AI Parsing & Normalization
**Component**: `ParsingStage.tsx`

**Purpose**: Extract structured data from documents using Google Gemini AI

**Features**:
- Step-by-step process flow:
  - "Process Documents" button (initial state)
  - Loading spinner during AI processing
  - Order verification result display (after processing)
- Extracted fields display:
  - Supplier name
  - Order number
  - Order date
  - Total amount (formatted in INR with Lakhs/Crores)
  - Line items (description, quantity, unit price, total)
- Status indicators:
  - "Verified and Ready" (green) - High confidence
  - "Needs Review" (amber) - Low confidence or errors
- Issues list (if any)
- "Approve & Continue" button

**Extracted Fields Include**:
- Document type (PO, BoL, GRN, Invoice, etc.)
- Supplier name
- Order number
- Order date
- Total amount
- Currency (defaults to INR)
- Line items:
  - Description
  - Quantity
  - Unit price
  - Total
- Delivery address (if available)
- Payment terms (if available)
- Confidence level (high, medium, low)

**Backend Processing**:
- Uses Google Gemini AI to analyze document
- Extracts structured data in JSON format
- Calculates confidence scores
- Updates document status to "parsing"
- Stores extracted data in document record

**User Actions**:
1. Click "Process Documents" to start AI extraction
2. Wait for AI processing (spinner shown)
3. Review extracted fields and verification status
4. Check for any issues requiring attention
5. Click "Approve & Continue" to proceed

**Output**: Structured document data with confidence scores

---

### Stage 3: Confidence & Human Review
**Component**: `ReviewStage.tsx`

**Purpose**: Quality check and correction of low-confidence extractions

**Features**:
- Step-by-step process flow:
  - "Process Decisions" button (initial state)
  - Loading spinner during processing
  - Payment decision queue display (after processing)
- Payment Decision Queue:
  - Summary cards:
    - Pending decisions count
    - Approved decisions count
    - Total value at risk
  - Decision cards showing:
    - Supplier name
    - Order number
    - Order value
    - Financial impact (if any)
    - Issue description
    - Recommendation
    - Action buttons (Approve, Reject, Hold)
- Real-time updates from backend
- "Approve & Continue" button

**Review Criteria**:
- Documents with confidence < 80%
- Fields flagged for manual verification
- Documents with errors or exceptions
- Suggested corrections from AI

**Backend Processing**:
- Updates document status to "review"
- Marks documents for human review if confidence is low
- Provides recommendations based on extracted data

**User Actions**:
1. Click "Process Decisions" to start review process
2. Wait for processing (spinner shown)
3. Review payment decisions queue
4. Approve, reject, or hold individual decisions
5. Review financial impact and recommendations
6. Click "Approve & Continue" when done

**Output**: Verified and corrected document data

---

### Stage 4: PO–BoL–GRN–Invoice Matching
**Component**: `MatchingStage.tsx`

**Purpose**: Cross-reference related documents to detect discrepancies

**Features**:
- Step-by-step process flow:
  - "Process Matching" button (initial state)
  - Loading spinner during processing
  - Shipment alerts display (after processing)
- Shipment Alerts Summary:
  - Active alerts count
  - Resolved alerts count
  - Total shipments count
- Alert cards showing:
  - Supplier name
  - Order number
  - Shipment value
  - Financial impact
  - Issue description
  - Scenario explanation
  - Recommendation
  - Severity indicator (high, medium, low)
  - Status (pending, resolved)
- Real-time updates from backend
- "Approve Matching & Finish" button

**Matching Logic**:
- PO Number matching across documents
- Quantity verification (PO vs BoL vs GRN)
- Amount verification (PO vs Invoice)
- Item-level matching
- Variance detection:
  - Shortages (received less than ordered)
  - Over-billing (charged more than ordered)
  - Missing items (items not received)
  - Price mismatches

**Backend Processing**:
- Updates document status to "matching"
- Compares documents with matching PO numbers
- Detects variances and discrepancies
- Calculates financial impact
- Generates exception alerts for mismatches

**User Actions**:
1. Click "Process Matching" to start matching process
2. Wait for processing (spinner shown)
3. Review shipment alerts
4. Check variance details and financial impact
5. Review recommendations
6. Click "Approve Matching & Finish" to complete

**Output**: Matched document groups with variance reports

---

## State Machine & Workflow

### Application Modes

The application operates in three distinct modes:

#### 1. **Upload Mode** (`mode: "upload"`)
- **Initial State**: Default mode when the page loads
- **Purpose**: Allow users to upload documents
- **UI**: Shows IntakeStage component with drag-and-drop upload area
- **Pipeline**: Stage 1 (Upload Documents) is active
- **Transition**: When user clicks "Process Documents" → moves to Wizard Mode

#### 2. **Wizard Mode** (`mode: "wizard"`)
- **Purpose**: Guide users through the 4-stage processing pipeline
- **UI**: Shows active stage component based on `activeStage` state
- **Pipeline**: Stages 1-4, navigable by clicking pipeline steps
- **Transitions**:
  - Stage 1 → Stage 2: When files are uploaded and "Process Documents" is clicked
  - Stage 2 → Stage 3: When parsing is approved
  - Stage 3 → Stage 4: When review is approved
  - Stage 4 → Dashboard: When matching is approved

#### 3. **Dashboard Mode** (`mode: "dashboard"`)
- **Purpose**: View processed documents, KPIs, and manage exceptions
- **UI**: KPI cards, document table, exceptions panel
- **Pipeline**: All stages completed (Stage 4 active)
- **Transition**: "Start New Processing" → returns to Upload Mode

### State Transitions

```
┌─────────┐
│ Upload  │ (Initial State)
│         │ - activeStage = 1
│         │ - uploadedFiles = []
└────┬────┘
     │ User uploads files + clicks "Process Documents"
     ▼
┌─────────┐
│ Wizard  │ (activeStage = 2, starts at Parsing)
│         │ - Shows ParsingStage
│         │ - Real-time status updates
└────┬────┘
     │ User completes Stage 4 (Matching)
     │ - Clicks "Approve Matching & Finish"
     ▼
┌──────────┐
│Dashboard │ (All stages complete)
│          │ - activeStage = 4
│          │ - Shows all processed documents
└────┬─────┘
     │ User clicks "Start New Processing"
     ▼
┌─────────┐
│ Upload  │ (Reset to initial state)
└─────────┘
```

### Active Stage Logic

The `activeStage` state (1-4) determines:
- Which stage component is rendered in Wizard Mode
- Which pipeline step is highlighted
- Which stages show as completed (checkmark) vs pending (number)

**Stage Status Calculation**:
```typescript
getStageStatus(stageId: number) {
  if (stageId === 1 && uploadedFiles.length > 0) {
    return "completed";  // Stage 1 complete when files uploaded
  }
  if (processedStages.has(stageId)) {
    return "completed";  // Stages explicitly processed
  }
  if (stageId === activeStage) {
    return "active";     // Current stage
  }
  return "pending";     // Future stages
}
```

### Processed Stages Tracking

The system tracks which stages have been completed through user action:
- `processedStages`: Set<number> - Tracks completed stages
- Stages are marked as processed when:
  - Stage 1: Files are uploaded
  - Stage 2: User clicks "Approve & Continue" after parsing
  - Stage 3: User clicks "Approve & Continue" after review
  - Stage 4: User clicks "Approve Matching & Finish"

---

## Backend API

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: Configured via environment variable

### Endpoints

#### 1. Health Check
```
GET /supply-chain/health
```
**Response**:
```json
{
  "status": "healthy",
  "endpoints": {
    "upload": "/supply-chain/upload",
    "status": "/supply-chain/status/{document_id}",
    "documents": "/supply-chain/documents",
    "approve": "/supply-chain/approve/{document_id}",
    "reject": "/supply-chain/reject/{document_id}"
  }
}
```

#### 2. Upload Documents
```
POST /supply-chain/upload
Content-Type: multipart/form-data
```
**Request**: 
- `files`: Array of files (PDF or DOCX, max 20MB each)

**Response**:
```json
{
  "success": true,
  "document_ids": ["DOC-XXXXXXXX", "DOC-YYYYYYYY"],
  "message": "Uploaded 2 document(s). Processing started."
}
```

**Validation**:
- File types: PDF, DOCX only
- Max file size: 20MB per file
- Returns 400 if validation fails

**Processing**:
- Generates unique document ID (format: `DOC-XXXXXXXX`)
- Stores initial status in memory
- Starts async processing pipeline
- Returns immediately (non-blocking)

#### 3. Get Document Status
```
GET /supply-chain/status/{document_id}
```
**Response**:
```json
{
  "id": "DOC-XXXXXXXX",
  "filename": "invoice.pdf",
  "status": "parsing",
  "stage": 2,
  "progress": 60,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:05",
  "file_size": 1024000,
  "extracted_data": {
    "document_type": "Invoice",
    "supplier": "Acme Corp",
    "order_number": "PO-2024-00123",
    "order_date": "2024-01-15",
    "total_amount": 45230.50,
    "currency": "INR",
    "line_items": [
      {
        "description": "Component A",
        "quantity": 10,
        "unit_price": 1255.00,
        "total": 12550.00
      }
    ],
    "confidence": "high"
  }
}
```

**Status Values**:
- `uploaded`: File uploaded, not yet processed
- `intake`: Stage 1 - Intake
- `parsing`: Stage 2 - AI Parsing
- `review`: Stage 3 - Human Review
- `matching`: Stage 4 - Document Matching
- `completed`: All stages complete
- `approved`: Document approved for payment
- `rejected`: Document rejected
- `error`: Processing error occurred

#### 4. Get All Documents
```
GET /supply-chain/documents?status={status}&limit={limit}&offset={offset}
```
**Query Parameters**:
- `status` (optional): Filter by status
- `limit` (default: 50): Max documents to return
- `offset` (default: 0): Pagination offset

**Response**:
```json
{
  "success": true,
  "documents": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### 5. Approve Document
```
POST /supply-chain/approve/{document_id}
```
**Response**:
```json
{
  "success": true,
  "message": "Document approved",
  "document": {...}
}
```

**Effect**:
- Updates document status to "approved"
- Sets `approved_at` timestamp

#### 6. Reject Document
```
POST /supply-chain/reject/{document_id}
Content-Type: application/x-www-form-urlencoded
```
**Request**:
- `reason` (optional): Rejection reason

**Response**:
```json
{
  "success": true,
  "message": "Document rejected",
  "document": {...}
}
```

**Effect**:
- Updates document status to "rejected"
- Sets `rejected_at` timestamp
- Stores rejection reason

### Document Processing Flow (Backend)

1. **Upload** → Document received, ID generated, status: "uploaded"
2. **Intake** → Status: "intake", stage: 1, progress: 20%
3. **AI Parsing** → Status: "parsing", stage: 2, progress: 40-60%
   - Gemini AI extracts data
   - Extracted data stored
4. **Review** → Status: "review", stage: 3, progress: 70%
5. **Matching** → Status: "matching", stage: 4, progress: 85%
6. **Completed** → Status: "completed", stage: 4, progress: 100%

### Error Handling

- **400 Bad Request**: Invalid file type, size, or missing parameters
- **404 Not Found**: Document ID not found
- **500 Internal Server Error**: Processing error

All errors return:
```json
{
  "detail": "Error message"
}
```

---

## Frontend Components

### Main Page Component
**File**: `app/supply-chain-document-automation/page.tsx`

**Responsibilities**:
- State machine management (mode, activeStage)
- File upload handling (drag-and-drop)
- Document filtering and search
- Dashboard rendering
- Document detail drawer management
- Real-time document status polling
- Pipeline visualization

**Key State Variables**:
- `mode`: "upload" | "wizard" | "dashboard"
- `activeStage`: 1-4
- `processedStages`: Set<number> - Tracks completed stages
- `uploadedFiles`: File[]
- `documents`: Document[] - UI format documents
- `apiDocuments`: APIDocumentStatus[] - Raw API documents
- `isProcessingStage`: boolean - Indicates stage processing
- `uploadedDocumentIds`: string[] - IDs of documents being processed
- `searchQuery`: string
- `selectedDocTypes`: DocumentType[]
- `selectedStatus`: DocumentStatus | ""
- `selectedMatchStatus`: MatchStatus | ""

**Key Functions**:
- `handleProcessDocuments()`: Upload → Wizard transition, uploads files to backend
- `handleProcessCurrentStage()`: Processes current stage via API
- `handleStageComplete()`: Advances to next stage
- `handleFinishWizard()`: Wizard → Dashboard transition
- `handleStartNewProcessing()`: Any → Upload transition, resets all state
- `handleViewDetails()`: Opens drawer and syncs pipeline stage
- `loadDocuments()`: Fetches all documents from backend
- `convertAPIDocumentToUI()`: Converts API format to UI format

**Real-time Updates**:
- Polls document status every 3 seconds in dashboard mode
- Updates document list when status changes
- Syncs pipeline visualization with document status

### Pipeline Visualization
**Location**: Rendered directly in `page.tsx`

**Features**:
- Always visible below header
- Shows 4 stages:
  1. Upload Documents
  2. AI Parsing & Normalization
  3. Confidence & Human Review
  4. PO–BoL–GRN–Invoice Matching
- Visual states:
  - **Completed**: Purple background (#5332FF), white checkmark icon
  - **Active**: Purple background, white checkmark icon
  - **Pending**: Gray background, gray stage number
- Clickable stages (updates `activeStage`)
- Connecting lines show progress
- Responsive layout

### Stage Components

#### IntakeStage
**File**: `components/supply-chain/IntakeStage.tsx`

**Props**:
- `uploadedFiles`: File[]
- `onFilesChange`: (files: File[]) => void
- `isDragging`: boolean
- `onDragOver`, `onDragLeave`, `onDrop`: Drag event handlers
- `onProcessDocuments?`: () => void
- `isUploading?`: boolean
- `processingCount?`: number

**Features**:
- Drag-and-drop upload area (when no files)
- File list grid (when files present)
- "Add Files" button (appends to existing files)
- "Clear All" button
- "Process Documents" button
- Upload progress indication

#### ParsingStage
**File**: `components/supply-chain/ParsingStage.tsx`

**Props**:
- `documentId?`: string
- `onApprove?`: () => void
- `isProcessing?`: boolean
- `onProcess?`: () => void
- `isProcessed?`: boolean
- `documents?`: APIDocumentStatus[]

**Features**:
- Step-by-step flow:
  1. "Process Documents" button (if not processed)
  2. Loading spinner (during processing)
  3. Order verification result (after processing)
- Extracts real data from API documents
- Shows supplier, order number, date, amount
- Displays line items
- Shows issues if any
- Status indicators (verified/needs review)
- "Approve & Continue" button

#### ReviewStage
**File**: `components/supply-chain/ReviewStage.tsx`

**Props**:
- `onApprove?`: () => void
- `isProcessing?`: boolean
- `onProcess?`: () => void
- `isProcessed?`: boolean
- `documents?`: Document[]

**Features**:
- Step-by-step flow:
  1. "Process Decisions" button (if not processed)
  2. Loading spinner (during processing)
  3. Payment decision queue (after processing)
- Converts real documents to payment decisions
- Summary cards (pending, approved, value at risk)
- Decision cards with actions (Approve, Reject, Hold)
- Real-time updates via useEffect
- "Approve & Continue" button

#### MatchingStage
**File**: `components/supply-chain/MatchingStage.tsx`

**Props**:
- `onApprove?`: () => void | Promise<void>
- `isProcessing?`: boolean
- `onProcess?`: () => void | Promise<void>
- `isProcessed?`: boolean
- `documents?`: Document[]

**Features**:
- Step-by-step flow:
  1. "Process Matching" button (if not processed)
  2. Loading spinner (during processing)
  3. Shipment alerts (after processing)
- Converts real documents to shipment alerts
- Summary cards (active alerts, resolved, total)
- Alert cards with severity indicators
- Real-time updates via useEffect
- "Approve Matching & Finish" button

#### DocumentDetailDrawer
**File**: `components/supply-chain/DocumentDetailDrawer.tsx`

**Props**:
- `document`: Document | null
- `isOpen`: boolean
- `onClose`: () => void

**Features**:
- Slide-out drawer from right
- Tabbed interface:
  - **Overview**: Metadata, confidence breakdown, timeline
  - **Extracted Data**: Raw JSON, field-level data
  - **Matching Results**: Matched documents, variances
  - **Audit Log**: Complete processing history
- Close button
- Responsive design

### API Service Layer
**File**: `utils/supplyChainApi.ts`

**Functions**:
- `uploadDocuments(files: File[])`: Upload files to backend
- `getDocumentStatus(documentId: string)`: Get single document status
- `getAllDocuments(status?, limit?, offset?)`: Get all documents with filtering
- `approveDocument(documentId: string)`: Approve a document
- `rejectDocument(documentId: string, reason?)`: Reject a document
- `pollDocumentStatus(documentId, onUpdate, interval, maxAttempts)`: Poll status until completion

**Error Handling**:
- Handles 404 gracefully (returns empty list)
- Provides helpful error messages
- Handles network errors (connection refused, CORS, etc.)

---

## Data Models

### Document (UI Format)
```typescript
interface Document {
  id: string;                    // Unique document identifier (e.g., "DOC-XXXXXXXX")
  type: DocumentType;            // "PO" | "BoL" | "GRN" | "Packing List" | "Invoice" | "QC Cert"
  supplier: string;              // Supplier name
  status: DocumentStatus;         // "Processed" | "In Review" | "Exception"
  matchStatus: MatchStatus;      // "Matched" | "Partial" | "Failed"
  confidence: number;            // Overall confidence score (0-100)
  lastUpdated: string;           // ISO timestamp of last update
  orderValue?: number;           // Business value in paise (divide by 100000 for Lakhs)
  issueDescription?: string;      // Business context description
  financialImpact?: number;       // Money at risk in paise
}
```

### DocumentStatus (API Format)
```typescript
interface DocumentStatus {
  id: string;
  filename: string;
  status: "uploaded" | "intake" | "parsing" | "review" | "matching" | 
          "completed" | "approved" | "rejected" | "error";
  stage: number;                 // 1-4
  progress: number;              // 0-100
  created_at: string;            // ISO timestamp
  updated_at?: string;            // ISO timestamp
  file_size: number;             // Bytes
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
    confidence?: "high" | "medium" | "low";
  };
  error?: string;
}
```

### Exception
```typescript
interface Exception {
  id: string;                     // Unique exception identifier
  title: string;                 // Exception description
  documentIds: string[];          // Related document IDs
  severity: Severity;             // "High" | "Medium" | "Low"
  assignedTo: string;             // Assigned user name
  financialImpact?: number;       // Money at risk
  supplierName?: string;          // Business context
}
```

### Pipeline Stage
```typescript
interface PipelineStage {
  id: number;                     // Stage number (1-4)
  name: string;                   // Stage name
  description: string;            // Short description (not displayed)
}
```

---

## Real-time Processing

### Frontend Polling

The frontend uses a polling mechanism to get real-time document status updates:

**Polling Strategy**:
- **Dashboard Mode**: Polls every 3 seconds
- **Wizard Mode**: Polls individual documents every 2 seconds until completion
- **Max Polling Duration**: 4 minutes (120 attempts × 2 seconds)

**Implementation**:
```typescript
// Dashboard polling
useEffect(() => {
  const interval = setInterval(() => {
    if (mode === "dashboard" || documents.length > 0) {
      loadDocuments();
    }
  }, 3000);
  return () => clearInterval(interval);
}, [mode, documents.length]);

// Individual document polling
pollDocumentStatus(
  documentId,
  (status) => {
    // Update document in state
    setDocuments(prev => updateDocument(prev, status));
  },
  2000,  // Poll every 2 seconds
  120    // Max 4 minutes
);
```

### Backend Async Processing

The backend processes documents asynchronously:

**Processing Flow**:
1. Upload endpoint returns immediately with document IDs
2. Background task (`process_supply_chain_document`) starts processing
3. Status updates are stored in memory
4. Frontend polls status endpoint to get updates

**Status Updates**:
- Stage 1 (Intake): 20% progress
- Stage 2 (Parsing): 40-60% progress (AI extraction)
- Stage 3 (Review): 70% progress
- Stage 4 (Matching): 85% progress
- Completed: 100% progress

**Error Handling**:
- Errors are caught and stored in document status
- Status set to "error"
- Error message available in `error` field

---

## User Flows

### Flow 1: New Document Processing

```
1. User lands on page (Upload Mode)
   └─> Sees IntakeStage with empty upload area
   └─> Pipeline shows Stage 1 (Upload Documents) as active

2. User uploads documents
   └─> Drag-and-drop or browse files
   └─> Files appear in grid list
   └─> Can add more files or remove files
   └─> Pipeline shows Stage 1 with checkmark

3. User clicks "Process Documents"
   └─> Files uploaded to backend
   └─> Mode changes to "wizard"
   └─> activeStage = 2 (Parsing)
   └─> ParsingStage component renders
   └─> Backend starts async processing

4. User clicks "Process Documents" in ParsingStage
   └─> Shows loading spinner
   └─> Backend AI extraction completes
   └─> Order verification result displayed
   └─> User reviews extracted data

5. User clicks "Approve & Continue"
   └─> Stage 2 marked as processed
   └─> activeStage = 3 (Review)
   └─> ReviewStage component renders

6. User clicks "Process Decisions" in ReviewStage
   └─> Shows loading spinner
   └─> Payment decision queue displayed
   └─> User reviews decisions

7. User clicks "Approve & Continue"
   └─> Stage 3 marked as processed
   └─> activeStage = 4 (Matching)
   └─> MatchingStage component renders

8. User clicks "Process Matching" in MatchingStage
   └─> Shows loading spinner
   └─> Shipment alerts displayed
   └─> User reviews alerts

9. User clicks "Approve Matching & Finish"
   └─> Stage 4 marked as processed
   └─> Mode changes to "dashboard"
   └─> Dashboard displays all processed documents
```

### Flow 2: Viewing Document Details

```
1. User is in Dashboard Mode
   └─> Sees document table with all processed documents

2. User clicks "View Details" on a document row
   └─> handleViewDetails() is called
   └─> activeStage is set based on document status:
       - "Processed" → Stage 4
       - "In Review" → Stage 3
       - "Exception" → Stage 4
   └─> Pipeline updates to reflect stage
   └─> DocumentDetailDrawer opens

3. User views document details
   └─> Switches between tabs (Overview, Extracted Data, Matching, Audit)
   └─> Reviews extracted data
   └─> Checks matching results
   └─> Views audit log

4. User closes drawer
   └─> Drawer closes
   └─> Pipeline remains at synced stage
   └─> User can continue browsing dashboard
```

### Flow 3: Starting New Processing

```
1. User is in Dashboard Mode
   └─> Clicks "Start New Processing" button

2. State resets
   └─> mode = "upload"
   └─> activeStage = 1
   └─> uploadedFiles = []
   └─> processedStages = new Set()
   └─> uploadedDocumentIds = []
   └─> isProcessingStage = false
   └─> All filters cleared
   └─> documents array cleared (or kept for reference)

3. User returns to Upload Mode
   └─> Fresh start for new document batch
   └─> Can upload new documents
```

### Flow 4: Real-time Status Updates

```
1. User uploads documents
   └─> Backend starts async processing
   └─> Frontend receives document IDs

2. Frontend starts polling
   └─> Polls document status every 2 seconds
   └─> Updates document state on each poll

3. Backend processes document
   └─> Updates status: uploaded → intake → parsing → review → matching → completed
   └─> Updates progress: 0% → 20% → 40% → 60% → 70% → 85% → 100%

4. Frontend reflects changes
   └─> Document table updates
   └─> Status badges update
   └─> Pipeline visualization updates
   └─> Stage components show latest data

5. Processing completes
   └─> Polling stops
   └─> Final status displayed
```

---

## Features & Capabilities

### 1. Multi-Source Document Intake
- **Drag-and-Drop Upload**: Intuitive file upload interface
- **File Type Validation**: Accepts PDF and DOCX files only
- **File Size Validation**: Max 20MB per file
- **Multiple File Upload**: Upload multiple files at once
- **Add Files**: Append more files after initial upload
- **Remove Files**: Remove individual files before processing
- **Clear All**: Remove all files at once

### 2. AI-Powered Extraction
- **Google Gemini AI**: Uses Vertex AI for document analysis
- **Field Extraction**: Automatic extraction of key document fields
- **Confidence Scoring**: Per-field confidence (high, medium, low)
- **Structured Output**: JSON format with validated schema
- **Error Handling**: Graceful handling of extraction failures
- **Real-time Processing**: Async processing with status updates

### 3. Human-in-the-Loop Review
- **Review Queue**: Prioritized list of documents needing attention
- **Payment Decisions**: Business-focused decision interface
- **Financial Impact**: Shows money at risk
- **Recommendations**: AI-generated recommendations
- **Batch Actions**: Approve/reject multiple documents
- **Real-time Updates**: Documents update as they're processed

### 4. Intelligent Document Matching
- **Multi-Document Comparison**: Cross-reference related documents
- **Variance Detection**: Automatic identification of discrepancies
- **Shipment Alerts**: Business-focused alert system
- **Severity Indicators**: High, medium, low severity levels
- **Financial Impact**: Calculates money at risk
- **Recommendations**: Actionable recommendations for each alert

### 5. Real-time Status Tracking
- **Polling Mechanism**: Automatic status updates every 2-3 seconds
- **Progress Indicators**: Visual progress bars and percentages
- **Status Badges**: Color-coded status indicators
- **Pipeline Visualization**: Real-time pipeline stage updates
- **Document Table**: Live updates of document status

### 6. Dashboard & Analytics
- **KPI Cards**: 
  - Documents processed today
  - Auto-matched rate
  - Exceptions open
  - Average processing time
- **Document Table**: 
  - Searchable (by ID, supplier)
  - Filterable (by type, status, match status)
  - Sortable columns
  - Status badges
  - Action buttons (View Details)
- **Business Metrics**: 
  - Currency in INR (₹) with Lakhs (L) and Crores (Cr)
  - Financial impact calculations
  - Order value tracking

### 7. Document Detail View
- **Tabbed Interface**: Organized view of document information
- **Overview Tab**: Metadata, confidence breakdown, timeline
- **Extracted Data Tab**: Raw JSON, field-level data
- **Matching Results Tab**: Related documents and variances
- **Audit Log Tab**: Complete action history
- **Responsive Design**: Works on all screen sizes

### 8. Step-by-Step Wizard Flow
- **User-Driven Progression**: Each stage requires explicit user action
- **Process Buttons**: "Process Documents", "Process Decisions", "Process Matching"
- **Loading States**: Spinner animations during processing
- **Completion States**: Results displayed after processing
- **Approval Buttons**: "Approve & Continue" to advance stages
- **Visual Feedback**: Clear indication of current step and progress

### 9. State Management
- **Mode-Based Navigation**: Clear separation of upload, wizard, and dashboard
- **Pipeline Synchronization**: Pipeline reflects current document state
- **Processed Stages Tracking**: Tracks which stages user has completed
- **Persistent State**: State maintained during navigation
- **State Reset**: Clean reset when starting new processing

### 10. Error Handling
- **File Validation**: Prevents invalid file types and sizes
- **API Error Handling**: Graceful handling of 404, 500, network errors
- **Exception Tracking**: Comprehensive exception management
- **Status Indicators**: Visual feedback for all states
- **User Feedback**: Clear error messages and success indicators
- **Fallback Values**: Empty states when no data available

### 11. Responsive Design
- **Desktop-First**: Optimized for large screens
- **Mobile Support**: Responsive layouts for smaller devices
- **Touch-Friendly**: Large click targets for mobile users
- **Flexible Grids**: Adapts to different screen sizes

### 12. Business-Focused UI
- **Natural Language**: Business-friendly terminology
- **Financial Metrics**: Focus on business value and impact
- **Action-Oriented**: Clear call-to-action buttons
- **Visual Hierarchy**: Important information highlighted
- **Semantic Colors**: Green for success, amber for warnings, red for errors
- **Currency Formatting**: INR with Lakhs and Crores notation

---

## Technical Implementation

### Performance Considerations
- **Lazy Loading**: Stage components loaded on demand
- **Memoization**: Expensive calculations could be memoized (future)
- **Debounced Search**: Search input could be debounced (future)
- **Polling Optimization**: Polls only when needed (dashboard mode or active documents)
- **Efficient Updates**: Only updates changed documents in state

### Accessibility
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Screen Reader Support**: ARIA labels and roles (could be enhanced)
- **Color Contrast**: WCAG AA compliant color schemes
- **Focus Management**: Proper focus handling in modals and drawers

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **File API**: Drag-and-drop requires modern browser support
- **CSS Grid**: Uses CSS Grid for layouts
- **Fetch API**: Uses native fetch (polyfill available if needed)

### Security Considerations
- **File Type Validation**: Both frontend and backend validate file types
- **File Size Limits**: 20MB max per file
- **CORS**: Backend should configure CORS for production
- **Input Sanitization**: Backend should sanitize extracted data
- **Error Messages**: Don't expose sensitive information in errors

### Scalability
- **In-Memory Storage**: Current backend uses in-memory dictionary (not production-ready)
- **Recommended**: Use Redis or database for production
- **Async Processing**: Backend processes documents asynchronously
- **Polling Limits**: Frontend has max polling attempts to prevent infinite loops
- **Pagination**: Backend supports pagination for document lists

### Future Enhancements
1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **WebSocket Support**: Real-time updates instead of polling
3. **Batch Processing**: Process multiple document batches simultaneously
4. **Custom Rules Engine**: User-defined matching and validation rules
5. **Advanced Analytics**: Trend analysis, predictive insights
6. **API Integration**: RESTful API for external system integration
7. **Workflow Customization**: Configurable pipeline stages
8. **Multi-language Support**: Internationalization
9. **Advanced Search**: Full-text search across all documents
10. **Export Functionality**: Export reports and data
11. **User Permissions**: Role-based access control
12. **Audit Trail**: Complete history of all actions
13. **Email Notifications**: Notify users of status changes
14. **S3 Integration**: Direct upload from S3 buckets
15. **Email Integration**: Process documents from email attachments

---

## Conclusion

The Supply Chain Document Automation module provides a comprehensive solution for automating document processing workflows. With its state-machine architecture, modular components, real-time updates, and intuitive user interface, it streamlines the entire process from document intake to matching and approval.

The system is designed to be:
- **User-Friendly**: Intuitive workflows and clear visual feedback
- **Real-time**: Live status updates and progress tracking
- **Scalable**: Modular architecture supports future enhancements
- **Reliable**: Robust error handling and exception management
- **Efficient**: Automated processing with human oversight where needed
- **Business-Focused**: Metrics and language tailored for business users

For questions or issues, please refer to the codebase or contact the development team.

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Production Ready (with in-memory storage - database recommended for production)

# Demo Documentation - CAD RFQ Platform

## Overview
This platform provides three powerful tools for automotive parts procurement and quality assurance:
1. **Vendor RFQ Comparison** - Compare multiple vendor quotes
2. **RFQ – CAD Comparison** - Validate CAD drawings against RFQ requirements
3. **Welding Analyzer** - Analyze welding specifications from CAD drawings

---

## Tab 1: Vendor RFQ Comparison

### Purpose
Compare multiple vendor RFQ (Request for Quotation) documents to make informed procurement decisions by analyzing pricing, delivery terms, warranties, and technical specifications.

### Workflow

#### Step 1: Upload Multiple RFQ Files
- **Action**: Upload 2 or more vendor RFQ documents (PDF or DOCX)
- **Features**:
  - Drag-and-drop interface
  - File browser option
  - Multiple file selection
  - File preview capability
  - Visual file list with remove option

#### Step 2: Analyze & Compare
- **Action**: Click "Detect Vendors" button
- **Process**: 
  - System extracts vendor information from each RFQ
  - Identifies pricing, delivery, warranty, and technical specs
  - Compares all vendors side-by-side
  - Generates AI-powered recommendations

#### Step 3: View Results
The results page displays:

**AI Insights Summary**
- Best price vendor recommendation
- Best delivery vendor recommendation
- Best warranty vendor recommendation
- Overall vendor recommendation with reasoning

**Vendor Profiles (Card Grid)**
- Individual vendor cards showing:
  - Vendor name
  - Certification level
  - Unit price (INR)
  - Extended price
  - Delivery timelines (initial, subsequent, emergency)
  - Warranty information
  - Product type and part number
  - Dimensions and specifications
- Recommended vendor highlighted

**Comparison Grid**
- Side-by-side comparison table of all vendors
- Organized by categories:
  - Pricing (unit price, extended price, quantity discounts, shipping terms)
  - Delivery (initial days, subsequent days, emergency days)
  - Warranty information
  - Technical specifications (product type, part number, dimensions)

**Business Actions**
- Download PDF report
- Share comparison
- Save comparison
- Request revised quote

### Key Features
- ✅ Multi-vendor comparison
- ✅ AI-powered recommendations
- ✅ Visual vendor cards
- ✅ Detailed comparison grid
- ✅ Export and sharing options

---

## Tab 2: RFQ – CAD Comparison

### Purpose
Compare RFQ requirements with CAD drawings to ensure compliance, identify mismatches, and validate that the CAD design meets all specified requirements.

### Workflow

#### Step 1: Select Part & Upload Files
- **Part Selection**: Choose automotive part type from dropdown:
  - Spark Plug
  - Brake Disc
  - Horn
- **RFQ File Upload**: Upload RFQ document (PDF or DOCX)
  - Drag-and-drop or browse
  - File preview available
  - Shows file name and size
- **CAD File Upload**: Upload CAD drawing (PNG, JPG, JPEG, WEBP, PDF)
  - Drag-and-drop or browse
  - File preview available
  - Shows file name and size

#### Step 2: Run Comparison
- **Action**: Click "Run Comparison" button
- **Process**:
  - System extracts requirements from RFQ
  - Analyzes CAD drawing for specifications
  - Compares RFQ requirements vs CAD findings
  - Identifies matches, mismatches, and missing items
  - Generates annotated CAD image (if available)

#### Step 3: View Results
The results page displays:

**AI Summary (KPI Metrics)**
Three metric cards showing:
- **Matched Items** (Green)
  - Count of dimensions that align between RFQ and CAD
  - Progress bar showing percentage
  - List of matched metrics (expandable)
- **Mismatched Items** (Red)
  - Count of conflicting dimensions
  - Progress bar showing percentage
  - List of mismatched metrics (expandable)
- **Missing Items** (Yellow)
  - Count of RFQ requirements not found in CAD
  - Progress bar showing percentage
  - List of missing metrics (expandable)

**Detailed Comparison (Toggle: Show/Hide Details)**
Two sub-tabs:

**1. Detailed Summary Tab**
- Comprehensive comparison table organized by categories:
  - Thread Specifications
  - Dimensional Metrics
  - Electrode Specifications
  - Terminal Specifications
  - Insulator Specifications
  - Other Specifications
- Table columns:
  - Metrics (parameter name)
  - RFQ Requirements (specified value)
  - CAD Findings (detected value)
  - Select All checkbox (for bulk selection)
- Individual checkboxes for each metric

**Selected Items Table** (appears when items are selected)
- Displays only the metrics that have been checked/selected
- Same table format with section headers
- Table columns:
  - Metrics
  - RFQ Requirements
  - CAD Findings
  - Status (color-coded badges: Match/Mismatch/Missing)
  - Action (remove button to deselect)
- "Clear All" button to deselect all items
- Automatically grouped by categories (same as main table)
- Updates dynamically as items are selected/deselected

**2. Smart Annotation Tab** (if available)
- Annotated CAD image with visual markers:
  - 🔴 Red markers = Mismatches
  - 🟢 Green markers = Matches
  - 🟡 Yellow markers = Missing
- Zoom controls (25% to 200%)
- Reset zoom button
- Legend showing color meanings
- Annotation details table:
  - Metric name
  - RFQ value
  - CAD value
  - Status (Match/Mismatch/Missing)

### Key Features
- ✅ Part-specific analysis
- ✅ Requirement extraction from RFQ
- ✅ CAD specification detection
- ✅ Visual annotation on CAD drawings
- ✅ Categorized comparison results
- ✅ Bulk selection for metrics
- ✅ Selected items table for focused review
- ✅ Status indicators (Match/Mismatch/Missing)
- ✅ Zoom controls for detailed inspection

---

## Tab 3: Welding Analyzer

### Purpose
Analyze welding CAD drawings and diagrams to extract welding specifications, dimensions, and compliance metrics for quality inspection.

### Workflow

#### Step 1: Upload Drawing
- **Action**: Upload welding CAD drawing or diagram
- **Supported Formats**: PNG, JPG, JPEG, WEBP, PDF
- **Features**:
  - Drag-and-drop interface
  - File browser option
  - File preview modal
  - Shows file name and size

#### Step 2: Analyze Specifications
- **Action**: Click "Analyze Welding Specifications" button
- **Process**:
  - System analyzes the drawing
  - Extracts welding specifications
  - Identifies dimensions and measurements
  - Checks compliance metrics
  - Generates structured data table

#### Step 3: View Results
The results page displays:

**Welding Specification Analysis Table**
- Structured data table with extracted specifications
- Columns vary based on drawing content (e.g.,):
  - Weld type
  - Dimensions
  - Material specifications
  - Welding standards
  - Quality metrics
  - Compliance indicators
- Scrollable table (max height: 600px)
- Sticky header for easy navigation
- Alternating row colors for readability
- Hover effects for better UX

### Key Features
- ✅ Automatic specification extraction
- ✅ Structured data output
- ✅ Compliance checking
- ✅ File preview capability
- ✅ Clean, readable table format
- ✅ Cancel analysis option

---

## Common Features Across All Tabs

### Navigation
- Header with YAARALABS logo
- Tab navigation between three tools
- Consistent UI/UX design

### File Handling
- Drag-and-drop support
- File preview modals
- File size display
- Multiple format support
- File removal option

### Progress Indicators
- Step-by-step progress bars
- Loading spinners
- Status messages
- Cancel operations

### Error Handling
- Clear error messages
- Validation feedback
- Retry options
- User-friendly alerts

### Actions
- Start new analysis/comparison
- Reset/clear inputs
- Download results
- Share functionality

---

## Demo Flow Recommendations

### Scenario 1: Procurement Decision
1. Start with **Vendor RFQ Comparison**
2. Upload 3-4 vendor RFQ files
3. Show AI recommendations
4. Highlight best vendor selection
5. Demonstrate comparison grid

### Scenario 2: Quality Assurance
1. Start with **RFQ – CAD Comparison**
2. Select part type (e.g., Spark Plug)
3. Upload RFQ and CAD files
4. Show AI summary with metrics
5. Display detailed comparison table
6. Show annotated CAD image (if available)

### Scenario 3: Welding Inspection
1. Start with **Welding Analyzer**
2. Upload welding CAD drawing
3. Show analysis process
4. Display extracted specifications table
5. Highlight compliance metrics

---

## Technical Notes for Demo

### Supported File Formats
- **RFQ Documents**: PDF, DOCX
- **CAD Drawings**: PNG, JPG, JPEG, WEBP, PDF
- **Max File Size**: 20MB (backend limit)

### Processing Time
- Vendor RFQ Comparison: ~30-60 seconds (depends on number of files)
- RFQ-CAD Comparison: ~30-45 seconds
- Welding Analyzer: ~20-40 seconds

### Browser Requirements
- Modern browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Stable internet connection

---

## Key Selling Points

1. **AI-Powered Analysis**: All three tools use advanced AI to extract and compare data
2. **Time Savings**: Automates manual comparison and analysis tasks
3. **Accuracy**: Reduces human error in specification matching
4. **Visual Insights**: Annotated CAD images and visual comparisons
5. **Decision Support**: AI recommendations for vendor selection
6. **Compliance Checking**: Ensures designs meet RFQ requirements
7. **Quality Assurance**: Validates welding specifications automatically

---

## End of Demo Document


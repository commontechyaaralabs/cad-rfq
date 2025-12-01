# CAD RFQ Frontend

Next.js frontend for the CAD RFQ Platform - AI-powered document analysis and comparison tools.

## 🌐 Backend API

**Production URL:** https://logistics-manufacturing-api-1033805860980.us-east4.run.app

**API Documentation:** https://logistics-manufacturing-api-1033805860980.us-east4.run.app/docs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL (optional):**
   
   Create `.env.local` for local backend development:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   
   Or for production backend:
   ```env
   NEXT_PUBLIC_API_URL=https://logistics-manufacturing-api-1033805860980.us-east4.run.app
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects)
│   ├── vendor-rfq-comparison/   # Vendor RFQ comparison tool
│   ├── rfq-cad-comparison/      # RFQ vs CAD comparison tool
│   ├── welding-analyzer/        # Welding specification analyzer
│   └── supply-chain-document-automation/
│       ├── page.tsx             # Supply chain automation UI
│       └── DOCUMENTATION.md     # Detailed module docs
│
├── components/                   # React components
│   ├── Header.tsx               # App header with navigation
│   ├── UploadWizard.tsx         # File upload wizard
│   ├── VendorCard.tsx           # Vendor profile cards
│   ├── ComparisonGrid.tsx       # Side-by-side comparison
│   ├── KPIMetrics.tsx           # KPI metric cards
│   ├── TailSpinner.tsx          # Loading spinner
│   └── supply-chain/            # Supply chain components
│       ├── IntakeStage.tsx
│       ├── ParsingStage.tsx
│       ├── ReviewStage.tsx
│       ├── MatchingStage.tsx
│       └── Pipeline.tsx
│
├── utils/                        # Utility functions
│   ├── api.ts                   # API URL configuration
│   ├── supplyChainApi.ts        # Supply chain API calls
│   ├── formatBytes.ts           # File size formatting
│   └── previewUtils.ts          # File preview utilities
│
└── public/                       # Static assets
    └── yaralabs_logo.png        # Company logo
```

## 🛠️ Features

### 1. Vendor RFQ Comparison
- Upload multiple vendor RFQ documents
- AI-powered extraction and comparison
- Side-by-side vendor analysis
- Recommendations and insights

### 2. RFQ – CAD Comparison
- Compare RFQ requirements with CAD drawings
- Visual annotation of matches/mismatches
- Categorized specification analysis

### 3. Welding Analyzer
- Extract welding specifications from drawings
- Compliance checking
- Structured data output

### 4. Supply Chain Document Automation
- 4-stage document processing pipeline
- Real-time status tracking
- AI parsing and matching
- Business-focused dashboard

## 📦 Dependencies

- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📚 Documentation

- **[Supply Chain Documentation](app/supply-chain-document-automation/DOCUMENTATION.md)** - Detailed supply chain module docs

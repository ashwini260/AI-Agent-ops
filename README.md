# AgentForge AI Document Ops

Operations console for processing synthetic hospital invoice PDFs. The React frontend provides a complete UI for uploading, reviewing, and querying invoice documents. A separate FastAPI backend provides all API endpoints.

## Technology Stack

- React 18 (JavaScript, .jsx)
- Vite build tool
- React Router for navigation
- Axios for HTTP requests
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | FastAPI backend URL | `http://localhost:8000` |
| `VITE_USE_MOCKS` | Use mock data instead of real API | `true` |

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Mock Mode

When `VITE_USE_MOCKS=true`, the UI uses mock data from `src/mocks/mockData.js` and does not require the backend to be running. Set `VITE_USE_MOCKS=false` once the FastAPI backend is ready.

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPI cards, recent documents, exception and trend charts |
| `/upload` | Upload Documents | Drag-and-drop PDF upload with validation and progress |
| `/knowledge-base` | Knowledge Base | Bulk folder ingestion, index stats, and reindexing |
| `/documents` | Documents | Filterable, paginated document list |
| `/documents/:documentId` | Document Detail | Full invoice details, line items, validation, exceptions, audit trail |
| `/exceptions` | Exceptions | Review queue with correction and approve/reject workflow |
| `/chat` | Ask Invoices | Chat interface with cited answers from the indexed collection |
| `/analytics` | Analytics | KPIs, trends, hospital comparison, insurer split, Excel export |

## API Contract

The frontend expects these endpoints from the FastAPI backend:

- `GET /api/v1/health`
- `POST /api/v1/documents/upload` (multipart/form-data, field: `files`)
- `GET /api/v1/documents?page=&page_size=&search=&status=&hospital=&exception_type=`
- `GET /api/v1/documents/{documentId}`
- `POST /api/v1/documents/{documentId}/reprocess`
- `POST /api/v1/ingestion/bulk` (JSON: `{"recursive": true}`)
- `GET /api/v1/ingestion/jobs/{jobId}`
- `GET /api/v1/ingestion/stats`
- `POST /api/v1/ingestion/reindex/{documentId}`
- `GET /api/v1/exceptions?page=&page_size=&status=&type=`
- `PATCH /api/v1/exceptions/{exceptionId}/review`
- `POST /api/v1/chat/query`
- `GET /api/v1/analytics/summary`
- `GET /api/v1/analytics/trends`
- `GET /api/v1/exports/invoices.xlsx`

## Service Layer

All API calls go through the service layer. Page components never call Axios directly.

| Service File | Exports |
|-------------|---------|
| `src/services/documentService.js` | `getDocuments`, `getDocumentById`, `uploadDocuments`, `reprocessDocument` |
| `src/services/ingestionService.js` | `startBulkIngestion`, `getIngestionJob`, `getIngestionStats`, `reindexDocument`, `pollIngestionJob` |
| `src/services/exceptionService.js` | `getExceptions`, `reviewException` |
| `src/services/chatService.js` | `sendChatQuery` |
| `src/services/analyticsService.js` | `getAnalyticsSummary`, `getAnalyticsTrends`, `getExportUrl` |

## Project Structure

```
src/
  components/
    layout/AppLayout.jsx
    common/LoadingSpinner.jsx
    common/ErrorMessage.jsx
    common/StatusBadge.jsx
    documents/DocumentTable.jsx
    documents/InvoiceFields.jsx
    documents/LineItemsTable.jsx
    exceptions/ExceptionTable.jsx
    ingestion/IngestionProgress.jsx
    ingestion/IndexStats.jsx
    chat/ChatMessage.jsx
    chat/CitationCard.jsx
    charts/ExceptionChart.jsx
    charts/InvoiceTrendChart.jsx
  pages/
    DashboardPage.jsx
    UploadPage.jsx
    KnowledgeBasePage.jsx
    DocumentsPage.jsx
    DocumentDetailPage.jsx
    ExceptionsPage.jsx
    ChatPage.jsx
    AnalyticsPage.jsx
  services/
    api.js
    documentService.js
    ingestionService.js
    exceptionService.js
    chatService.js
    analyticsService.js
  config/apiConfig.js
  mocks/mockData.js
  App.jsx
  main.jsx
backend/
  apis/.gitkeep
  services/.gitkeep
  data/samples/.gitkeep
  data/source_invoices/.gitkeep
  data/uploads/.gitkeep
  vectorstore/chroma/.gitkeep
  exports/.gitkeep
database/sql/.gitkeep
```

## Backend

The `backend/` folder contains `.gitkeep` placeholders only. The FastAPI backend (Python services, Ollama OCR, SQL Server storage, Chroma vector store) will be implemented separately. No Python business logic or SQL queries are included in this repository.

## Important Notes

- Use synthetic documents only for testing.
- Never place API keys, database credentials, or secrets in frontend code.
- The backend reads PDFs from its configured `data/source_invoices` folder; the browser does not upload all source files.
- The source folder path is configured in the backend `.env` file and cannot be changed from the UI.

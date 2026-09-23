const hospitals = [
  'Lifeline Medical Centre',
  'Sunrise Hospital',
  'Fortis Healthcare',
  'Apollo Hospital',
  'Medanta Medicity',
  'Max Super Speciality',
  'Artemis Hospital',
  'Kokilaben Hospital',
]

const patients = [
  'Aryan Maharaj',
  'Priya Sharma',
  'Rajesh Kumar',
  'Sneha Patel',
  'Vikram Singh',
  'Ananya Reddy',
  'Rohit Mehta',
  'Kavya Nair',
  'Arjun Gupta',
  'Deepika Joshi',
]

const statuses = [
  'APPROVED',
  'REVIEW_REQUIRED',
  'PROCESSING',
  'FAILED',
  'DUPLICATE',
]

const vectorStatuses = ['INDEXED', 'PENDING', 'FAILED', 'NOT_INDEXED']

const exceptionTypes = [
  'TOTAL_MISMATCH',
  'DUPLICATE_FILE',
  'DUPLICATE_INVOICE',
  'MISSING_PATIENT_NAME',
  'MISSING_DIAGNOSIS',
  'MISSING_INSURER',
  'MISSING_INVOICE_DATE',
  'EXTRACTION_FAILED',
]

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat(
    (Math.random() * (max - min) + min).toFixed(decimals)
  )
}

function generateDocuments(count) {
  const docs = []
  for (let i = 1; i <= count; i++) {
    const status = randomItem(statuses)
    const lineItems = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => {
      const qty = Math.floor(Math.random() * 10) + 1
      const rate = randomFloat(500, 50000)
      return {
        line_no: j + 1,
        description: `Procedure/Service ${j + 1}`,
        code: `CPT-${10000 + Math.floor(Math.random() * 9999)}`,
        quantity: qty,
        unit_price: rate,
        line_total: parseFloat((qty * rate).toFixed(2)),
      }
    })
    const computedTotal = lineItems.reduce((sum, li) => sum + li.line_total, 0)
    const hasMismatch = Math.random() > 0.8
    const printedTotal = hasMismatch
      ? parseFloat((computedTotal + randomFloat(100, 5000)).toFixed(2))
      : parseFloat(computedTotal.toFixed(2))

    docs.push({
      id: i,
      file_name: `doc_${String(i).padStart(5, '0')}.pdf`,
      source_type: i <= 50 ? 'BULK_FOLDER' : 'UI_UPLOAD',
      invoice_no: `INV-${100000 + i}`,
      hospital_name: randomItem(hospitals),
      patient_name: Math.random() > 0.1 ? randomItem(patients) : null,
      invoice_date: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      printed_total: printedTotal,
      status,
      vector_status: randomItem(vectorStatuses),
      exception_count: status === 'REVIEW_REQUIRED' ? Math.floor(Math.random() * 3) + 1 : 0,
      created_at: `2026-09-${String(Math.floor(Math.random() * 23) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 23)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}:00Z`,
    })
  }
  return docs
}

export const mockDocuments = generateDocuments(120)

export const mockDocumentDetail = {
  1: {
    id: 1,
    file_name: 'doc_00001.pdf',
    source_type: 'BULK_FOLDER',
    file_size_bytes: 245678,
    page_count: 3,
    sha256: 'a3f5e8b9c2d1f4e7a6b5c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    extraction_method: 'NATIVE_TEXT',
    ocr_status: 'NOT_REQUIRED',
    vector_status: 'INDEXED',
    chunk_count: 12,
    status: 'REVIEW_REQUIRED',
    created_at: '2026-09-22T10:30:00Z',
    processed_at: '2026-09-22T10:31:45Z',
    invoice: {
      invoice_no: 'INV-100001',
      hospital_name: 'Lifeline Medical Centre',
      patient_name: 'Aryan Maharaj',
      patient_id: 'PT-2025-001234',
      invoice_date: '2025-06-01',
      insurer: 'Star Health Insurance',
      insurance_policy_no: 'POL-SH-987654',
      diagnosis: 'Acute Appendicitis',
      admission_date: '2025-05-28',
      discharge_date: '2025-06-01',
      printed_total: 105442.33,
      computed_total: 104892.33,
    },
    line_items: [
      { line_no: 1, description: 'Consultation Fee', code: 'CPT-99213', quantity: 1, unit_price: 1500.0, line_total: 1500.0 },
      { line_no: 2, description: 'Appendectomy Surgery', code: 'CPT-44970', quantity: 1, unit_price: 65000.0, line_total: 65000.0 },
      { line_no: 3, description: 'Room Charges (General Ward)', code: 'CPT-99231', quantity: 4, unit_price: 3500.0, line_total: 14000.0 },
      { line_no: 4, description: 'Laboratory Tests', code: 'CPT-80053', quantity: 8, unit_price: 850.0, line_total: 6800.0 },
      { line_no: 5, description: 'Pharmacy', code: 'CPT-99024', quantity: 1, unit_price: 17592.33, line_total: 17592.33 },
    ],
    validation_results: [
      { field: 'invoice_no', status: 'PASS', message: 'Invoice number present and unique' },
      { field: 'patient_name', status: 'PASS', message: 'Patient name present' },
      { field: 'invoice_date', status: 'PASS', message: 'Valid date format' },
      { field: 'printed_total', status: 'FAIL', message: 'Printed total (105,442.33) does not match computed total (104,892.33)' },
      { field: 'diagnosis', status: 'PASS', message: 'Diagnosis present' },
      { field: 'insurer', status: 'PASS', message: 'Insurer present' },
    ],
    exceptions: [
      {
        id: 1,
        type: 'TOTAL_MISMATCH',
        status: 'OPEN',
        message: 'Printed total differs from computed line item sum by INR 550.00',
        created_at: '2026-09-22T10:31:50Z',
      },
    ],
    audit_trail: [
      { action: 'DISCOVERED', timestamp: '2026-09-22T10:30:00Z', detail: 'PDF discovered in data/source_invoices' },
      { action: 'SHA256_COMPUTED', timestamp: '2026-09-22T10:30:05Z', detail: 'Hash computed: a3f5e8b9...' },
      { action: 'TEXT_EXTRACTED', timestamp: '2026-09-22T10:30:20Z', detail: 'Native text extracted from 3 pages' },
      { action: 'JSON_EXTRACTED', timestamp: '2026-09-22T10:30:40Z', detail: 'Invoice fields extracted via Ollama' },
      { action: 'VALIDATED', timestamp: '2026-09-22T10:31:00Z', detail: 'Validation complete: 5 pass, 1 fail' },
      { action: 'STORED', timestamp: '2026-09-22T10:31:15Z', detail: 'Operational data stored in SQL Server' },
      { action: 'CHUNKED', timestamp: '2026-09-22T10:31:25Z', detail: 'Text split into 12 page-aware chunks' },
      { action: 'INDEXED', timestamp: '2026-09-22T10:31:45Z', detail: '12 chunks embedded and upserted into Chroma' },
    ],
  },
}

export function getMockDocumentDetailById(id) {
  return mockDocumentDetail[id] || mockDocumentDetail[1]
}

export const mockExceptions = Array.from({ length: 40 }, (_, i) => {
  const doc = mockDocuments[i % mockDocuments.length]
  const type = randomItem(exceptionTypes)
  return {
    id: i + 1,
    document_id: doc.id,
    file_name: doc.file_name,
    invoice_no: doc.invoice_no,
    hospital_name: doc.hospital_name,
    type,
    status: Math.random() > 0.3 ? 'OPEN' : 'RESOLVED',
    message: getExceptionMessage(type, doc),
    created_at: `2026-09-${String(Math.floor(Math.random() * 23) + 1).padStart(2, '0')}T${String(Math.floor(Math.random() * 23)).padStart(2, '0')}:00:00Z`,
  }
})

function getExceptionMessage(type, doc) {
  const messages = {
    TOTAL_MISMATCH: `Printed total ${doc.printed_total?.toLocaleString('en-IN')} does not match computed total`,
    DUPLICATE_FILE: `SHA-256 hash matches existing document`,
    DUPLICATE_INVOICE: `Invoice number ${doc.invoice_no} already exists`,
    MISSING_PATIENT_NAME: 'Patient name field is empty or unreadable',
    MISSING_DIAGNOSIS: 'Diagnosis field is missing from extracted text',
    MISSING_INSURER: 'Insurance provider not found in invoice',
    MISSING_INVOICE_DATE: 'Invoice date could not be extracted',
    EXTRACTION_FAILED: 'Text extraction and OCR both failed for one or more pages',
  }
  return messages[type] || 'Unknown exception'
}

export const mockIngestionStats = {
  source_folder: 'data/source_invoices',
  discovered_pdfs: 18234,
  processed: 15200,
  succeeded: 14850,
  failed: 120,
  skipped_duplicates: 230,
  indexed_documents: 14830,
  indexed_chunks: 178560,
  last_run: '2026-09-22T10:00:00Z',
  status: 'COMPLETED',
}

let jobProgress = 0

export function mockIngestionJob(jobId) {
  jobProgress = Math.min(jobProgress + Math.random() * 15, 100)
  const status = jobProgress >= 100 ? 'COMPLETED' : 'RUNNING'
  return {
    job_id: jobId,
    status,
    progress: Math.round(jobProgress),
    total_files: 18234,
    processed: Math.round((jobProgress / 100) * 18234),
    succeeded: Math.round((jobProgress / 100) * 17800),
    failed: Math.round((jobProgress / 100) * 120),
    skipped: 230,
    current_file: `doc_${String(Math.round((jobProgress / 100) * 18234)).padStart(5, '0')}.pdf`,
    started_at: '2026-09-23T08:00:00Z',
    estimated_completion: '2026-09-23T12:30:00Z',
  }
}

export function mockUploadResult(files) {
  return {
    uploaded: files.length,
    results: files.map((f, i) => ({
      file_name: f.name,
      document_id: 200 + i,
      status: i === files.length - 1 ? 'REVIEW_REQUIRED' : 'APPROVED',
      message: 'Document processed, extracted, validated and indexed',
    })),
  }
}

export const mockAnalyticsSummary = {
  total_documents: 18234,
  approved_documents: 16500,
  review_required: 1200,
  duplicate_documents: 230,
  total_invoice_value: 2450000000,
  exception_rate: 6.8,
  by_status: [
    { status: 'APPROVED', count: 16500 },
    { status: 'REVIEW_REQUIRED', count: 1200 },
    { status: 'PROCESSING', count: 184 },
    { status: 'FAILED', count: 120 },
    { status: 'DUPLICATE', count: 230 },
  ],
  by_exception_type: [
    { type: 'TOTAL_MISMATCH', count: 450 },
    { type: 'MISSING_PATIENT_NAME', count: 280 },
    { type: 'MISSING_DIAGNOSIS', count: 190 },
    { type: 'MISSING_INSURER', count: 120 },
    { type: 'DUPLICATE_FILE', count: 80 },
    { type: 'DUPLICATE_INVOICE', count: 60 },
    { type: 'MISSING_INVOICE_DATE', count: 45 },
    { type: 'EXTRACTION_FAILED', count: 35 },
  ],
  by_hospital: hospitals.map((h) => ({
    hospital: h,
    count: Math.floor(Math.random() * 3000) + 500,
    total_value: randomFloat(10000000, 500000000),
  })),
  by_insurer: [
    { insurer: 'Star Health', count: 4200, total_value: 580000000 },
    { insurer: 'ICICI Lombard', count: 3800, total_value: 520000000 },
    { insurer: 'HDFC Ergo', count: 3100, total_value: 430000000 },
    { insurer: 'Bajaj Allianz', count: 2800, total_value: 390000000 },
    { insurer: 'New India Assurance', count: 2200, total_value: 310000000 },
    { insurer: 'Other', count: 2134, total_value: 220000000 },
  ],
}

export const mockAnalyticsTrends = {
  monthly: [
    { month: '2025-01', invoices: 1200, total_value: 180000000 },
    { month: '2025-02', invoices: 1450, total_value: 210000000 },
    { month: '2025-03', invoices: 1600, total_value: 235000000 },
    { month: '2025-04', invoices: 1380, total_value: 198000000 },
    { month: '2025-05', invoices: 1750, total_value: 260000000 },
    { month: '2025-06', invoices: 1900, total_value: 285000000 },
    { month: '2025-07', invoices: 1650, total_value: 242000000 },
    { month: '2025-08', invoices: 1820, total_value: 268000000 },
  ],
}

export function mockChatResponse(question) {
  const lowerQ = question.toLowerCase()
  if (lowerQ.includes('no evidence') || lowerQ.includes('unknown') || lowerQ.includes('xyz')) {
    return {
      answer: 'I could not find enough evidence to answer this question across the indexed invoice collection.',
      citations: [],
    }
  }
  return {
    answer:
      'The printed total for invoice INV-100001 from Lifeline Medical Centre is INR 105,442.33. However, the computed total from line items is INR 104,892.33, indicating a total mismatch of INR 550.00.',
    citations: [
      {
        document_id: 1,
        invoice_no: 'INV-100001',
        file_name: 'doc_00001.pdf',
        page_number: 1,
        chunk_id: 'doc-1-page-1-chunk-1',
        snippet: 'Grand Total 105,442.33',
      },
      {
        document_id: 1,
        invoice_no: 'INV-100001',
        file_name: 'doc_00001.pdf',
        page_number: 2,
        chunk_id: 'doc-1-page-2-chunk-3',
        snippet: 'Appendectomy Surgery | Qty: 1 | Rate: 65,000.00 | Total: 65,000.00',
      },
    ],
  }
}

export const mockDashboardStats = {
  total_documents: 18234,
  approved_documents: 16500,
  review_required: 1200,
  duplicate_documents: 230,
  total_invoice_value: 2450000000,
  exception_rate: 6.8,
}

export const mockDashboardTrends = mockAnalyticsTrends.monthly.slice(-6).map((m) => ({
  month: m.month,
  invoices: m.invoices,
  total_value: m.total_value,
}))

export const mockDashboardExceptionBreakdown = mockAnalyticsSummary.by_exception_type.slice(0, 5)

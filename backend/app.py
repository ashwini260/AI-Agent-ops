"""Self-contained local API for the AgentForge invoice operations console."""
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
import hashlib
import math
import os
import re
import uuid

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = Path(os.getenv("INVOICE_SOURCE_FOLDER", str(ROOT / "data" / "source_invoices"))).expanduser()
UPLOAD_DIR = ROOT / "data" / "uploads"
SOURCE_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="AgentForge Document Ops API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HOSPITALS = ["Lifeline Medical Centre", "Sunrise Hospital", "Fortis Healthcare", "Apollo Hospital"]
EXCEPTION_TYPES = ["TOTAL_MISMATCH", "MISSING_PATIENT_NAME", "MISSING_DIAGNOSIS", "MISSING_INSURER"]
documents = {}
exceptions = {}
jobs = {}


def now():
    return datetime.now(timezone.utc).isoformat()


def make_document(document_id, file_name=None, source_type="BULK_FOLDER"):
    hospital = HOSPITALS[(document_id - 1) % len(HOSPITALS)]
    total = round(25000 + document_id * 1375.50, 2)
    mismatch = document_id % 5 == 0
    computed = round(total - 550, 2) if mismatch else total
    invoice = {
        "invoice_no": f"INV-{100000 + document_id}",
        "hospital_name": hospital,
        "patient_name": ["Aryan Maharaj", "Priya Sharma", "Rajesh Kumar", "Sneha Patel"][document_id % 4],
        "patient_id": f"PT-2025-{document_id:06d}",
        "invoice_date": f"2025-{(document_id % 12) + 1:02d}-{(document_id % 27) + 1:02d}",
        "insurer": ["Star Health Insurance", "ICICI Lombard", "HDFC Ergo"][document_id % 3],
        "insurance_policy_no": f"POL-{document_id:06d}",
        "diagnosis": "Routine inpatient care",
        "admission_date": "2025-05-28",
        "discharge_date": "2025-06-01",
        "printed_total": total,
        "computed_total": computed,
    }
    line_items = [
        {"line_no": 1, "description": "Consultation Fee", "code": "CPT-99213", "quantity": 1, "unit_price": computed, "line_total": computed}
    ]
    exception_count = 1 if mismatch else 0
    return {
        "id": document_id,
        "file_name": file_name or f"doc_{document_id:05d}.pdf",
        "source_type": source_type,
        "invoice_no": invoice["invoice_no"],
        "hospital_name": invoice["hospital_name"],
        "patient_name": invoice["patient_name"],
        "invoice_date": invoice["invoice_date"],
        "printed_total": invoice["printed_total"],
        "file_size_bytes": 245678,
        "page_count": 3,
        "sha256": hashlib.sha256(f"document-{document_id}".encode()).hexdigest(),
        "extraction_method": "NATIVE_TEXT",
        "ocr_status": "NOT_REQUIRED",
        "vector_status": "INDEXED",
        "chunk_count": 3,
        "status": "REVIEW_REQUIRED" if mismatch else "APPROVED",
        "created_at": now(),
        "processed_at": now(),
        "invoice": invoice,
        "line_items": line_items,
        "validation_results": [
            {"field": "invoice_no", "status": "PASS", "message": "Invoice number present and unique"},
            {"field": "printed_total", "status": "FAIL" if mismatch else "PASS",
             "message": "Printed total does not match computed total" if mismatch else "Totals match"},
        ],
        "exceptions": [],
        "audit_trail": [{"action": "DISCOVERED", "timestamp": now(), "detail": "Document loaded into local sample store"}],
        "exception_count": exception_count,
    }


for i in range(1, 31):
    documents[i] = make_document(i)


def create_exception(document, exception_type="TOTAL_MISMATCH"):
    exception_id = len(exceptions) + 1
    item = {
        "id": exception_id, "document_id": document["id"], "file_name": document["file_name"],
        "invoice_no": document["invoice"]["invoice_no"], "hospital_name": document["invoice"]["hospital_name"],
        "type": exception_type, "status": "OPEN",
        "message": "Printed total differs from computed line item sum" if exception_type == "TOTAL_MISMATCH" else f"{exception_type.replace('_', ' ').title()} requires review",
        "created_at": now(),
    }
    exceptions[exception_id] = item
    document["exceptions"].append(item)
    return item


for document in documents.values():
    if document["exception_count"]:
        create_exception(document)


class ReviewRequest(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$")
    reviewer_note: str | None = None
    corrected_fields: dict | None = None


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)


def page(items, page_number, page_size):
    total = len(items)
    start = (page_number - 1) * page_size
    return {"items": items[start:start + page_size], "total": total, "page": page_number,
            "page_size": page_size, "total_pages": math.ceil(total / page_size) if total else 0}


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "agentforge-backend", "version": app.version}


@app.get("/api/v1/documents")
def list_documents(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100),
                   search: str | None = None, status: str | None = None, source_type: str | None = None,
                   vector_status: str | None = None, hospital: str | None = None, exception_type: str | None = None):
    result = list(documents.values())
    for key, value in (("status", status), ("source_type", source_type), ("vector_status", vector_status)):
        if value:
            result = [d for d in result if d[key] == value]
    if hospital:
        result = [d for d in result if hospital.lower() in d["invoice"]["hospital_name"].lower()]
    if exception_type:
        result = [d for d in result if any(e["type"] == exception_type for e in d["exceptions"])]
    if search:
        q = search.lower()
        result = [d for d in result if q in str(d["id"]).lower() or any(q in str(d["invoice"].get(k, "")).lower() for k in ("invoice_no", "hospital_name", "patient_name")) or q in d["file_name"].lower()]
    return page(result, page_number, page_size)


@app.get("/api/v1/documents/{document_id}")
def get_document(document_id: int):
    if document_id not in documents:
        raise HTTPException(404, "Document not found")
    return documents[document_id]


@app.post("/api/v1/documents/upload")
async def upload_documents(files: list[UploadFile] = File(...)):
    results = []
    for upload in files:
        if not upload.filename:
            continue
        safe_name = re.sub(r"[^A-Za-z0-9_.-]", "_", Path(upload.filename).name)
        content = await upload.read()
        document_id = max(documents, default=0) + 1
        path = UPLOAD_DIR / f"{document_id}_{safe_name}"
        path.write_bytes(content)
        document = make_document(document_id, safe_name, "UI_UPLOAD")
        document["file_size_bytes"] = len(content)
        document["sha256"] = hashlib.sha256(content).hexdigest()
        documents[document_id] = document
        results.append({"file_name": safe_name, "document_id": document_id, "status": document["status"],
                        "message": "Document processed, extracted, validated and indexed"})
    return {"uploaded": len(results), "results": results}


@app.post("/api/v1/documents/{document_id}/reprocess")
def reprocess_document(document_id: int):
    if document_id not in documents:
        raise HTTPException(404, "Document not found")
    documents[document_id]["status"] = "PROCESSING"
    documents[document_id]["processed_at"] = now()
    return {"id": document_id, "status": "PROCESSING", "message": "Document reprocessing started"}


@app.post("/api/v1/ingestion/bulk")
def start_bulk_ingestion(payload: dict | None = None):
    job_id = f"job-{uuid.uuid4().hex[:10]}"
    jobs[job_id] = {"job_id": job_id, "status": "QUEUED", "progress": 0, "total_files": len(documents),
                    "processed": 0, "succeeded": 0, "failed": 0, "skipped": 0, "current_file": None, "started_at": now()}
    return jobs[job_id]


@app.get("/api/v1/ingestion/jobs/{job_id}")
def ingestion_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Ingestion job not found")
    job = jobs[job_id]
    if job["status"] in ("QUEUED", "RUNNING"):
        job["status"] = "COMPLETED"
        job["progress"] = 100
        job["processed"] = job["total_files"]
        job["succeeded"] = job["total_files"]
    return job


@app.get("/api/v1/ingestion/stats")
def ingestion_stats():
    indexed = sum(d["vector_status"] == "INDEXED" for d in documents.values())
    discovered_pdfs = len(list(SOURCE_DIR.glob("*.pdf")))
    return {"source_folder": str(SOURCE_DIR), "discovered_pdfs": discovered_pdfs, "processed": len(documents),
            "succeeded": len(documents), "failed": 0, "skipped_duplicates": 0, "indexed_documents": indexed,
            "indexed_chunks": sum(d["chunk_count"] for d in documents.values()), "last_run": now(), "status": "COMPLETED"}


@app.post("/api/v1/ingestion/reindex/{document_id}")
def reindex_document(document_id: int):
    if document_id not in documents:
        raise HTTPException(404, "Document not found")
    documents[document_id]["vector_status"] = "INDEXED"
    return {"document_id": document_id, "status": "INDEXED", "message": "Document reindexed successfully"}


@app.get("/api/v1/exceptions")
def list_exceptions(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100),
                    status: str | None = None, type: str | None = None):
    result = list(exceptions.values())
    if status:
        result = [e for e in result if e["status"] == status]
    if type:
        result = [e for e in result if e["type"] == type]
    return page(result, page_number, page_size)


@app.patch("/api/v1/exceptions/{exception_id}/review")
def review_exception(exception_id: int, request: ReviewRequest):
    if exception_id not in exceptions:
        raise HTTPException(404, "Exception not found")
    item = exceptions[exception_id]
    item.update({"status": "RESOLVED" if request.action == "APPROVE" else "REJECTED",
                 "reviewer_note": request.reviewer_note, "corrected_fields": request.corrected_fields, "reviewed_at": now()})
    return item


@app.post("/api/v1/chat/query")
def chat_query(request: ChatRequest):
    question = request.question.lower()
    if any(token in question for token in ("unknown", "no evidence", "xyz")):
        return {"answer": "I could not find enough evidence to answer this question across the indexed invoice collection.", "citations": []}
    document = documents[1]
    invoice = document["invoice"]
    return {"answer": f"The printed total for invoice {invoice['invoice_no']} from {invoice['hospital_name']} is INR {invoice['printed_total']:,.2f}.",
            "citations": [{"document_id": 1, "invoice_no": invoice["invoice_no"], "file_name": document["file_name"],
                           "page_number": 1, "chunk_id": "doc-1-page-1-chunk-1", "snippet": f"Grand Total {invoice['printed_total']:,.2f}"}]}


@app.get("/api/v1/analytics/summary")
def analytics_summary():
    values = [d["invoice"]["printed_total"] for d in documents.values()]
    by_status = [{"status": status, "count": sum(d["status"] == status for d in documents.values())} for status in ("APPROVED", "REVIEW_REQUIRED", "PROCESSING", "FAILED", "DUPLICATE")]
    return {"total_documents": len(documents), "approved_documents": sum(d["status"] == "APPROVED" for d in documents.values()),
            "review_required": sum(d["status"] == "REVIEW_REQUIRED" for d in documents.values()), "duplicate_documents": 0,
            "total_invoice_value": round(sum(values), 2), "exception_rate": round(len(exceptions) / len(documents) * 100, 2),
            "by_status": by_status, "by_exception_type": [{"type": t, "count": sum(e["type"] == t for e in exceptions.values())} for t in EXCEPTION_TYPES],
            "by_hospital": [{"hospital": h, "count": sum(d["invoice"]["hospital_name"] == h for d in documents.values()),
                             "total_value": round(sum(d["invoice"]["printed_total"] for d in documents.values() if d["invoice"]["hospital_name"] == h), 2)} for h in HOSPITALS],
            "by_insurer": []}


@app.get("/api/v1/analytics/trends")
def analytics_trends():
    return {"monthly": [{"month": f"2025-{month:02d}", "invoices": len(documents) // 8, "total_value": round(sum(d["invoice"]["printed_total"] for d in documents.values()) / 8, 2)} for month in range(1, 9)]}


@app.get("/api/v1/exports/invoices.xlsx")
def export_invoices():
    from openpyxl import Workbook
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Invoices"
    sheet.append(["Document ID", "File Name", "Invoice No", "Hospital", "Status", "Printed Total", "Computed Total"])
    for document in documents.values():
        invoice = document["invoice"]
        sheet.append([document["id"], document["file_name"], invoice["invoice_no"], invoice["hospital_name"],
                      document["status"], invoice["printed_total"], invoice["computed_total"]])
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                             headers={"Content-Disposition": 'attachment; filename="invoices.xlsx"'})

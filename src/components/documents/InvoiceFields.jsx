import { AlertCircle } from 'lucide-react'

function FieldRow({ label, value }) {
  const isMissing = value == null || value === '' || value === undefined
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-sm font-medium text-slate-500 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-right">
        {isMissing ? (
          <span className="inline-flex items-center gap-1 text-red-600 font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            Missing
          </span>
        ) : (
          <span className="text-slate-800">{value}</span>
        )}
      </dd>
    </div>
  )
}

export default function InvoiceFields({ invoice }) {
  if (!invoice) {
    return (
      <div className="p-4 text-sm text-slate-500">No invoice data available.</div>
    )
  }

  const computed = invoice.computed_total
  const printed = invoice.printed_total
  const hasMismatch =
    computed != null && printed != null && computed !== printed

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        Invoice Header Fields
      </h3>
      <dl className="space-y-0">
        <FieldRow label="Invoice Number" value={invoice.invoice_no} />
        <FieldRow label="Hospital Name" value={invoice.hospital_name} />
        <FieldRow label="Patient Name" value={invoice.patient_name} />
        <FieldRow label="Patient ID" value={invoice.patient_id} />
        <FieldRow label="Invoice Date" value={invoice.invoice_date} />
        <FieldRow label="Insurer" value={invoice.insurer} />
        <FieldRow label="Insurance Policy No" value={invoice.insurance_policy_no} />
        <FieldRow label="Diagnosis" value={invoice.diagnosis} />
        <FieldRow label="Admission Date" value={invoice.admission_date} />
        <FieldRow label="Discharge Date" value={invoice.discharge_date} />
        <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
          <dt className="text-sm font-medium text-slate-500">Printed Total</dt>
          <dd className="text-sm text-right">
            <span
              className={
                hasMismatch
                  ? 'text-red-600 font-bold'
                  : 'text-slate-800 font-semibold'
              }
            >
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(printed)}
            </span>
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4 py-2">
          <dt className="text-sm font-medium text-slate-500">Computed Total</dt>
          <dd className="text-sm text-right">
            <span
              className={
                hasMismatch
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-800 font-semibold'
              }
            >
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(computed)}
            </span>
          </dd>
        </div>
        {hasMismatch && (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Total mismatch: printed total differs from computed total by{' '}
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(Math.abs(printed - computed))}
          </div>
        )}
      </dl>
    </div>
  )
}

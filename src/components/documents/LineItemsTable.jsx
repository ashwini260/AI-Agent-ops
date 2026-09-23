function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

export default function LineItemsTable({ lineItems }) {
  if (!lineItems || lineItems.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">No line items extracted.</div>
    )
  }

  const total = lineItems.reduce((sum, li) => sum + li.line_total, 0)

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">Line Items</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Description</th>
              <th className="px-3 py-2.5">Code</th>
              <th className="px-3 py-2.5 text-right">Qty</th>
              <th className="px-3 py-2.5 text-right">Unit Price</th>
              <th className="px-3 py-2.5 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lineItems.map((li) => (
              <tr key={li.line_no} className="hover:bg-slate-50">
                <td className="px-3 py-2.5 text-slate-500">{li.line_no}</td>
                <td className="px-3 py-2.5 text-slate-700">{li.description}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                  {li.code}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-700">{li.quantity}</td>
                <td className="px-3 py-2.5 text-right text-slate-700">
                  {formatCurrency(li.unit_price)}
                </td>
                <td className="px-3 py-2.5 text-right font-medium text-slate-800">
                  {formatCurrency(li.line_total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
              <td colSpan={5} className="px-3 py-2.5 text-right text-slate-600">
                Computed Total
              </td>
              <td className="px-3 py-2.5 text-right text-slate-900">
                {formatCurrency(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

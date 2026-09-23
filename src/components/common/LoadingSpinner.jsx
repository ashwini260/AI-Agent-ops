import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', label }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}

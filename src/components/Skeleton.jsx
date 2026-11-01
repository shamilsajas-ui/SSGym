// Glass-style loading placeholders with a soft shimmer.
export function Bone({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function SkeletonCard({ className = '', children }) {
  return (
    <div className={`glass rounded-3xl p-5 sm:p-6 ${className}`} aria-hidden="true">
      {children ?? (
        <>
          <Bone className="h-4 w-24" />
          <Bone className="mt-4 h-8 w-2/3" />
          <Bone className="mt-3 h-4 w-1/2" />
        </>
      )}
    </div>
  )
}

export function LoadingLabel({ text = 'Loading…' }) {
  return <span className="sr-only" role="status">{text}</span>
}

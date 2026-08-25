import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-xl bg-mint', className)} />
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-tc">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-9 w-32" />
    </div>
  )
}

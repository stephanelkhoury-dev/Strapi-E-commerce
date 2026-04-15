export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden">
              <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

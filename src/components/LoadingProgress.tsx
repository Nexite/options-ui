export function LoadingProgress() {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-4 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Loading data... This may take a minute
      </p>
    </div>
  );
} 
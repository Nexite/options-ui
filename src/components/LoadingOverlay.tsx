export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more data...</p>
      </div>
    </div>
  );
} 
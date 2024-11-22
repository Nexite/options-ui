import { LoadingSpinner } from './LoadingSpinner';

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-500/20 dark:bg-gray-900/20 backdrop-blur-[1px] flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
        <LoadingSpinner className="h-8 w-8" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Loading more data...
        </span>
      </div>
    </div>
  );
} 
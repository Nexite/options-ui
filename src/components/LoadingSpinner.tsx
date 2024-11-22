export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 ${className}`} />
  );
} 
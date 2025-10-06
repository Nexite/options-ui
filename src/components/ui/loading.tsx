import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2", 
    lg: "h-8 w-8 border-2",
    xl: "h-12 w-12 border-2"
  };

  return (
    <div 
      className={cn(
        // tapered look: faint ring with a solid colored leading edge
        "animate-spin rounded-full border-muted-foreground/30 border-t-primary",
        sizeClasses[size],
        className
      )} 
    />
  );
}

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  size = "lg", 
  className 
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <LoadingSpinner size={size} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingOverlay({ 
  message = "Loading...", 
  size = "lg" 
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 shadow-lg flex flex-col items-center gap-3 border">
        <LoadingSpinner size={size} />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingButton({ loading, children, className }: LoadingButtonProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </div>
  );
}

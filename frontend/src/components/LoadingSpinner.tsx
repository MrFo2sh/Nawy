interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "black" | "white" | "gray";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  color = "black",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colorClasses = {
    black: "border-gray-900",
    white: "border-white",
    gray: "border-gray-600",
  };

  return (
    <div
      className={`
        animate-spin rounded-full border-2 border-t-transparent
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

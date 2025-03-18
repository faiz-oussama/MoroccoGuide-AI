export function LoadingIndicator() {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <div className="flex items-center gap-2">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-200 opacity-75"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
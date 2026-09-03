import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className={className ?? "animate-spin text-brand-600"} size={28} />
    </div>
  );
}

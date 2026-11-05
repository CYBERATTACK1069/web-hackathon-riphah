import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 swiss-grid-pattern">
      <div className="max-w-md w-full p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            ERROR 404 // RESOURCE NOT FOUND
          </span>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            The requested requisition, candidate scorecard, or route does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


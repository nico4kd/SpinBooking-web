'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="text-center max-w-sm w-full space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#06b6d4]/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-[#06b6d4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M9.363 5.365A7 7 0 0121 12a7 7 0 01-.175 1.6M18.635 18.635A7 7 0 013 12c0-1.386.4-2.678 1.085-3.768"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-white">Sin conexión</h1>
          <p className="text-sm text-gray-400">
            No hay conexión a internet. Revisá tu red y volvé a intentarlo.
          </p>
        </div>

        {/* Retry button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0a0a0f] font-semibold text-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

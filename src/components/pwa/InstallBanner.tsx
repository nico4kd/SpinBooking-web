'use client';

import { useEffect, useState } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { InlineSpinner } from '@/components/ui/spinner';

export function InstallBanner() {
  const { isInstallable, isIOS, isInstalling, installOutcome, promptInstall, dismiss } =
    useInstallPrompt();
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  // When install is accepted, auto-dismiss after showing success
  useEffect(() => {
    if (installOutcome === 'accepted') {
      const timer = setTimeout(() => dismiss(), 3000);
      return () => clearTimeout(timer);
    }
  }, [installOutcome, dismiss]);

  if (!isInstallable) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom">
        <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-96x96.png" alt="SpinBooking" className="w-8 h-8 rounded-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Instalar SpinBooking</p>
              <p className="text-gray-400 text-xs">Acceso rápido desde tu pantalla de inicio</p>
            </div>
            <button
              onClick={dismiss}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!showIOSSteps ? (
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowIOSSteps(true)}
                className="w-full min-h-[44px] bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black font-semibold rounded-xl transition-colors text-sm"
              >
                Ver cómo instalar
              </button>
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-3">
              <div className="bg-gray-800/60 rounded-xl p-3 space-y-2">
                <IOSStep number={1} text="Toca el botón Compartir" icon={<ShareIcon />} />
                <IOSStep number={2} text='Selecciona "Agregar a pantalla de inicio"' icon={<PlusIcon />} />
                <IOSStep number={3} text='Toca "Agregar" para confirmar' icon={<CheckIcon />} />
              </div>
              <button
                onClick={dismiss}
                className="w-full min-h-[44px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Android / Chrome
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {installOutcome === 'accepted' ? (
          <div className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">¡Instalada correctamente!</p>
              <p className="text-gray-400 text-xs">SpinBooking ya está en tu pantalla de inicio</p>
            </div>
          </div>
        ) : installOutcome === 'unavailable' ? (
          /* Prompt not available — show manual instructions as fallback */
          <>
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-96x96.png" alt="SpinBooking" className="w-8 h-8 rounded-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Instalar SpinBooking</p>
                <p className="text-gray-400 text-xs">Instalá manualmente desde el navegador</p>
              </div>
              <button
                onClick={dismiss}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 pb-4 space-y-2">
              <div className="bg-gray-800/60 rounded-xl p-3">
                <p className="text-gray-300 text-xs">
                  Tocá el menú{' '}
                  <span className="font-bold text-white">⋮</span>{' '}
                  del navegador y elegí{' '}
                  <span className="text-cyan-400 font-medium">"Agregar a pantalla de inicio"</span>
                </p>
              </div>
              <button
                onClick={dismiss}
                className="w-full min-h-[44px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                Entendido
              </button>
            </div>
          </>
        ) : (
          /* Normal state — show install button */
          <>
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-96x96.png" alt="SpinBooking" className="w-8 h-8 rounded-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Instalar SpinBooking</p>
                <p className="text-gray-400 text-xs">App rápida · Sin internet · Pantalla completa</p>
              </div>
              <button
                onClick={dismiss}
                disabled={isInstalling}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-3 px-4 pb-4">
              <button
                onClick={dismiss}
                disabled={isInstalling}
                className="flex-1 min-h-[44px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Ahora no
              </button>
              <button
                onClick={promptInstall}
                disabled={isInstalling}
                className="flex-1 min-h-[44px] bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black font-semibold rounded-xl transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <InlineSpinner className="text-black" />
                    Instalando…
                  </>
                ) : (
                  'Instalar'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IOSStep({ number, text, icon }: { number: number; text: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-cyan-400 text-xs font-bold">{number}</span>
      </div>
      <span className="text-gray-300 text-xs flex-1">{text}</span>
      <div className="flex-shrink-0">{icon}</div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.432 2.526M6.684 6.658a3 3 0 10-1.368 5.684" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

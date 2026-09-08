'use client';

export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070809] px-5 text-white">
      <div className="admin-login-panel flex w-full max-w-md flex-col items-center gap-6 border border-white/10 px-7 py-12 backdrop-blur-xl">
        <p className="text-3xl font-black uppercase tracking-[0.18em]">SAMER JABER</p>
        <div className="h-px w-40 overflow-hidden bg-white/10"><div className="h-full w-1/2 animate-pulse bg-sky-300" /></div>
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.16em]">Loading portfolio</p>
          <p className="mt-2 text-sm text-gray-400" dir="rtl">جاري تجهيز الأعمال...</p>
          <p className="mx-auto mt-4 max-w-[18rem] text-xs font-semibold leading-5 text-white/45 sm:hidden">
            For the best experience, open this site on a PC or laptop.
          </p>
        </div>
      </div>
    </main>
  );
}

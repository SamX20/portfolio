'use client';

export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-white">
      <div className="flex flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-white/5 px-6 py-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex h-20 w-20 animate-spin items-center justify-center rounded-full border-4 border-white/10 border-t-sky-300" />
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
          <p className="mt-2 text-sm text-gray-400">Please wait a moment while everything gets ready.</p>
          <p className="mx-auto mt-4 max-w-[18rem] text-xs font-semibold leading-5 text-white/45 sm:hidden">
            For the best experience, open this site on a PC or laptop.
          </p>
        </div>
      </div>
    </main>
  );
}

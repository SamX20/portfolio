export default function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-5">
        <p className="text-[15px] font-semibold tracking-tight">Xsamer</p>
        <div className="h-px w-24 overflow-hidden bg-[var(--line)]">
          <div className="h-full w-1/2 animate-pulse bg-[var(--foreground)]" />
        </div>
      </div>
    </main>
  );
}

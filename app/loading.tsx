import { LogoMark } from '@/components/Logo';

export default function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-5">
        <LogoMark className="h-12 w-12" animate="loop" />
      </div>
    </main>
  );
}

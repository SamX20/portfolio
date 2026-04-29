'use client';

export default function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
      <div className="flex flex-col items-center gap-6 px-6 py-10 rounded-[32px] bg-white/5 border border-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white/10 border-t-purple-400 animate-spin" />
        <div className="text-center">
          <p className="text-lg font-semibold">جاري التحميل...</p>
          <p className="text-sm text-gray-400 mt-2">الرجاء الانتظار لحظة. نحن نتأكد من أن كل شيء جاهز.</p>
        </div>
      </div>
    </main>
  );
}

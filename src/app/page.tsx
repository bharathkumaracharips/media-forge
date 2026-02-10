import MediaDashboard from "@/components/MediaDashboard";

export default function Home() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex justify-between items-center mb-12 animate-fade-in">
        <div className="flex items-center gap-2">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #d946ef)' }}></div>
          <h1 className="text-xl font-bold tracking-tight">MediaForge</h1>
        </div>
      </header>

      <div className="w-full">
        <MediaDashboard />
      </div>

      <footer className="mt-8 py-8 text-center text-sm opacity-40 animate-fade-in" style={{ marginTop: 'auto' }}>
        <p>Powered by Next.js & FFmpeg • Local Privacy Focused</p>
      </footer>
    </main>
  );
}

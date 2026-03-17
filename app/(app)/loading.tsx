export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded-full bg-surface" />
        <div className="h-10 w-80 rounded-2xl bg-surface" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-surface" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="h-4 w-28 rounded-full bg-surface" />
            <div className="mt-6 h-9 w-24 rounded-2xl bg-surface" />
            <div className="mt-4 h-4 w-32 rounded-full bg-surface" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-panel">
            <div className="h-6 w-40 rounded-full bg-surface" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div key={rowIndex} className="h-20 rounded-2xl bg-surface" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

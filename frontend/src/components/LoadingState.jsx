export default function LoadingState({ text = 'Loading...' }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-700">{text}</p>
      </div>
    </main>
  )
}

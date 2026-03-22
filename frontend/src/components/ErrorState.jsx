export default function ErrorState({ text = 'Something went wrong.' }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <p className="text-sm text-rose-700">{text}</p>
      </div>
    </main>
  )
}

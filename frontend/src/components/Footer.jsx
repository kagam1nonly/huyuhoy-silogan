export default function Footer() {
  return (
    <footer className="mt-10 border-t border-[#f4c23d]/20 bg-[#1b2132] text-slate-200">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-6 text-left md:grid-cols-3 md:items-start">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f4c23d]">Follow Us</p>
            <a
              href="https://www.facebook.com/huyuhoy12"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-100 transition-colors hover:text-white"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-[#1877F2]">
                <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16V5c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.4V11H8.7v3h2.2v7h2.6Z" />
              </svg>
              Facebook
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f4c23d]">Where We Are Located</p>
            <p className="inline-flex items-start gap-2 text-sm leading-relaxed text-slate-300">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#f4c23d]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
              <span>#02 Jerome Extension R. Castillo Agdao, Davao City, Philippines, 8000</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f4c23d]">Store Hours</p>
            <p className="inline-flex items-center gap-2 text-sm text-slate-100">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-[#f4c23d]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              Open 24 hours
            </p>
          </div>
        </div>

        <p className="mt-6 text-left text-xs text-slate-400">© 2024 Huyuhoy Silogan. All rights reserved.</p>
      </div>
    </footer>
  )
}

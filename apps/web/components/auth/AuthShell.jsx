'use client'

export default function AuthShell({
  badge,
  title,
  description,
  points = [],
  footnote,
  children,
}) {
  return (
    <div className="min-h-[82vh] bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)] lg:grid-cols-[1.2fr_1fr]">
        <aside className="relative isolate overflow-hidden border-b border-slate-200 bg-slate-950 p-7 text-white sm:p-10 lg:border-b-0 lg:border-r lg:border-r-slate-800">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-white/25 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              {badge}
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">{description}</p>

            {points.length > 0 && (
              <ul className="mt-7 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-slate-200">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-cyan-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {footnote ? (
            <p className="relative mt-10 border-t border-white/15 pt-4 text-xs tracking-wide text-slate-400">{footnote}</p>
          ) : null}
        </aside>

        <section className="bg-white p-6 sm:p-10">{children}</section>
      </div>
    </div>
  )
}

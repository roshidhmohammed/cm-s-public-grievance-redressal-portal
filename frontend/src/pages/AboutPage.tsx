import { PublicLayout } from '../shared/components/PublicLayout'

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">About us</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Purpose, vision and mission</h1>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Purpose</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              To provide citizens with a transparent, easy and accountable channel to raise concerns and seek timely resolution from government offices.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Vision</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              To create a responsive governance model where citizen feedback leads to measurable improvements in public service delivery.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Mission</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              To ensure efficient grievance handling, clear communication and fair action across administrative departments and offices.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">Objectives</h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            <li>• Simplify complaint submission for citizens and ensure access across devices.</li>
            <li>• Route complaints to the correct authority without unnecessary delays.</li>
            <li>• Maintain accountability with status tracking, remarks and resolution reports.</li>
            <li>• Improve public trust through transparent communication and faster service outcomes.</li>
          </ul>
        </div>
      </div>
    </PublicLayout>
  )
}

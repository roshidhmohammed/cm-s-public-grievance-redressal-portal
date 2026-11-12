import { PublicLayout } from '../shared/components/PublicLayout'
import { faqs } from '../shared/constants'

export default function FAQPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">FAQ</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Frequently asked questions</h1>

        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{faq.question}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}

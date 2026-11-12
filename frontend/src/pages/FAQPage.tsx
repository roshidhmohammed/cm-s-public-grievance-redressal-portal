import { PublicLayout } from '../shared/components/PublicLayout'

const faqs = [
  {
    question: 'How do I submit a grievance?',
    answer: 'Create an account as a citizen, select the relevant district and category, and describe the issue along with supporting documents if needed.',
  },
  {
    question: 'How can I track my grievance?',
    answer: 'Use the grievance reference number provided after submission to search the status and view updates from the CMO and departments.',
  },
  {
    question: 'What is the role of the department assignment?',
    answer: 'Complaints are assigned to the relevant department based on the subject matter so that the issue reaches the most appropriate authority.',
  },
  {
    question: 'How are grievances resolved?',
    answer: 'Departments investigate, submit action reports, and the CMO reviews final outcomes before closure and citizen feedback.',
  },
  {
    question: 'Can I provide feedback after resolution?',
    answer: 'Yes, once the grievance reaches a resolved state, citizens can share feedback about satisfaction and the outcome.',
  },
  {
    question: 'What if my grievance is rejected?',
    answer: 'A rejected grievance includes the reason and the citizen may follow the guidance provided by the backend workflow or resubmit if appropriate.',
  },
]

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

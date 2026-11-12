import { PublicLayout } from "../shared/components/PublicLayout";
import { lifecycle } from "../shared/constants";

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          How it works
        </p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">
          Grievance lifecycle
        </h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {lifecycle.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {index + 1}
              </div>
              <p className="text-sm font-semibold text-slate-800">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm leading-7 text-slate-700">
            Each grievance follows a clear review route. The citizen submits the
            complaint and receives a reference number. The CMO examines the
            issue, forwards it to the responsible department, and the department
            carries out the investigation and reports back with action taken.
            The case is then reviewed again by the CMO for final resolution and
            citizen feedback.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

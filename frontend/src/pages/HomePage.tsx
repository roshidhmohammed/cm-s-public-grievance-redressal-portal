import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  getDepartments,
} from "../features/department/services/department-api.service";
import { getApiErrorMessage } from "../lib/axios";
import { PublicLayout } from "../shared/components/PublicLayout";
import { Button } from "../shared/components/Button";
import { faqPreview, processSteps } from "../shared/constants";
import type { Department } from "../features/department/types/department.types";

export default function HomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((error: unknown) =>
        toast.error(getApiErrorMessage(error, "Unable to load departments.")),
      )
      .finally(() => setIsLoadingDepartments(false));
  }, []);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Public grievance platform
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Citizen-first redressal with faster action.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Submit concerns, monitor progress, and get transparent updates
              from the Chief Minister&apos;s Office and the relevant government
              department.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/citizen/login">
                <Button variant="primary">Submit Grievance</Button>
              </Link>
              <Link to="/track">
                <Button variant="secondary">Track Grievance</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              A clear route to resolution
            </p>
            <div className="mt-6 space-y-4">
              {[
                ["01", "Submit a grievance securely"],
                ["02", "Track progress with your reference number"],
                ["03", "Receive updates through the responsible offices"],
              ].map(([number, text]) => (
                <div
                  key={number}
                  className="flex items-start gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-4"
                >
                  <span className="font-bold text-emerald-300">{number}</span>
                  <p className="text-sm text-slate-100">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Featured departments
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Government services that matter
              </h2>
            </div>
            <Link
              to="/departments"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all departments
            </Link>
          </div>

          {isLoadingDepartments ? (
            <p className="text-sm text-slate-600">Loading departments…</p>
          ) : null}
          {!isLoadingDepartments && departments.length === 0 ? (
            <p className="text-sm text-slate-600">
              No active departments are available.
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {departments.slice(0, 6).map((department) => (
              <div
                key={department._id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                  {department.name.slice(0, 2).toUpperCase()}
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">
                  {department.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            A transparent grievance lifecycle
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Frequently asked
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Common questions
              </h2>
            </div>
            <Link
              to="/faq"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all FAQs
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {faqPreview.map((question) => (
              <div
                key={question}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

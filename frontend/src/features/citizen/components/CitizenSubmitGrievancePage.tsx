import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Textarea } from "../../../shared/components/Textarea";
import { CitizenLayout } from "../../../shared/components/citizen/CitizenLayout";
import { submitGrievance } from "../../grievances/grievance.service";
import { getApiErrorMessage } from "../../../lib/axios";
import type { GrievanceFormValues } from "../types/index.ts";
import { grievanceSchema } from "../schemas/grievanceSchema.tsx";
import { categories, districts } from "../../../shared/constants/index.ts";
import { AIGrievanceAssistant } from "./AIGrievanceAssistant";
import type { AIGrievanceAnalysis } from "../types/ai-grievance.types";

export default function CitizenSubmitGrievancePage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GrievanceFormValues>({
    resolver: zodResolver(grievanceSchema),
  });
  const district = useWatch({ control, name: "district" });
  const description = useWatch({ control, name: "description" });

  const handleAIRecommendations = (analysis: AIGrievanceAnalysis) => {
    const categoryMap: Record<string, string> = {
      ROADS: "Infrastructure",
      WATER: "Water & Sanitation",
      ELECTRICITY: "Public Services",
      HEALTH: "Health",
      EDUCATION: "Education",
      SANITATION: "Water & Sanitation",
      PUBLIC_SERVICES: "Public Services",
      OTHER: "Other",
    };
    const recommendedCategory = categoryMap[analysis.suggestedCategory];
    if (recommendedCategory) {
      setValue("category", recommendedCategory, { shouldValidate: true, shouldDirty: true });
    }
    if (!(getValues("subject") ?? "").trim()) {
      setValue("subject", analysis.summary.slice(0, 200), { shouldValidate: true, shouldDirty: true });
    }
  };

  const onSubmit = async (values: GrievanceFormValues) => {
    try {
      const newGrievance = await submitGrievance({
        district: values.district,
        category: values.category,
        subject: values.subject,
        description: values.description,
        attachments: values.supportingDocuments as FileList | undefined,
      });
      toast.success(
        `Grievance submitted successfully. Ref: ${newGrievance.referenceNumber}`,
      );
      navigate(
        `/citizen/track?reference=${encodeURIComponent(newGrievance.referenceNumber)}`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to submit the grievance."));
    }
  };

  return (
    <CitizenLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Citizen portal
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Submit grievance
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              District
              <select
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                {...register("district")}
              >
                <option value="" disabled>
                  Select district
                </option>
                {districts.map((district) => (
                  <option key={district}>{district}</option>
                ))}
              </select>
              {errors.district?.message ? (
                <span className="mt-1 block text-sm text-red-600">
                  {errors.district.message}
                </span>
              ) : null}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
                {...register("category")}
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              {errors.category?.message ? (
                <span className="mt-1 block text-sm text-red-600">
                  {errors.category.message}
                </span>
              ) : null}
            </label>
          </div>

          <div className="mt-5">
            <Input
              label="Subject"
              placeholder="Brief subject of the grievance"
              error={errors.subject?.message}
              {...register("subject")}
            />
          </div>

          <div className="mt-5">
            <Textarea
              label="Detailed description"
              rows={6}
              placeholder="Describe the issue clearly, including locations, timelines, and any relevant information."
              error={errors.description?.message}
              {...register("description")}
            />
          </div>

          <div className="mt-5">
            <AIGrievanceAssistant
              district={district ?? ""}
              description={description ?? ""}
              onAccepted={handleAIRecommendations}
            />
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Supporting images or documents</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600"
                {...register("supportingDocuments")}
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit grievance"}
            </Button>
          </div>
        </form>
      </div>
    </CitizenLayout>
  );
}

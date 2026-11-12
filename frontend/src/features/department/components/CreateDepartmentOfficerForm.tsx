import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { createDepartmentOfficer } from '../../auth/auth.service'
import { getDepartments } from '../services/department-api.service'
import { getApiErrorMessage } from '../../../lib/axios'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { toast } from 'sonner'
import { officerSchema } from '../schemas/officerSchema'
import type { OfficerFormValues } from '../types/department.types'





export function CreateDepartmentOfficerForm() {
  const queryClient = useQueryClient()
  const { data: departments = [], isLoading: isLoadingDepartments, error: departmentsError } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfficerFormValues>({
    resolver: zodResolver(officerSchema),
    defaultValues: { department: '' },
  })

  const createOfficer = useMutation({
    mutationFn: createDepartmentOfficer,
    onSuccess: async () => {
      toast.success('Department officer created successfully.')
      reset()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['unassigned-department-officers'] }),
        queryClient.invalidateQueries({ queryKey: ['cmo-administration'] }),
      ])
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Unable to create the department officer.')),
  })

  const onSubmit = (values: OfficerFormValues) => {
    const { confirmPassword: _confirmPassword, ...officer } = values
    createOfficer.mutate({
      ...officer,
      department: officer.department || undefined,
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Create department officer</h2>
      <p className="mt-2 text-sm text-slate-600">
        Register an officer and optionally assign them to an active department.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Full name"
            placeholder="Officer full name"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Mobile number"
            type="tel"
            placeholder="9876543210"
            autoComplete="tel"
            error={errors.mobile?.message}
            {...register('mobile')}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="officer@department.gov.in"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Password"
            type="password"
            placeholder="At least 12 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Department (optional)
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            disabled={isLoadingDepartments || Boolean(departmentsError)}
            {...register('department')}
          >
            <option value="">Leave unassigned</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>{department.name}</option>
            ))}
          </select>
          {departmentsError ? (
            <span role="alert" className="mt-1 block text-xs text-red-600">
              {getApiErrorMessage(departmentsError, 'Unable to load active departments.')}
            </span>
          ) : null}
          {!isLoadingDepartments && !departmentsError && departments.length === 0 ? (
            <span className="mt-1 block text-xs text-slate-500">No active departments yet; the officer will remain unassigned.</span>
          ) : null}
        </label>

        <Button type="submit" className="w-full" disabled={createOfficer.isPending}>
          {createOfficer.isPending ? 'Creating account…' : 'Create officer account'}
        </Button>
      </form>
    </section>
  )
}

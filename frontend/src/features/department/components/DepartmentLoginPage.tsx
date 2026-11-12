import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { toast } from 'sonner'
import { setAuthenticated } from '../../auth/auth.slice'
import { getRoleHomePath, login } from '../../auth/auth.service'
import { useAppDispatch } from '../../../app/store'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { getApiErrorMessage } from '../../../lib/http'

const loginSchema = z.object({
  email: z.string().email('Enter a valid department email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function DepartmentLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await login(values)
      if (user.role !== 'department_officer') {
        toast.error('This account does not have department officer access.')
        return
      }
      dispatch(setAuthenticated(user))
      toast.success('Department officer login successful.')
      navigate(getRoleHomePath(user.role))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to sign in.'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Department portal</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Officer login</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Email" type="email" placeholder="officer@district.gov.in" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="Enter your password" error={errors.password?.message} {...register('password')} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}

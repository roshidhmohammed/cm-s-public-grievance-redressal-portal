import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { toast } from 'sonner'
import { setAuthenticated } from '../../auth/auth.slice'
import { registerCitizen } from '../../auth/auth.service'
import { useAppDispatch } from '../../../app/store'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { getApiErrorMessage } from '../../../lib/http'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email address'),
    mobile: z.string().min(10, 'Enter a valid mobile number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function CitizenRegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword: _confirmPassword, ...registration } = values
      const user = await registerCitizen(registration)
      dispatch(setAuthenticated(user))
      toast.success('Registration successful. Welcome aboard.')
      navigate('/citizen/dashboard')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to create your account.'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Citizen portal</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Create account</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Full name" placeholder="Your full name" error={errors.fullName?.message} {...register('fullName')} />
            <Input label="Mobile number" placeholder="9876543210" error={errors.mobile?.message} {...register('mobile')} />
          </div>

          <Input label="Email" type="email" placeholder="citizen@example.com" error={errors.email?.message} {...register('email')} />

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Password" type="password" placeholder="Minimum 8 characters" error={errors.password?.message} {...register('password')} />
            <Input label="Confirm password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/citizen/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Login here
          </Link>
        </div>
      </div>
    </div>
  )
}

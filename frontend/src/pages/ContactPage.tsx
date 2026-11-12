import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '../shared/components/Button'
import { Input } from '../shared/components/Input'
import { PublicLayout } from '../shared/components/PublicLayout'
import { Textarea } from '../shared/components/Textarea'
import { submitContactEnquiry } from '../features/contact/contact.service'
import { getApiErrorMessage } from '../lib/http'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await submitContactEnquiry(values)
      toast.success('Your enquiry has been submitted successfully.')
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to submit your enquiry.'))
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Contact us</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Reach the support desk</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Name" placeholder="Enter your full name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="email@example.com" error={errors.email?.message} {...register('email')} />
          </div>

          <div className="mt-5">
            <Input label="Subject" placeholder="How can we help you?" error={errors.subject?.message} {...register('subject')} />
          </div>

          <div className="mt-5">
            <Textarea label="Message" placeholder="Write your message here" rows={6} error={errors.message?.message} {...register('message')} />
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send Enquiry'}
            </Button>
          </div>
        </form>
      </div>
    </PublicLayout>
  )
}

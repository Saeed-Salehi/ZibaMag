import { ChangeEvent, FormEvent, useState } from 'react'
import { createContactMessage } from '@lib/api'
import { useToast } from '@lib/hooks/use-toast'
import { STRINGS } from '@lib/strings'

type ContactFormValues = {
  fullName: string
  mobile: string
  message: string
}

const INITIAL_VALUES: ContactFormValues = {
  fullName: '',
  mobile: '',
  message: '',
}

const ContactForm = () => {
  const { addToast } = useToast()
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      await createContactMessage({
        fullName: values.fullName.trim(),
        mobile: values.mobile.trim(),
        message: values.message.trim(),
      })
      addToast(STRINGS.contactSuccess)
      setValues(INITIAL_VALUES)
    } catch {
      addToast(STRINGS.contactError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 w-full max-w-lg mx-auto"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-sm font-bold text-primary">
          {STRINGS.fullName}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          value={values.fullName}
          onChange={handleChange}
          className="input-primary"
          placeholder={STRINGS.fullName}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mobile" className="text-sm font-bold text-primary">
          {STRINGS.mobileNumber}
        </label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          dir="ltr"
          value={values.mobile}
          onChange={handleChange}
          className="input-primary text-left"
          placeholder="09xxxxxxxxx"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-bold text-primary">
          {STRINGS.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={values.message}
          onChange={handleChange}
          className="input-primary resize-y"
          placeholder={STRINGS.message}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        className="btn-primary mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? STRINGS.loading : STRINGS.sendMessage}
      </button>
    </form>
  )
}

export default ContactForm

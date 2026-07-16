import { ChangeEvent, FormEvent, useState } from 'react'
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // API submission will be wired in a later step
    addToast(STRINGS.contactSuccess)
    setValues(INITIAL_VALUES)
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
        />
      </div>

      <button type="submit" className="btn-primary mt-2">
        {STRINGS.sendMessage}
      </button>
    </form>
  )
}

export default ContactForm

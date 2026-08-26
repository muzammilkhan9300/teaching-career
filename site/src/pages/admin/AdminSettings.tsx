import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAdminSettingsQuery, useUpdateSettings } from '@/admin/adminQueries'
import { TextField } from '@/components/ui/FormFields'
import { useToast } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api'
import { SpinnerIcon } from '@/components/icons/admin'
import { RequireCapability } from '@/admin/components/RequireCapability'
import type { Settings } from '@/types'

type FormState = Omit<Settings, 'id'>

const EMPTY: FormState = {
  phone: '',
  phoneSecondary: '',
  whatsapp: '',
  email: '',
  address: '',
  social: { instagram: '', facebook: '', linkedin: '', youtube: '' },
}

export default function AdminSettings() {
  const { data: settings, isPending } = useAdminSettingsQuery()
  const updateMutation = useUpdateSettings()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(EMPTY)

  useEffect(() => {
    if (settings) {
      const { id: _id, ...rest } = settings
      setForm(rest)
    }
  }, [settings])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateMutation.mutate(form, {
      onSuccess: () => showToast({ variant: 'success', title: 'Settings saved' }),
      onError: (err) => showToast({ variant: 'error', title: 'Save failed', description: err instanceof ApiError ? err.message : undefined }),
    })
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 py-10 text-body">
        <SpinnerIcon size={18} className="animate-spin" />
        Loading settings…
      </div>
    )
  }

  return (
    <RequireCapability capability="manageSettings">
    <div className="flex max-w-2xl flex-col gap-6">
      <Helmet>
        <title>Settings — Admin — TeachingCareer</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-extrabold text-navy">Website Settings</h1>
        <p className="text-sm text-body">Contact details and social links shown across the public site.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-6 shadow-tc">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="phone" label="Primary Phone" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <TextField id="phoneSecondary" label="Secondary Phone" value={form.phoneSecondary ?? ''} onChange={(e) => setForm((f) => ({ ...f, phoneSecondary: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <TextField
              id="whatsapp"
              label="WhatsApp Number"
              required
              placeholder="923128423676"
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
            />
            <p className="text-xs text-body">Digits only, country code first — used to build wa.me links.</p>
          </div>
          <TextField id="email" label="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <TextField id="address" label="Address" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />

        <hr className="border-line" />
        <p className="text-sm font-bold text-navy">Social Links</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="social-instagram" label="Instagram" placeholder="https://instagram.com/..." value={form.social.instagram} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, instagram: e.target.value } }))} />
          <TextField id="social-facebook" label="Facebook" placeholder="https://facebook.com/..." value={form.social.facebook} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, facebook: e.target.value } }))} />
          <TextField id="social-linkedin" label="LinkedIn" placeholder="https://linkedin.com/..." value={form.social.linkedin} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, linkedin: e.target.value } }))} />
          <TextField id="social-youtube" label="YouTube" placeholder="https://youtube.com/..." value={form.social.youtube} onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, youtube: e.target.value } }))} />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-teal px-6 py-3 text-sm font-bold text-white shadow-tc transition hover:bg-teal-dark disabled:opacity-60"
        >
          {updateMutation.isPending ? <SpinnerIcon size={15} className="animate-spin" /> : null}
          {updateMutation.isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
    </RequireCapability>
  )
}

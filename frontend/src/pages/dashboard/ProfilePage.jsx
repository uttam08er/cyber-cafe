import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api'
import { getErrorMessage } from '../../utils/helpers'
import { User, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [pwdForm, setPwdForm] = useState({
    current_password: '', new_password: '', confirm_new: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authAPI.updateProfile(profileForm)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePwdSave = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm_new) {
      toast.error('New passwords do not match')
      return
    }
    setSavingPwd(true)
    try {
      await authAPI.changePassword({
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password,
      })
      setPwdForm({ current_password: '', new_password: '', confirm_new: '' })
      toast.success('Password changed!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-bold text-surface-900 text-xl font-display">Profile Settings</h2>

      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-brand">
          <span className="text-white font-bold text-xl">{user?.full_name?.[0]?.toUpperCase()}</span>
        </div>
        <div>
          <p className="font-bold text-surface-900 text-lg">{user?.full_name}</p>
          <p className="text-surface-500 text-sm">{user?.email}</p>
          <span className="badge bg-brand-50 text-brand-700 mt-1">{user?.role}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-brand-600" />
          <h3 className="font-bold text-surface-900">Personal Information</h3>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={profileForm.full_name}
              onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" value={user?.email} disabled className="input bg-surface-50 text-surface-400 cursor-not-allowed" />
            <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91 99999 99999"
              className="input"
            />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? <><LoadingSpinner size="sm" /> Saving…</> : <><Save size={15} /> Save Changes</>}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-brand-600" />
          <h3 className="font-bold text-surface-900">Change Password</h3>
        </div>
        <form onSubmit={handlePwdSave} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={pwdForm.current_password}
              onChange={e => setPwdForm(f => ({ ...f, current_password: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={pwdForm.new_password}
              onChange={e => setPwdForm(f => ({ ...f, new_password: e.target.value }))}
              placeholder="Min 8 chars, uppercase & number"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={pwdForm.confirm_new}
              onChange={e => setPwdForm(f => ({ ...f, confirm_new: e.target.value }))}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={savingPwd} className="btn-primary">
            {savingPwd ? <><LoadingSpinner size="sm" /> Updating…</> : <><Lock size={15} /> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  )
}

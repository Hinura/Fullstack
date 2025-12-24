'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, X, Edit3 } from 'lucide-react'

interface ProfileEditorProps {
  initialData: {
    username: string
    fullName: string
  }
}

export default function ProfileEditor({ initialData }: ProfileEditorProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState(initialData)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async () => {
    if (!editForm.fullName.trim()) {
      setMessage({ type: 'error', text: 'Full name is required' })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editForm.username.trim() || null,
          fullName: editForm.fullName.trim(),
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setEditing(false)
        router.refresh() // Revalidate server data
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Error updating profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setEditForm(initialData)
    setMessage(null)
  }

  if (!editing) {
    return (
      <Button
        variant="outline"
        onClick={() => setEditing(true)}
        className="rounded-2xl border-sage-blue/30 text-sage-blue hover:bg-sage-blue/10 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
      >
        <Edit3 className="w-4 h-4" />
        <span>Edit Profile</span>
      </Button>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert
          className={`rounded-3xl border-0 shadow-soft ${
            message.type === 'success' ? 'bg-warm-green/10 text-warm-green' : 'bg-coral/10 text-coral'
          }`}
        >
          <AlertDescription className="font-medium">{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Label htmlFor="username" className="text-charcoal font-semibold text-lg">
          Username
        </Label>
        <Input
          id="username"
          value={editForm.username || ''}
          onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
          className="rounded-2xl bg-cream/80 border-sage-blue/30 focus:border-coral focus:ring-coral/20 text-lg py-3"
          placeholder="Enter your username (optional)"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="fullName" className="text-charcoal font-semibold text-lg">
          Full Name
        </Label>
        <Input
          id="fullName"
          value={editForm.fullName}
          onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
          className="rounded-2xl bg-cream/80 border-sage-blue/30 focus:border-coral focus:ring-coral/20 text-lg py-3"
          placeholder="Enter your full name"
        />
      </div>

      <div className="flex space-x-4 pt-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-2xl bg-warm-green hover:bg-warm-green/90 text-cream px-8 py-3 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span className="font-semibold">{saving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={saving}
          className="rounded-2xl border-coral/30 text-coral hover:bg-coral/10 px-8 py-3 hover:scale-105 transition-all duration-200 flex items-center space-x-2 bg-transparent"
        >
          <X className="w-5 h-5" />
          <span className="font-semibold">Cancel</span>
        </Button>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth.action'
import { User } from '@/types'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function UserMenu({ user }: { user: User }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <UserIcon className="h-5 w-5" />
        <span className="hidden sm:inline">{user.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-dark-200 border border-dark-400 shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-gray-400 border-b border-dark-400 mb-2">
              {user.email}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-dark-400"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-dark-400 text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

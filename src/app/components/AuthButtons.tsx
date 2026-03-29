'use client'

import { useClerk, useUser, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function AuthButtons() {
  const { openSignIn, openSignUp } = useClerk()
  const { isSignedIn } = useUser()

  if (isSignedIn) {
    return <UserButton />
  }

  return (
    <>
      <Button variant="outline" onClick={() => openSignIn({})}>
        Sign In
      </Button>
      <Button onClick={() => openSignUp({})}>
        Sign Up
      </Button>
    </>
  )
}

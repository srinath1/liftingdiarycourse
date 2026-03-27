'use client'

import { useClerk, useUser, UserButton } from '@clerk/nextjs'

export default function AuthButtons() {
  const { openSignIn, openSignUp } = useClerk()
  const { isSignedIn } = useUser()

  if (isSignedIn) {
    return <UserButton />
  }

  return (
    <>
      <button
        onClick={() => openSignIn({})}
        className="px-4 py-2 text-sm font-medium bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
      >
        Sign In
      </button>
      <button
        onClick={() => openSignUp({})}
        className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800"
      >
        Sign Up
      </button>
    </>
  )
}

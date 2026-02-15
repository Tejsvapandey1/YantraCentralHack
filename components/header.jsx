import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import React from 'react'

const Header = () => {
  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-400">❤️ Voltics</div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 bg-blue-600 rounded-lg">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="px-4 py-2 border border-slate-600 rounded-lg">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/choose-role">
                <button className="px-4 py-2 bg-blue-600 rounded-lg">
                  Go to Dashboard
                </button>
              </Link>

              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>
  )
}

export default Header

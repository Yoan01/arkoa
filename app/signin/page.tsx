"use client"

import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Twitter, MessageCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function SignInPage() {
  const [email, setEmail] = useState("yoan.ranchon@gmail.com")
  const [password, setPassword] = useState("••••••••••••••••••••")

  return (
    <div className="min-h-screen flex">
      {/* Left side - Dark background with branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted flex-col justify-between p-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 rounded-full relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 50%, 0% 100%)",
                }}
              ></div>
            </div>
          </div>
          <span className="text-muted-foreground text-xl font-semibold">Arkoa</span>
        </div>

        <div className="text-muted-foreground text-lg">"The Open Source alternative to Netlify, Vercel, Heroku."</div>
      </div>

      {/* Right side - Sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 rounded-full relative">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      clipPath: "polygon(0% 0%, 100% 0%, 100% 50%, 0% 100%)",
                    }}
                  ></div>
                </div>
              </div>
              <h1 className="text-2xl font-semibold">Sign in</h1>
            </div>
            <p className="text-sm">Enter your email and password to sign in</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit">
              Login
            </Button>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center space-y-6">
            <Link href="/forgot-password" className={cn(buttonVariants({variant: 'link'}))}>
              Lost your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { signOut } from "@/lib/auth/actions/sign-out"
import { AuthContext } from "@/lib/auth/contexts/auth-context"
import { captureException } from "@sentry/nextjs"
import { useContext } from "react"
import { toast } from "sonner"

export function DebugLogoutForm() {
  const authContext = useContext(AuthContext)

  const onLogout = async () => {
    try {
      await signOut()
      authContext.refresh()
      toast("ログアウトしました。")
    } catch (error) {
      captureException(error)
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <div className="pt-16">
      <Card className="max-w-80 mx-auto">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <p>{authContext.userId}</p>
            <p>{authContext.displayName}</p>
          </div>
          <Button onClick={onLogout}>{"ログアウト"}</Button>
        </CardContent>
      </Card>
    </div>
  )
}

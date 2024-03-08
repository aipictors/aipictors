import { DebugLoginForm } from "@/app/[lang]/debug/_components/debug-login-form"
import { DebugLogoutForm } from "@/app/[lang]/debug/_components/debug-logout-form"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export default async function DebugPage() {
  const user = getCurrentUser()

  if (user === null) {
    return <DebugLoginForm />
  }

  return <DebugLogoutForm />
}

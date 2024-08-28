import type { MetaFunction } from "@remix-run/cloudflare"
import { Card, CardContent } from "~/components/ui/card"
import { META } from "~/config"
import { LoginForm } from "~/routes/($lang)._main.login/components/login-form"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.LOGIN)
}

/**
 * ログイン画面
 */
export default function Login() {
  return (
    <div className="container">
      <Card>
        <CardContent className="p-4">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

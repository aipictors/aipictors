import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Coins, Shield } from "lucide-react"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Card, CardContent } from "~/components/ui/card"
import { AdminAmazonExchangeCard } from "~/routes/($lang)._main.admin.coins/components/admin-amazon-exchange-card"
import { AdminCoinsOperationForm } from "~/routes/($lang)._main.admin.coins/components/admin-coins-operation-form"
import { AdminCoinsSideCards } from "~/routes/($lang)._main.admin.coins/components/admin-coins-side-cards"
import { useAdminCoinsPage } from "~/routes/($lang)._main.admin.coins/hooks/use-admin-coins-page"
import { pageDescription } from "~/routes/($lang)._main.admin.coins/utils/admin-coins-utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "コイン操作",
      enTitle: "Admin Coin Operation",
      description: pageDescription,
      enDescription:
        "Bulk grant or reduce coins for all users, plan segments, or specific user IDs.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

export default function AdminCoinsPage() {
  const state = useAdminCoinsPage()
  const { authContext, hasPermission, viewerLoading } = state

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell
        title="コイン操作"
        description={pageDescription}
        icon={Coins}
      >
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">
            読み込み中...
          </CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell
        title="コイン操作"
        description={pageDescription}
        icon={Coins}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスするにはログインが必要です。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  if (!hasPermission) {
    return (
      <AdminPageShell
        title="コイン操作"
        description={pageDescription}
        icon={Coins}
      >
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページはモデレーターのみ利用できます。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell
      title="コイン操作"
      description={pageDescription}
      icon={Shield}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdminCoinsOperationForm {...state} />

        <AdminCoinsSideCards {...state} />
      </div>

      <AdminAmazonExchangeCard {...state} />
    </AdminPageShell>
  )
}

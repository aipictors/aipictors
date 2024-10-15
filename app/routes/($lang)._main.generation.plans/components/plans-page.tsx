import { PassPlanList } from "~/routes/($lang)._main.plus._index/components/pass-plan-list"
import { graphql } from "gql.tada"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { getAnalytics, logEvent } from "firebase/analytics"
import { config } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { Link } from "@remix-run/react"
import { PlusNoteList } from "~/routes/($lang)._main.plus._index/components/plus-note-list"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 画像生成についての説明
 */
export function PlanPage() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const [mutation, { loading: isLoading }] = useMutation(
    createPassCheckoutSessionMutation,
  )

  const onSelect = async (passType: IntrospectionEnum<"PassType">) => {
    try {
      logEvent(getAnalytics(), config.logEvent.select_item, {
        item_list_id: passType,
        items: [{ item_id: passType, item_name: passType }],
      })
      const result = await mutation({
        variables: { input: { passType: passType } },
      })
      const pageURL = result.data?.createPassCheckoutSession ?? null
      if (pageURL === null) {
        toast(
          t("セッションの作成に失敗しました。", "Failed to create session."),
        )
        return
      }
      window.location.assign(pageURL)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <main className="container relative m-auto flex flex-col space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/generation">
              {t("生成トップ", "Top")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/generation/about">
              {t("生成機能について", "About Image Generation")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/generation/plans">
              {t("プラン", "Plans")}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PassPlanList
        showUpgradePlansOnly={false}
        hideSubmitButton={!authContext.userId}
        onSelect={onSelect}
        isLoading={false}
      />
      <PlusNoteList />
      <div className="flex justify-center gap-x-2 py-4">
        <Link to="/generation/terms">{t("利用規約", "Terms of Service")}</Link>
        <Link to="/specified-commercial-transaction-act">
          {t(
            "特定商取引法に基づく表記",
            "Specified Commercial Transaction Act",
          )}
        </Link>
      </div>
    </main>
  )
}

const createPassCheckoutSessionMutation = graphql(
  `mutation CreatePassCheckoutSession($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }`,
)

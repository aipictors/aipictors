import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { BoxIcon } from "lucide-react"
import { UserModelCard } from "~/components/user-models/user-model-card"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { fetchPublicUserModels } from "~/lib/server/user-models.server"
import { normalizeUserModel } from "~/lib/user-models/client"
import { createMeta } from "~/utils/create-meta"

/**
 * ユーザーが公開しているモデル・LoRA の一覧（サーバーで描画して検索エンジンにも見えるようにする）
 */
export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const userResp = await loaderClient.query({
    query: userQuery,
    variables: { userId: decodeURIComponent(props.params.user) },
  })

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  const result = await fetchPublicUserModels(props.context, {
    userId: userResp.data.user.id,
    sort: "new",
    limit: 60,
  })

  return {
    user: userResp.data.user,
    models: result.models.map(normalizeUserModel),
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (props.data === undefined) return []
  const { user, models } = props.data
  const name = user.name.length > 0 ? user.name : user.login
  const loras = models.filter((model) => model.kind === "LORA").length
  const checkpoints = models.length - loras
  return createMeta(
    META.USERS,
    {
      title: `${name}（@${user.login}）が公開しているAIモデル・LoRA（${models.length}件）`,
      enTitle: `AI models and LoRAs by ${name} (@${user.login})`,
      description: `${name}さんがAipictorsで公開している画像生成AIのモデル${checkpoints}件・LoRA${loras}件の一覧です。Aipictorsの画像生成ですぐに使えます。`,
      enDescription: `${models.length} AI image generation models and LoRAs shared by ${name} on Aipictors, ready to use in Aipictors image generation.`,
      url: models[0]?.thumbnailUrl ?? "",
    },
    props.params.lang,
  )
}

export default function UserModels() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()

  if (data.models.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center text-muted-foreground text-sm">
        <BoxIcon className="size-8" />
        <p>{t("公開しているモデルはまだありません", "No public models yet")}</p>
        <Link to="/models" className="text-primary hover:underline">
          {t("みんなのモデルを見る", "Browse community models")}
        </Link>
      </div>
    )
  }

  return (
    <section className="space-y-3 pb-10">
      <h2 className="font-bold text-base">
        {t("公開しているモデル・LoRA", "Models & LoRAs")}
        <span className="ml-2 font-normal text-muted-foreground text-sm">
          {data.models.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {data.models.map((model) => (
          <UserModelCard key={model.id} model={model} blurSensitive />
        ))}
      </div>
    </section>
  )
}

const userQuery = graphql(
  `query UserModelsPageUser($userId: ID!) {
    user(id: $userId) {
      id
      login
      name
    }
  }`,
)

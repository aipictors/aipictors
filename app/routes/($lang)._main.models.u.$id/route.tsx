import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { ClientOnly } from "remix-utils/client-only"
import { META } from "~/config"
import {
  callUserModelsApi,
  resolveUserModelsProxy,
} from "~/lib/server/user-models.server"
import { normalizeUserModel } from "~/lib/user-models/client"
import type { UserModel } from "~/lib/user-models/types"
import { UserModelDetail } from "~/routes/($lang)._main.models.u.$id/components/user-model-detail"
import { createMeta } from "~/utils/create-meta"

/**
 * メタ情報のためにサーバーで公開情報を取得する（失敗してもクライアントで再取得する）
 */
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const id = params.id ?? ""
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    throw new Response(null, { status: 404 })
  }

  try {
    const resolved = await resolveUserModelsProxy({
      request: new Request(request.url),
      context,
      requireViewer: false,
    })
    if (!resolved.ok) {
      return { model: null as UserModel | null }
    }
    const response = await callUserModelsApi({
      proxy: resolved.value,
      path: `/internal/user-models/${id}`,
      method: "GET",
      fallbackError: "",
    })
    if (response.status === 404) {
      throw new Response(null, { status: 404 })
    }
    const json = (await response.json()) as { data: UserModel | null }
    return { model: json.data ? normalizeUserModel(json.data) : null }
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    return { model: null as UserModel | null }
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=60",
})

export const meta: MetaFunction<typeof loader> = (props) => {
  const model = props.data?.model
  return createMeta(
    META.USER_MODEL,
    {
      title: model?.name ?? "モデル",
      description:
        model?.description?.slice(0, 120) || "Aipictors のみんなのモデル",
      url: model?.thumbnailUrl ?? "",
    },
    props.params.lang,
  )
}

export default function UserModelPage() {
  const data = useLoaderData<typeof loader>()
  const params = useParams()

  return (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      {() => (
        <UserModelDetail
          id={params.id ?? ""}
          initialModel={data.model ?? null}
        />
      )}
    </ClientOnly>
  )
}

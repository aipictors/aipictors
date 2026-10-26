import { loaderClient } from "~/lib/loader-client"
import {
  imageModelCardFragment,
  ImageModelList,
} from "~/routes/($lang)._main.models._index/components/image-model-list"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"
import { FolderCogIcon, SparklesIcon, UploadIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ClientOnly } from "remix-utils/client-only"
import {
  type UserModelBrowserFilters,
  UserModelBrowser,
} from "~/components/user-models/user-model-browser"
import type {
  UserModelBaseModel,
  UserModelKind,
  UserModelRating,
  UserModelSort,
} from "~/lib/user-models/types"

/**
 * モデルの一覧
 */
export async function loader(_props: LoaderFunctionArgs) {
  const resp = await loaderClient.query({
    query: imageModelsQuery,
    variables: {
      limit: 64,
      offset: 0,
    },
  })

  return {
    imageModels: resp.data.imageModels,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.MODELS, undefined, props.params.lang)
}

const parseFilters = (
  searchParams: URLSearchParams,
): Partial<UserModelBrowserFilters> => {
  const kind = searchParams.get("kind")
  const baseModel = searchParams.get("base")
  const sort = searchParams.get("sort")
  const ratings = searchParams.get("ratings")
  return {
    q: searchParams.get("q") ?? "",
    kind: kind === "LORA" || kind === "CHECKPOINT" ? (kind as UserModelKind) : null,
    baseModel: baseModel ? (baseModel as UserModelBaseModel) : null,
    sort: sort === "new" ? ("new" as UserModelSort) : "popular",
    ...(ratings
      ? { ratings: ratings.split(",").filter(Boolean) as UserModelRating[] }
      : {}),
  }
}

export default function ModelsPage() {
  const data = useLoaderData<typeof loader>()

  const [searchParams, setSearchParams] = useSearchParams()

  const tab = searchParams.get("tab") === "official" ? "official" : "community"

  const onFiltersChange = (filters: UserModelBrowserFilters) => {
    const next = new URLSearchParams()
    if (filters.q) next.set("q", filters.q)
    if (filters.kind) next.set("kind", filters.kind)
    if (filters.baseModel) next.set("base", filters.baseModel)
    if (filters.sort !== "popular") next.set("sort", filters.sort)
    const ratings = filters.ratings.join(",")
    if (ratings !== "G,R15") next.set("ratings", ratings)
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  if (data == null) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-3 py-4 md:px-6 md:py-6">
      <section className="relative mb-6 overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-500/10 via-sky-500/10 to-transparent p-5 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 font-medium text-violet-600 text-xs dark:text-violet-400">
              <SparklesIcon className="size-3.5" />
              みんなのモデルで生成できるようになりました
            </p>
            <h1 className="font-bold text-2xl tracking-tight md:text-3xl">モデル</h1>
            <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
              {
                "みんながアップロードした LoRA・チェックポイントを、そのまま画像生成に使えます。気に入ったモデルを開いて「このモデルで生成」を押すだけ。"
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/models/library">
                <FolderCogIcon className="mr-1.5 size-4" />
                モデルライブラリ
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/models/upload">
                <UploadIcon className="mr-1.5 size-4" />
                アップロード
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = new URLSearchParams(searchParams)
          if (value === "official") {
            next.set("tab", "official")
          } else {
            next.delete("tab")
          }
          setSearchParams(next, { replace: true, preventScrollReset: true })
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="community" className="px-4">
            みんなのモデル
          </TabsTrigger>
          <TabsTrigger value="official" className="px-4">
            公式モデル
          </TabsTrigger>
        </TabsList>
        <TabsContent value="community">
          <ClientOnly fallback={<div className="min-h-96" />}>
            {() => (
              <UserModelBrowser
                initialFilters={parseFilters(searchParams)}
                onFiltersChange={onFiltersChange}
              />
            )}
          </ClientOnly>
        </TabsContent>
        <TabsContent value="official">
          <ImageModelList imageModels={data.imageModels} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      ...ImageModelCard
    }
  }`,
  [imageModelCardFragment],
)

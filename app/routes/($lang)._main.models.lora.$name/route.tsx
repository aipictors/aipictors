import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  findLoraDetail,
  listLoraDetails,
} from "~/lib/lora-details/lora-details.server"
import {
  OfficialLoraArticle,
  type OfficialLoraSummary,
} from "~/routes/($lang)._main.models.lora.$name/components/official-lora-article"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  const name = props.params.name?.trim()
  if (!name) {
    throw new Response(null, { status: 404 })
  }

  const detail = findLoraDetail(name)

  // 生成機の公式 LoRA（紹介が無い LoRA もサムネと説明でページを出す）。取れなくても紹介があれば出す
  const loras = await loaderClient
    .query({ query: officialLoraModelsQuery })
    .then((result) => result.data.imageLoraModels)
    .catch(() => [])

  const key = (detail?.name ?? name)
    .replace(/\.safetensors$/i, "")
    .toLowerCase()
  const lora =
    loras.find(
      (item) => item.name.replace(/\.safetensors$/i, "").toLowerCase() === key,
    ) ?? null

  if (!lora && !detail) {
    throw new Response(null, { status: 404 })
  }

  // 同じ種類（genre）の紹介のある LoRA を並べる
  const genre = lora?.genre ?? null
  const genreByName = new Map(loras.map((item) => [item.name, item.genre]))
  const related: OfficialLoraSummary[] = listLoraDetails()
    .filter((item) => item.name !== (detail?.name ?? lora?.name))
    .map((item) => ({
      name: item.name,
      displayName: item.ja.displayName,
      enDisplayName: item.en.displayName,
      imageUrl: item.images[0] ?? null,
      genre: genreByName.get(item.name) ?? null,
    }))
    .sort((a, b) => Number(b.genre === genre) - Number(a.genre === genre))
    .slice(0, 12)

  return {
    lora: lora
      ? {
          name: lora.name,
          description: lora.description ?? "",
          thumbnailImageURL: lora.thumbnailImageURL ?? null,
          genre: lora.genre ?? null,
        }
      : null,
    detail,
    related,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  const data = props.data
  if (!data) {
    return createMeta(
      { ...META.OFFICIAL_LORA, isIndex: false },
      {
        title: "LoRA",
        enTitle: "LoRA",
        description: "",
        enDescription: "",
        url: "",
      },
      props.params.lang,
    )
  }
  const name = data.detail?.name ?? data.lora?.name ?? ""
  const title = data.detail
    ? `${data.detail.ja.displayName}（SDXL 用 LoRA）`
    : `${name}（LoRA）`
  const enTitle = data.detail
    ? `${data.detail.en.displayName} (SDXL LoRA)`
    : `${name} (LoRA)`
  const description = data.detail
    ? `${data.detail.ja.summary} Aipictors の画像生成でそのまま使えます。`
    : `${data.lora?.description ?? ""} Aipictors の画像生成で使える公式 LoRA です。`
  const enDescription = data.detail
    ? `${data.detail.en.summary} Use it right away in the Aipictors image generator.`
    : "An official LoRA you can use in the Aipictors image generator."
  return createMeta(
    META.OFFICIAL_LORA,
    {
      title,
      enTitle,
      description,
      enDescription,
      url:
        data.detail?.images[0] ??
        data.lora?.thumbnailImageURL ??
        config.defaultOgpImageUrl,
    },
    props.params.lang,
  )
}

export default function OfficialLoraPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <OfficialLoraArticle
      lora={data.lora}
      detail={data.detail}
      related={data.related}
    />
  )
}

const officialLoraModelsQuery = graphql(
  `query OfficialLoraModels {
    imageLoraModels {
      id
      name
      description
      thumbnailImageURL
      genre
    }
  }`,
)

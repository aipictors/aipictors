import { useLoaderData } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { createClient as createCmsClient } from "microcms-js-sdk"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { ReleaseItem } from "~/routes/($lang)._main.releases.$id._index/components/release-item"
import { ReleaseCardView } from "~/components/release/release-card-view"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"
import { fetchReleaseList } from "~/utils/micro-cms-release"
import { toReleaseCard } from "~/utils/release-card"

/** 本文の下に出す「ほかのお知らせ」の件数 */
const OTHER_RELEASES_COUNT = 6

export async function loader(props: LoaderFunctionArgs) {
  if (!props.params.id) {
    throw new Response(null, { status: 404 })
  }

  const microCmsClient = createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })

  const [data, list] = await Promise.all([
    microCmsClient.get<MicroCmsApiReleaseResponse>({
      endpoint: `releases?ids=${encodeURIComponent(props.params.id)}`,
    }),
    fetchReleaseList({ limit: OTHER_RELEASES_COUNT + 1 }),
  ])

  const release: MicroCmsApiRelease | undefined = data.contents[0]

  // 消したお知らせ・間違った URL は 404（そのままだと画面が真っ白になっていた）
  if (release === undefined) {
    throw new Response(null, { status: 404 })
  }

  const card = toReleaseCard(release)

  return {
    release: {
      id: release.id,
      title: release.title,
      description: release.description,
      thumbnailUrl: release.thumbnail_url?.url ?? null,
      platform: release.platform?.[0] ?? "",
      tag: release.tag ?? null,
      dateText: card.dateText,
      isNew: card.isNew,
      coverUrl: card.coverUrl,
      excerpt: card.excerpt,
    },
    // 一覧と同じカードの形にして、本文は入れない
    others: list.contents
      .filter((other) => other.id !== release.id)
      .slice(0, OTHER_RELEASES_COUNT)
      .map((other) => toReleaseCard(other)),
  }
}

export const headers: HeadersFunction = () => ({
  // 急なお知らせ変更などの可能性があるため、キャッシュを利用しない
  // "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  const release = props.data?.release
  if (!release) {
    return createMeta(META.RELEASE, undefined, props.params.lang)
  }

  return createMeta(
    META.RELEASE,
    {
      title: release.title,
      enTitle: release.title,
      description: release.excerpt,
      enDescription: release.excerpt,
      url: release.thumbnailUrl ?? release.coverUrl ?? "",
    },
    props.params.lang,
  )
}

export default function Release() {
  const t = useTranslation()
  const data = useLoaderData<typeof loader>()
  const { release } = data

  return (
    <div className="container flex flex-col gap-10 pt-2 pb-12 md:pt-4">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/releases"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("お知らせ一覧", "All announcements")}
        </Link>
      </div>

      <ReleaseItem
        title={release.title}
        description={release.description}
        thumbnailUrl={release.thumbnailUrl}
        platform={release.platform}
        tag={release.tag}
        dateText={release.dateText}
        isNew={release.isNew}
      />

      {data.others.length > 0 && (
        <section className="mx-auto w-full max-w-3xl space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-bold text-lg">
              {t("ほかのお知らせ", "More announcements")}
            </h2>
            <Link
              to="/releases"
              className="inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline"
            >
              {t("すべて見る", "See all")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-1 rounded-2xl border bg-card p-2 sm:grid-cols-2">
            {data.others.map((other) => (
              <ReleaseCardView
                key={other.id}
                release={other}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

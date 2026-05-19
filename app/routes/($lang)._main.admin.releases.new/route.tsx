import { gql, useQuery } from "@apollo/client/index"
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { createClient as createCmsClient, createManagementClient } from "microcms-js-sdk"
import { Megaphone, Sparkles } from "lucide-react"
import { useContext, useState } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { AdminPageShell } from "~/components/admin-page-shell"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { createMeta } from "~/utils/create-meta"
import { toast } from "sonner"

const pageDescription = "microCMS のお知らせと Discord 通知を 1 回の操作で追加します。"

const tagOptions = ["メンテナンス", "お知らせ", "アップデート"] as const

type ReleaseTag = (typeof tagOptions)[number]

type ActionData = {
  error: string | null
  data: {
    id: string
    releaseUrl: string
    discordDelivered: boolean
    warning: string | null
  } | null
}

const DEFAULT_TAG: ReleaseTag = "お知らせ"
const DEFAULT_PLATFORM = "web"
const DISCORD_WEBHOOK_FALLBACK_URL =
  "https://discord.com/api/webhooks/1506267892872908982/OgQO6gWM3lg8N0dByUjUGHiGMCnzQ-CSBjOydRWjpdC-frxk4xl32yqCfdRZ_fvku0Rv"

const viewerQuery = gql`
  query AdminReleaseCreateViewer {
    viewer {
      id
      isModerator
    }
  }
`

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "お知らせ追加",
      enTitle: "Create Announcement",
      description: pageDescription,
      enDescription: "Create a release entry and post it to Discord from one admin page.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

async function parseActionResponse<T>(response: Response): Promise<{
  ok: boolean
  json: T | null
  rawText: string
}> {
  const rawText = await response.text()
  const json = (() => {
    if (!rawText) {
      return null
    }

    try {
      return JSON.parse(rawText) as T
    } catch {
      return null
    }
  })()

  return {
    ok: response.ok,
    json,
    rawText,
  }
}

const toJsonResponse = (body: ActionData, status: number) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
    },
  })
}

const isReleaseTag = (value: string): value is ReleaseTag => {
  return tagOptions.some((tag) => tag === value)
}

const resolveMicroCmsApiKey = (context: ActionFunctionArgs["context"]) => {
  return (
    getServerEnvValue(context, "MICROCMS_RELEASES_API_KEY") ??
    getServerEnvValue(context, "VITE_MICRO_CMS_API_KEY") ??
    config.cms.microCms.apiKey
  )
}

const resolveMicroCmsManagementApiKey = (context: ActionFunctionArgs["context"]) => {
  return (
    getServerEnvValue(context, "MICROCMS_MANAGEMENT_API_KEY") ??
    getServerEnvValue(context, "MICROCMS_RELEASES_MANAGEMENT_API_KEY")
  )
}

const resolveDiscordWebhookUrl = (context: ActionFunctionArgs["context"]) => {
  return (
    getServerEnvValue(context, "DISCORD_RELEASES_WEBHOOK_URL") ??
    getServerEnvValue(context, "DISCORD_WEBHOOK_RELEASES_URL") ??
    DISCORD_WEBHOOK_FALLBACK_URL
  )
}

const resolveGraphqlEndpoint = (context: ActionFunctionArgs["context"]) => {
  return getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
}

const resolveFallbackThumbnailUrl = async (props: { microCmsClient: ReturnType<typeof createCmsClient> }) => {
  const response = await props.microCmsClient.getList<{
    thumbnail_url?: {
      url: string
    } | null
  }>({
    endpoint: "releases",
    queries: {
      limit: 1,
      orders: "-createdAt",
    },
  })

  return response.contents[0]?.thumbnail_url?.url ?? null
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    if (request.method !== "POST") {
      return toJsonResponse({ error: "Method not allowed", data: null }, 405)
    }

    const authorization = request.headers.get("authorization")
    if (!authorization?.startsWith("Bearer ")) {
      return toJsonResponse({ error: "Unauthorized", data: null }, 401)
    }

    const graphqlEndpoint = resolveGraphqlEndpoint(context)
    if (!graphqlEndpoint) {
      return toJsonResponse(
        { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
        500,
      )
    }

    const viewer = await verifyViewerFromGraphQL({
      graphqlEndpoint,
      authorization,
    })

    if (!viewer) {
      return toJsonResponse({ error: "Unauthorized", data: null }, 401)
    }

    if (viewer.userId !== "1") {
      return toJsonResponse(
        { error: "このページは UserID 1 の管理者のみ利用できます。", data: null },
        403,
      )
    }

    let payload: {
      title?: string
      description?: string
      imageUrl?: string
      tag?: string
      isImportant?: boolean
    }

    try {
      payload = (await request.json()) as typeof payload
    } catch {
      return toJsonResponse({ error: "リクエスト形式が不正です。", data: null }, 400)
    }

    const title = payload.title?.trim() ?? ""
    const description = payload.description?.trim() ?? ""
    const imageUrl = payload.imageUrl?.trim() ?? ""
    const selectedTag = payload.tag?.trim() ?? DEFAULT_TAG
    const isImportant = payload.isImportant === true

    if (title.length === 0) {
      return toJsonResponse({ error: "タイトルを入力してください。", data: null }, 400)
    }

    if (description.length === 0) {
      return toJsonResponse({ error: "説明文を入力してください。", data: null }, 400)
    }

    if (!isReleaseTag(selectedTag)) {
      return toJsonResponse({ error: "タグの値が不正です。", data: null }, 400)
    }

    if (imageUrl.length > 0) {
      try {
        new URL(imageUrl)
      } catch {
        return toJsonResponse({ error: "画像 URL の形式が不正です。", data: null }, 400)
      }
    }

    const apiKey = resolveMicroCmsApiKey(context)
    if (!apiKey) {
      return toJsonResponse({ error: "microCMS API キーが未設定です。", data: null }, 500)
    }

    const discordWebhookUrl = resolveDiscordWebhookUrl(context)
    if (!discordWebhookUrl) {
      return toJsonResponse({ error: "Discord webhook URL が未設定です。", data: null }, 500)
    }

    const microCmsClient = createCmsClient({
      serviceDomain: "aipictors",
      apiKey,
    })

    const fallbackThumbnailUrl = await resolveFallbackThumbnailUrl({ microCmsClient })

    if (!fallbackThumbnailUrl) {
      return toJsonResponse(
        {
          error: "既定のサムネイル画像を取得できませんでした。既存のお知らせ画像を確認してください。",
          data: null,
        },
        500,
      )
    }

    let thumbnailUrl = fallbackThumbnailUrl
    let warning: string | null = null

    const managementApiKey = resolveMicroCmsManagementApiKey(context)

    if (imageUrl.length > 0) {
      if (managementApiKey) {
        try {
          const managementClient = createManagementClient({
            serviceDomain: "aipictors",
            apiKey: managementApiKey,
          })

          const uploadedMedia = await managementClient.uploadMedia({
            data: imageUrl,
          })

          thumbnailUrl = uploadedMedia.url
        } catch (error) {
          warning =
            error instanceof Error
              ? `画像の microCMS 登録に失敗したため、既定画像を使用しました: ${error.message}`
              : "画像の microCMS 登録に失敗したため、既定画像を使用しました。"
        }
      } else {
        warning =
          "Management API キーが未設定のため、microCMS の画像は既定画像を使用しました。Discord には指定画像を表示します。"
      }
    }

    const created = await microCmsClient.create<{
      title: string
      description: string
      thumbnail_url: string
      platform: string
      tag: ReleaseTag
      is_important: boolean
    }>({
      endpoint: "releases",
      content: {
        title,
        description,
        thumbnail_url: thumbnailUrl,
        platform: DEFAULT_PLATFORM,
        tag: selectedTag,
        is_important: isImportant,
      },
    })

    const releaseUrl = `https://www.aipictors.com/releases/${created.id}`
    const discordImageUrl = imageUrl || thumbnailUrl
    const discordResponse = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: [`【Aipictors お知らせ】`, title, releaseUrl].join("\n"),
        embeds: [
          {
            title,
            description: description.slice(0, 4000),
            url: releaseUrl,
            image: {
              url: discordImageUrl,
            },
            fields: [
              {
                name: "タグ",
                value: selectedTag,
                inline: true,
              },
              {
                name: "platform",
                value: DEFAULT_PLATFORM,
                inline: true,
              },
              {
                name: "重要なお知らせ",
                value: isImportant ? "はい" : "いいえ",
                inline: true,
              },
            ],
          },
        ],
      }),
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()
      return toJsonResponse(
        {
          error:
            errorText.length > 0
              ? `microCMS への追加は完了しましたが、Discord 通知に失敗しました: ${errorText}`
              : "microCMS への追加は完了しましたが、Discord 通知に失敗しました。",
          data: {
            id: created.id,
            releaseUrl,
            discordDelivered: false,
            warning,
          },
        },
        502,
      )
    }

    return toJsonResponse(
      {
        error: null,
        data: {
          id: created.id,
          releaseUrl,
          discordDelivered: true,
          warning,
        },
      },
      200,
    )
  } catch (error) {
    return toJsonResponse(
      {
        error: error instanceof Error ? error.message : "お知らせの追加に失敗しました。",
        data: null,
      },
      500,
    )
  }
}

export default function AdminReleaseCreatePage() {
  const authContext = useContext(AuthContext)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [tag, setTag] = useState<ReleaseTag>(DEFAULT_TAG)
  const [isImportant, setIsImportant] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ActionData["data"]>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const isUserOne = authContext.isLoggedIn && authContext.userId === "1"
  const hasPermission = Boolean(viewerData?.viewer?.isModerator) && isUserOne

  const withAuthHeader = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      throw new Error("ログインが必要です。")
    }

    const idToken = await getIdToken(currentUser)

    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      const message = "タイトルを入力してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    if (!description.trim()) {
      const message = "説明文を入力してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      const headers = await withAuthHeader()
      const response = await fetch(window.location.pathname, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          tag,
          isImportant,
        }),
      })

      const { json, rawText } = await parseActionResponse<ActionData>(response)

      if (!json) {
        const message = rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")
          ? "サーバーで予期しないエラーが発生しました。"
          : rawText.trim() || "お知らせの追加に失敗しました。"
        setSubmitError(message)
        setResult(null)
        toast.error(message)
        return
      }

      setResult(json.data)

      if (!response.ok || json.error) {
        const message = json.error ?? "お知らせの追加に失敗しました。"
        setSubmitError(message)
        toast.error(message)
        return
      }

      if (json.data?.warning) {
        toast.warning(json.data.warning)
      }

      toast.success("microCMS と Discord へ送信しました。")
      setTitle("")
      setDescription("")
      setImageUrl("")
      setTag(DEFAULT_TAG)
      setIsImportant(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "お知らせの追加に失敗しました。"
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell title="お知らせ追加" description={pageDescription} icon={Megaphone}>
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell title="お知らせ追加" description={pageDescription} icon={Megaphone}>
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
      <AdminPageShell title="お知らせ追加" description={pageDescription} icon={Megaphone}>
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページは UserID 1 の管理者のみ利用できます。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title="お知らせ追加" description={pageDescription} icon={Megaphone}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Sparkles className="size-5 text-cyan-300" />
              microCMS と Discord に同時投稿
            </CardTitle>
            <CardDescription className="text-slate-400">
              画像 URL は任意です。未入力時は既定画像を使います。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-release-title">タイトル</Label>
                <Input
                  id="admin-release-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="例: メンテナンスのお知らせ"
                  className="border-white/10 bg-slate-950/40 text-slate-100"
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-release-description">説明文</Label>
                <Textarea
                  id="admin-release-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="お知らせ本文を入力してください"
                  className="min-h-40 border-white/10 bg-slate-950/40 text-slate-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-release-image-url">画像 URL</Label>
                  <Input
                    id="admin-release-image-url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://example.com/release-image.png"
                    className="border-white/10 bg-slate-950/40 text-slate-100"
                    inputMode="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-release-tag">タグ</Label>
                  <Select value={tag} onValueChange={(value) => setTag(value as ReleaseTag)}>
                    <SelectTrigger
                      id="admin-release-tag"
                      className="border-white/10 bg-slate-950/40 text-slate-100"
                    >
                      <SelectValue placeholder="タグを選択" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100">
                      {tagOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="space-y-1">
                  <Label htmlFor="admin-release-important">重要なお知らせ</Label>
                  <p className="text-slate-400 text-xs">
                    オンにするとホーム上部の重要表示ロジックの対象になります。
                  </p>
                </div>
                <Switch
                  id="admin-release-important"
                  checked={isImportant}
                  onCheckedChange={setIsImportant}
                />
              </div>

              {submitError ? (
                <Alert className="rounded-2xl border-rose-300/20 bg-rose-500/10 text-rose-100">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  {isSubmitting ? "送信中..." : "送信する"}
                </Button>
                <p className="text-slate-400 text-xs">
                  公開 URL は `https://www.aipictors.com/releases/{'{CONTENT_ID}'}` 形式で通知されます。
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle>送信ルール</CardTitle>
            <CardDescription className="text-slate-400">
              このページは UserID 1 の管理者のみ利用できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              タグは「メンテナンス」「お知らせ」「アップデート」から選択します。
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              画像 URL 未入力時は既定の OGP 画像を microCMS 側へ登録します。
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              重要なお知らせをオンにした場合は `is_important: true` で登録されます。
            </div>
            {result ? (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-emerald-100">
                <div className="font-medium">最新の送信結果</div>
                <div className="mt-2 break-all text-xs">ID: {result.id}</div>
                <a
                  href={result.releaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-xs underline underline-offset-4"
                >
                  {result.releaseUrl}
                </a>
                <div className="mt-2 text-xs">
                  Discord 通知: {result.discordDelivered ? "送信済み" : "未送信"}
                </div>
                {result.warning ? (
                  <div className="mt-2 text-xs text-amber-100">注意: {result.warning}</div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  )
}
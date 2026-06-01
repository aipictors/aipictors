import { gql, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { ImagePlus, Loader2Icon, Megaphone, Sparkles, X } from "lucide-react"
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
import { AuthContext } from "~/contexts/auth-context"
import { type ActionData, DEFAULT_TAG, type ReleaseTag, tagOptions } from "~/lib/admin-release-shared"
import { createMeta } from "~/utils/create-meta"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toast } from "sonner"

const pageDescription = "microCMS のお知らせと Discord 通知を 1 回の操作で追加します。"

const ADMIN_RELEASES_API_PATH = "/api/admin/releases"
const MAX_IMAGE_DIMENSION = 2000

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

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("画像の読み込みに失敗しました。"))
    }

    image.src = objectUrl
  })
}

async function convertImageFileToWebpDataUrl(file: File): Promise<string> {
  const image = await loadImageFromFile(file)
  const longestSide = Math.max(image.width, image.height)
  const scale = longestSide > MAX_IMAGE_DIMENSION
    ? MAX_IMAGE_DIMENSION / longestSide
    : 1

  const targetWidth = Math.max(1, Math.round(image.width * scale))
  const targetHeight = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("画像変換の初期化に失敗しました。")
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight)

  return canvas.toDataURL("image/webp", 0.92)
}

export default function AdminReleaseCreatePage() {
  const authContext = useContext(AuthContext)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [tag, setTag] = useState<ReleaseTag>(DEFAULT_TAG)
  const [isImportant, setIsImportant] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ActionData["data"]>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  const getCurrentUserToken = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      throw new Error("ログインが必要です。")
    }

    return getIdToken(currentUser)
  }

  const withAuthHeader = async () => {
    const idToken = await getCurrentUserToken()

    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      const message = "画像ファイルを選択してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    try {
      setIsUploadingImage(true)
      setSubmitError(null)

      const token = await getCurrentUserToken()
      const webpDataUrl = await convertImageFileToWebpDataUrl(file)
      const uploadedImageUrl = await uploadPublicImage(webpDataUrl, token)

      setImageUrl(uploadedImageUrl)
      toast.success("画像をアップロードしました。")
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "画像のアップロードに失敗しました。"
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsUploadingImage(false)
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
      const response = await fetch(ADMIN_RELEASES_API_PATH, {
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
            このページはモデレーターのみ利用できます。
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
              画像は任意です。未設定時は既定画像を使います。
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
                    placeholder="画像を選択すると自動でセットされます"
                    className="border-white/10 bg-slate-950/40 text-slate-100"
                    inputMode="url"
                    disabled={isUploadingImage}
                  />
                  <p className="text-slate-400 text-xs">
                    画像を選択すると WebP に変換し、縦横 2000px 以内に縮小してアップロードします。
                  </p>
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

              <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Label htmlFor="admin-release-image-file" className="sr-only">
                    お知らせ画像
                  </Label>
                  <Input
                    id="admin-release-image-file"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp"
                    onChange={handleImageFileChange}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="border-white/10 bg-white/10 text-slate-100 hover:bg-white/15"
                    disabled={isUploadingImage}
                    onClick={() => {
                      const input = document.getElementById(
                        "admin-release-image-file",
                      ) as HTMLInputElement | null
                      input?.click()
                    }}
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                        画像をアップロード中...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="mr-2 size-4" />
                        画像を選択してアップロード
                      </>
                    )}
                  </Button>
                  {imageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-slate-300 hover:text-slate-100"
                      disabled={isUploadingImage}
                      onClick={() => setImageUrl("")}
                    >
                      <X className="mr-2 size-4" />
                      画像を外す
                    </Button>
                  ) : null}
                </div>

                {imageUrl ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      <img
                        src={imageUrl}
                        alt="お知らせ画像のプレビュー"
                        className="max-h-72 w-full object-contain"
                      />
                    </div>
                    <p className="break-all text-slate-400 text-xs">{imageUrl}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">
                    画像を設定しない場合は、既定画像で登録します。
                  </p>
                )}
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
                  disabled={isSubmitting || isUploadingImage}
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
              画像未入力時は既定の OGP 画像を microCMS 側へ登録します。
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
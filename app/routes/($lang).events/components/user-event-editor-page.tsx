import { useMutation, useQuery } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Suspense, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { uploadPublicImage } from "~/utils/upload-public-image"

type Props = {
  mode: "create" | "edit"
  slug?: string
}

type EditorState = {
  title: string
  description: string
  participationGuide: string
  headerImageUrl: string
  thumbnailImageUrl: string
  mainTag: string
  tagsText: string
  rankingEnabled: boolean
  rankingType: UserEventRankingType
  visibilityType: UserEventVisibilityType
  startAt: string
  endAt: string
  announcementText: string
  isSensitive: boolean
  slug: string
}

type UserEventVisibilityType = "DRAFT" | "PUBLIC" | "PRIVATE"
type UserEventRankingType = "LIKES" | "BOOKMARKS" | "COMMENTS" | "VIEWS"

type ViewerTokenQueryData = {
  viewer: {
    id: string
    token: string | null
  } | null
}

type UserEventForEditData = {
  userEvent: {
    id: string
    slug: string
    title: string
    description: string
    participationGuide: string
    headerImageUrl: string
    thumbnailImageUrl: string
    mainTag: string
    tags: string[]
    rankingEnabled: boolean
    rankingType: UserEventRankingType | null
    visibilityType: UserEventVisibilityType
    startAt: number
    endAt: number
    announcementText: string
    isSensitive: boolean
  } | null
}

type UserEventForEditVars = {
  slug: string
  includeUnpublished: boolean
}

type CreateUserEventMutationData = {
  createUserEvent: {
    id: string
    slug: string
  } | null
}

type CreateUserEventMutationVars = {
  input: {
    slug: string
    title: string
    description: string
    participationGuide: string
    headerImageUrl: string | null
    thumbnailImageUrl: string | null
    mainTag: string
    tags: string[]
    rankingEnabled: boolean
    rankingType: UserEventRankingType | null
    visibilityType: UserEventVisibilityType
    startAt: number
    endAt: number
    announcementText: string
    isSensitive: boolean
  }
}

type UpdateUserEventMutationData = {
  updateUserEvent: {
    id: string
    slug: string
  } | null
}

type UpdateUserEventMutationVars = {
  input: CreateUserEventMutationVars["input"] & {
    slug: string
    nextSlug: string
  }
}

type GenerateUserEventContentMutationData = {
  generateUserEventContent: {
    titles: string[]
    descriptions: string[]
    participationGuides: string[]
    announcementTexts: string[]
  } | null
}

type GenerateUserEventContentMutationVars = {
  input: {
    theme: string
    purpose: string
    tags: string[]
    rankingEnabled: boolean
    rankingType: UserEventRankingType | null
  }
}

const toDateTimeLocalValue = (time: number) => {
  if (!time) {
    return ""
  }

  const date = new Date(time * 1000)

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const createDateTimeLocalValue = (props: {
  hours: number
  minutes: number
}) => {
  const date = new Date()

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(props.hours).padStart(2, "0")
  const minutes = String(props.minutes).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const toUnixTime = (value: string) => {
  if (!value) {
    return 0
  }

  const [datePart, timePart] = value.split("T")

  if (!datePart || !timePart) {
    return 0
  }

  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)

  if ([year, month, day, hours, minutes].some((part) => Number.isNaN(part))) {
    return 0
  }

  return Math.floor(Date.UTC(year, month - 1, day, hours, minutes) / 1000)
}

const parseTags = (tagsText: string, mainTag: string) => {
  const tags = [mainTag, ...tagsText.split(/[\n,、\s]+/)]
  return [
    ...new Set(
      tags.map((tag) => tag.trim().replace(/^#+/, "")).filter(Boolean),
    ),
  ]
}

const GENERATED_SUFFIX_PATTERN = /-[0-9a-f]{8}$/i

const createGeneratedSuffix = () => {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8)
}

const appendGeneratedSuffix = (value: string, maxLength: number) => {
  const normalized = value.trim().replace(/^#+/, "")

  if (!normalized || GENERATED_SUFFIX_PATTERN.test(normalized)) {
    return normalized
  }

  const suffix = `-${createGeneratedSuffix()}`
  const maxBaseLength = Math.max(maxLength - suffix.length, 1)
  const base = normalized.slice(0, maxBaseLength).replace(/-+$/g, "")

  return `${base}${suffix}`
}

const normalizeSlugValue = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}

const normalizeMainTagValue = (value: string) => {
  return value
    .trim()
    .replace(/^#+/, "")
    .replace(/[\s　]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}

const createInitialState = (): EditorState => ({
  title: "",
  description: "",
  participationGuide: "",
  headerImageUrl: "",
  thumbnailImageUrl: "",
  mainTag: "",
  tagsText: "",
  rankingEnabled: false,
  rankingType: "LIKES",
  visibilityType: "DRAFT",
  startAt: createDateTimeLocalValue({ hours: 0, minutes: 0 }),
  endAt: createDateTimeLocalValue({ hours: 23, minutes: 59 }),
  announcementText: "",
  isSensitive: false,
  slug: "",
})

type FieldLabelProps = {
  title: string
  subtitle: string
  required?: boolean
}

function FieldLabel(props: FieldLabelProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="font-medium text-sm">{props.title}</div>
      {props.required && (
        <Badge
          variant="secondary"
          className="border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {props.subtitle}
        </Badge>
      )}
    </div>
  )
}

export function UserEventEditorPage(props: Props) {
  const t = useTranslation()
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const { data: tokenData } = useQuery<ViewerTokenQueryData>(
    viewerTokenQuery as any,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
    },
  )

  const { data: eventData, loading: isEventLoading } = useQuery<
    UserEventForEditData,
    UserEventForEditVars
  >(userEventForEditQuery as any, {
    skip: props.mode !== "edit" || !props.slug,
    variables: {
      slug: props.slug ?? "",
      includeUnpublished: true,
    },
  })

  const event = eventData?.userEvent

  const defaultState = useMemo<EditorState>(() => {
    if (!event) {
      return createInitialState()
    }

    return {
      title: event.title,
      description: event.description,
      participationGuide: event.participationGuide,
      headerImageUrl: event.headerImageUrl,
      thumbnailImageUrl: event.thumbnailImageUrl,
      mainTag: event.mainTag,
      tagsText: event.tags
        .filter((tag: string) => tag !== event.mainTag)
        .join("\n"),
      rankingEnabled: event.rankingEnabled,
      rankingType: event.rankingType ?? "LIKES",
      visibilityType: event.visibilityType,
      startAt: toDateTimeLocalValue(event.startAt),
      endAt: toDateTimeLocalValue(event.endAt),
      announcementText: event.announcementText,
      isSensitive: event.isSensitive,
      slug: event.slug,
    }
  }, [event])

  const [state, setState] = useState<EditorState>(createInitialState())
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isInitialized && (props.mode === "create" || event)) {
      setState(defaultState)
      setIsInitialized(true)
    }
  }, [defaultState, event, isInitialized, props.mode])

  const [createUserEvent] = useMutation<
    CreateUserEventMutationData,
    CreateUserEventMutationVars
  >(createUserEventMutation as any)
  const [updateUserEvent] = useMutation<
    UpdateUserEventMutationData,
    UpdateUserEventMutationVars
  >(updateUserEventMutation as any)
  const [generateUserEventContent] = useMutation<
    GenerateUserEventContentMutationData,
    GenerateUserEventContentMutationVars
  >(generateUserEventContentMutation as any)

  if (authContext.isLoading || (props.mode === "edit" && isEventLoading)) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("ログインが必要です", "Login required")}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (props.mode === "edit" && !event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("イベントが見つかりません", "Event not found")}
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const updateField = <K extends keyof EditorState>(
    key: K,
    value: EditorState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const ensureGeneratedMainTag = () => {
    updateField(
      "mainTag",
      appendGeneratedSuffix(normalizeMainTagValue(state.mainTag), 40),
    )
  }

  const ensureGeneratedSlug = () => {
    updateField(
      "slug",
      appendGeneratedSuffix(normalizeSlugValue(state.slug), 64),
    )
  }

  const onAutoGenerate = async () => {
    try {
      const result = await generateUserEventContent({
        variables: {
          input: {
            theme:
              state.title ||
              state.mainTag ||
              t("交流イベント", "Community event"),
            purpose: state.description,
            tags: parseTags(state.tagsText, state.mainTag),
            rankingEnabled: state.rankingEnabled,
            rankingType: state.rankingEnabled ? state.rankingType : null,
          },
        },
      })

      const generated = result.data?.generateUserEventContent
      if (!generated) {
        throw new Error("failed")
      }

      setState((prev) => ({
        ...prev,
        title: prev.title || generated.titles[0] || prev.title,
        description:
          prev.description || generated.descriptions[0] || prev.description,
        participationGuide:
          prev.participationGuide ||
          generated.participationGuides[0] ||
          prev.participationGuide,
        announcementText:
          prev.announcementText ||
          generated.announcementTexts[0] ||
          prev.announcementText,
      }))

      toast(t("文面候補を反映しました", "Generated suggestions applied"))
    } catch {
      toast(t("自動生成に失敗しました", "Failed to generate content"))
    }
  }

  const resolveImageUrl = async (value: string) => {
    if (!value) {
      return null
    }

    if (value.startsWith("data:")) {
      return uploadPublicImage(value, tokenData?.viewer?.token)
    }

    return value
  }

  const onSave = async () => {
    const tags = parseTags(state.tagsText, state.mainTag)

    if (!state.title.trim() || !state.slug.trim() || !state.mainTag.trim()) {
      toast(
        t(
          "タイトル・リンク名・主タグは必須です",
          "Title, slug, and main tag are required",
        ),
      )
      return
    }

    if (!state.startAt || !state.endAt) {
      toast(t("開催日時を設定してください", "Set start and end time"))
      return
    }

    setIsSaving(true)

    try {
      const headerImageUrl = await resolveImageUrl(state.headerImageUrl)
      const thumbnailImageUrl = await resolveImageUrl(state.thumbnailImageUrl)

      const commonInput = {
        title: state.title.trim(),
        description: state.description,
        participationGuide: state.participationGuide,
        headerImageUrl,
        thumbnailImageUrl,
        mainTag: state.mainTag.trim().replace(/^#+/, ""),
        tags,
        rankingEnabled: state.rankingEnabled,
        rankingType: state.rankingEnabled ? state.rankingType : null,
        visibilityType: state.visibilityType,
        startAt: toUnixTime(state.startAt),
        endAt: toUnixTime(state.endAt),
        announcementText: state.announcementText,
        isSensitive: state.isSensitive,
      }

      if (props.mode === "create") {
        const result = await createUserEvent({
          variables: {
            input: {
              ...commonInput,
              slug: state.slug.trim(),
            },
          },
        })

        const nextSlug = result.data?.createUserEvent?.slug
        toast(t("イベントを作成しました", "Event created"))
        navigate(nextSlug ? `/events/${nextSlug}` : "/my/events")
      } else {
        const result = await updateUserEvent({
          variables: {
            input: {
              ...commonInput,
              slug: props.slug ?? "",
              nextSlug: state.slug.trim(),
            },
          },
        })

        const nextSlug = result.data?.updateUserEvent?.slug
        toast(t("イベントを更新しました", "Event updated"))
        navigate(nextSlug ? `/events/${nextSlug}` : "/my/events")
      }
    } catch {
      toast(t("保存に失敗しました", "Failed to save event"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Suspense fallback={<AppLoadingPage />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-bold text-2xl">
              {props.mode === "create"
                ? t("ユーザーイベント作成", "Create user event")
                : t("ユーザーイベント編集", "Edit user event")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t(
                "タイトル、タグ、開催期間、ランキング設定を入力して企画を公開できます。",
                "Set the title, tags, period, and ranking settings to publish your event.",
              )}
            </p>
          </div>
          <Button variant="secondary" onClick={onAutoGenerate}>
            {t("文面を自動生成", "Generate copy")}
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-medium text-sm">
                  {t("ヘッダー画像", "Header image")}
                </div>
                <CropImageField
                  isHidePreviewImage={false}
                  cropWidth={1200}
                  cropHeight={630}
                  defaultCroppedImage={state.headerImageUrl}
                  fileExtension="webp"
                  onDeleteImage={() => updateField("headerImageUrl", "")}
                  onCropToBase64={(value) =>
                    updateField("headerImageUrl", value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">
                  {t("サムネイル画像", "Thumbnail image")}
                </div>
                <CropImageField
                  isHidePreviewImage={false}
                  cropWidth={800}
                  cropHeight={800}
                  defaultCroppedImage={state.thumbnailImageUrl}
                  fileExtension="webp"
                  onDeleteImage={() => updateField("thumbnailImageUrl", "")}
                  onCropToBase64={(value) =>
                    updateField("thumbnailImageUrl", value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel
                  title={t("タイトル", "Title")}
                  subtitle={t("必須", "Required")}
                  required
                />
                <Input
                  value={state.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  maxLength={80}
                  required
                />
              </div>
              <div className="space-y-2">
                <FieldLabel
                  title={t("リンク名", "Slug")}
                  subtitle={t("必須", "Required")}
                  required
                />
                <Input
                  value={state.slug}
                  onChange={(e) =>
                    updateField("slug", normalizeSlugValue(e.target.value))
                  }
                  onBlur={ensureGeneratedSlug}
                  maxLength={64}
                  required
                />
                <p className="text-muted-foreground text-xs">
                  {t(
                    "URLに使う識別子です。フォーカスを外すと末尾に重複防止用のランダムIDが自動で付きます。",
                    "Used in the event URL. A random suffix is appended on blur to avoid duplicates.",
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-sm">
                {t("説明文", "Description")}
              </div>
              <AutoResizeTextarea
                value={state.description}
                onChange={(e) => updateField("description", e.target.value)}
                maxLength={4000}
              />
            </div>

            <div className="space-y-2">
              <div className="font-medium text-sm">
                {t("参加方法", "How to join")}
              </div>
              <AutoResizeTextarea
                value={state.participationGuide}
                onChange={(e) =>
                  updateField("participationGuide", e.target.value)
                }
                maxLength={1000}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel
                  title={t("主タグ", "Main tag")}
                  subtitle={t("必須", "Required")}
                  required
                />
                <Input
                  value={state.mainTag}
                  onChange={(e) =>
                    updateField("mainTag", e.target.value.replace(/^#+/, ""))
                  }
                  onBlur={ensureGeneratedMainTag}
                  maxLength={40}
                  disabled={props.mode === "edit"}
                  required
                />
                <p className="text-muted-foreground text-xs">
                  {props.mode === "edit"
                    ? t(
                        "主タグを変更すると既存の投稿作品がイベント対象外になるため、編集画面では変更できません。",
                        "Changing the main tag would invalidate existing event submissions, so it cannot be edited here.",
                      )
                    : t(
                        "イベント投稿ボタンから参加すると自動入力される基準タグです。作品一覧の集計や検索導線にも使われます。#は不要です。フォーカスを外すと末尾に重複防止用のランダムIDが自動で付きます。",
                        "This is the primary tag auto-filled for event submissions and used for listing and search. Do not include #. A random suffix is appended on blur to avoid duplicates.",
                      )}
                </p>
              </div>
              <div className="space-y-2">
                <FieldLabel
                  title={t("補助タグ", "Additional tags")}
                  subtitle={t("任意", "Optional")}
                />
                <AutoResizeTextarea
                  value={state.tagsText}
                  onChange={(e) => updateField("tagsText", e.target.value)}
                  maxLength={200}
                />
                <p className="text-muted-foreground text-xs">
                  {t(
                    "主タグ以外の関連語・別表記・検索補助用タグです。主タグは自動で含まれるので、ここには補足したいタグだけを入れてください。#は不要です。",
                    "Use this for related terms, alternate spellings, and discovery tags. The main tag is included automatically, so only add supporting tags here. Do not include #.",
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel
                  title={t("開始日時", "Start at")}
                  subtitle={t("必須", "Required")}
                  required
                />
                <Input
                  type="datetime-local"
                  value={state.startAt}
                  onChange={(e) => updateField("startAt", e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-xs">
                  {t(
                    "日本時間で入力してください。保存時も日本時間の時刻として扱われます。",
                    "Enter the time in JST. It is also saved as a JST wall-clock time.",
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <FieldLabel
                  title={t("終了日時", "End at")}
                  subtitle={t("必須", "Required")}
                  required
                />
                <Input
                  type="datetime-local"
                  value={state.endAt}
                  onChange={(e) => updateField("endAt", e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-xs">
                  {t(
                    "日本時間で入力してください。開始日時より後の時刻を指定してください。",
                    "Enter the time in JST. Choose a time after the start time.",
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-medium text-sm">
                  {t("公開状態", "Visibility")}
                </div>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3"
                  value={state.visibilityType}
                  onChange={(e) =>
                    updateField(
                      "visibilityType",
                      e.target.value as UserEventVisibilityType,
                    )
                  }
                >
                  <option value="DRAFT">{t("下書き", "Draft")}</option>
                  <option value="PUBLIC">{t("公開", "Public")}</option>
                  <option value="PRIVATE">{t("非公開", "Private")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">
                  {t("ランキング方式", "Ranking type")}
                </div>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3"
                  value={state.rankingType}
                  onChange={(e) =>
                    updateField(
                      "rankingType",
                      e.target.value as UserEventRankingType,
                    )
                  }
                  disabled={!state.rankingEnabled}
                >
                  <option value="LIKES">{t("いいね数", "Likes")}</option>
                  <option value="BOOKMARKS">
                    {t("ブックマーク数", "Bookmarks")}
                  </option>
                  <option value="COMMENTS">
                    {t("コメント数", "Comments")}
                  </option>
                  <option value="VIEWS">{t("閲覧数", "Views")}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={state.rankingEnabled}
                  onCheckedChange={(checked) =>
                    updateField("rankingEnabled", checked === true)
                  }
                />
                {t("ランキングあり", "Enable ranking")}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={state.isSensitive}
                  onCheckedChange={(checked) =>
                    updateField("isSensitive", checked === true)
                  }
                />
                {t("成人向けイベント", "Sensitive event")}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-sm">
                {t("告知文", "Announcement text")}
              </div>
              <AutoResizeTextarea
                value={state.announcementText}
                onChange={(e) =>
                  updateField("announcementText", e.target.value)
                }
                maxLength={1000}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 md:flex-row">
          <Button disabled={isSaving} onClick={onSave}>
            {props.mode === "create"
              ? t("作成する", "Create")
              : t("更新する", "Save changes")}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                props.mode === "create" ? "/events" : `/events/${props.slug}`,
              )
            }
          >
            {t("キャンセル", "Cancel")}
          </Button>
        </div>
      </div>
    </Suspense>
  )
}

const viewerTokenQuery = graphql(
  `query ViewerTokenForUserEvent {
    viewer {
      id
      token
    }
  }`,
)

const userEventForEditQuery = graphql(
  `query UserEventForEdit($slug: String!, $includeUnpublished: Boolean!) {
    userEvent(slug: $slug, includeUnpublished: $includeUnpublished) {
      id
      slug
      title
      description
      participationGuide
      headerImageUrl
      thumbnailImageUrl
      mainTag
      tags
      rankingEnabled
      rankingType
      visibilityType
      startAt
      endAt
      announcementText
      isSensitive
    }
  }`,
)

const createUserEventMutation = graphql(
  `mutation CreateUserEvent($input: CreateUserEventInput!) {
    createUserEvent(input: $input) {
      id
      slug
    }
  }`,
)

const updateUserEventMutation = graphql(
  `mutation UpdateUserEvent($input: UpdateUserEventInput!) {
    updateUserEvent(input: $input) {
      id
      slug
    }
  }`,
)

const generateUserEventContentMutation = graphql(
  `mutation GenerateUserEventContent($input: GenerateUserEventContentInput!) {
    generateUserEventContent(input: $input) {
      titles
      descriptions
      participationGuides
      announcementTexts
    }
  }`,
)

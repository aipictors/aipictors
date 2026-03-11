import { useMutation, useQuery } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Suspense, useContext, useEffect, useMemo, useState } from "react"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { toast } from "sonner"

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
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

const toUnixTime = (value: string) => {
  if (!value) {
    return 0
  }

  return Math.floor(new Date(value).getTime() / 1000)
}

const parseTags = (tagsText: string, mainTag: string) => {
  const tags = [mainTag, ...tagsText.split(/[\n,、\s]+/)]
  return [...new Set(tags.map((tag) => tag.trim().replace(/^#+/, "")).filter(Boolean))]
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
  startAt: "",
  endAt: "",
  announcementText: "",
  isSensitive: false,
  slug: "",
})

export function UserEventEditorPage (props: Props) {
  const t = useTranslation()
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const { data: tokenData } = useQuery<ViewerTokenQueryData>(viewerTokenQuery as any, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

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
      tagsText: event.tags.filter((tag: string) => tag !== event.mainTag).join("\n"),
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
          <CardTitle>{t("イベントが見つかりません", "Event not found")}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const updateField = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const onAutoGenerate = async () => {
    try {
      const result = await generateUserEventContent({
        variables: {
          input: {
            theme: state.title || state.mainTag || t("交流イベント", "Community event"),
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
        description: prev.description || generated.descriptions[0] || prev.description,
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
      toast(t("タイトル・リンク名・主タグは必須です", "Title, slug, and main tag are required"))
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
          <CardContent className="pt-6">
            <ScrollArea className="max-h-[75vh] pr-4">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("ヘッダー画像", "Header image")}</div>
                    <CropImageField
                      isHidePreviewImage={false}
                      cropWidth={1200}
                      cropHeight={630}
                      defaultCroppedImage={state.headerImageUrl}
                      fileExtension="webp"
                      onDeleteImage={() => updateField("headerImageUrl", "")}
                      onCropToBase64={(value) => updateField("headerImageUrl", value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("サムネイル画像", "Thumbnail image")}</div>
                    <CropImageField
                      isHidePreviewImage={false}
                      cropWidth={800}
                      cropHeight={800}
                      defaultCroppedImage={state.thumbnailImageUrl}
                      fileExtension="webp"
                      onDeleteImage={() => updateField("thumbnailImageUrl", "")}
                      onCropToBase64={(value) => updateField("thumbnailImageUrl", value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("タイトル", "Title")}</div>
                    <Input value={state.title} onChange={(e) => updateField("title", e.target.value)} maxLength={80} />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("リンク名", "Slug")}</div>
                    <Input value={state.slug} onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} maxLength={64} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-sm">{t("説明文", "Description")}</div>
                  <AutoResizeTextarea value={state.description} onChange={(e) => updateField("description", e.target.value)} maxLength={4000} />
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-sm">{t("参加方法", "How to join")}</div>
                  <AutoResizeTextarea value={state.participationGuide} onChange={(e) => updateField("participationGuide", e.target.value)} maxLength={1000} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("主タグ", "Main tag")}</div>
                    <Input value={state.mainTag} onChange={(e) => updateField("mainTag", e.target.value)} maxLength={40} />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("補助タグ", "Additional tags")}</div>
                    <AutoResizeTextarea value={state.tagsText} onChange={(e) => updateField("tagsText", e.target.value)} maxLength={200} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("開始日時", "Start at")}</div>
                    <Input type="datetime-local" value={state.startAt} onChange={(e) => updateField("startAt", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("終了日時", "End at")}</div>
                    <Input type="datetime-local" value={state.endAt} onChange={(e) => updateField("endAt", e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("公開状態", "Visibility")}</div>
                    <select className="h-10 w-full rounded-md border bg-background px-3" value={state.visibilityType} onChange={(e) => updateField("visibilityType", e.target.value as UserEventVisibilityType)}>
                      <option value="DRAFT">{t("下書き", "Draft")}</option>
                      <option value="PUBLIC">{t("公開", "Public")}</option>
                      <option value="PRIVATE">{t("非公開", "Private")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{t("ランキング方式", "Ranking type")}</div>
                    <select className="h-10 w-full rounded-md border bg-background px-3" value={state.rankingType} onChange={(e) => updateField("rankingType", e.target.value as UserEventRankingType)} disabled={!state.rankingEnabled}>
                      <option value="LIKES">{t("いいね数", "Likes")}</option>
                      <option value="BOOKMARKS">{t("ブックマーク数", "Bookmarks")}</option>
                      <option value="COMMENTS">{t("コメント数", "Comments")}</option>
                      <option value="VIEWS">{t("閲覧数", "Views")}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={state.rankingEnabled} onCheckedChange={(checked) => updateField("rankingEnabled", checked === true)} />
                    {t("ランキングあり", "Enable ranking")}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={state.isSensitive} onCheckedChange={(checked) => updateField("isSensitive", checked === true)} />
                    {t("成人向けイベント", "Sensitive event")}
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-sm">{t("告知文", "Announcement text")}</div>
                  <AutoResizeTextarea value={state.announcementText} onChange={(e) => updateField("announcementText", e.target.value)} maxLength={1000} />
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 md:flex-row">
          <Button disabled={isSaving} onClick={onSave}>
            {props.mode === "create" ? t("作成する", "Create") : t("更新する", "Save changes")}
          </Button>
          <Button variant="secondary" onClick={() => navigate(props.mode === "create" ? "/events" : `/events/${props.slug}`)}>
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
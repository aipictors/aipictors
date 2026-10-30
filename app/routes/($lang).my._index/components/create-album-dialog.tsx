import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ImagePlusIcon, Loader2Icon, PencilIcon, XIcon } from "lucide-react"
import { useContext, useId, useState } from "react"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import { createRandomString } from "~/routes/($lang).generation._index/utils/create-random-string"
import { AlbumWorkLimitUpgradeDialog } from "~/routes/($lang).my._index/components/album-work-limit-upgrade-dialog"
import { SelectCreatedWorksDialogWithIds } from "~/routes/($lang).my._index/components/select-created-works-dialog-with-ids"
import {
  getAlbumWorksLimit,
  getAlbumWorksLimitUpgradeTarget,
} from "~/utils/album-work-limit"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { uploadPublicImage } from "~/utils/upload-public-image"

type Props = {
  children: React.ReactNode
  refetch: () => void
}

const TITLE_MAX_LENGTH = 32
const DESCRIPTION_MAX_LENGTH = 160
const SLUG_MAX_LENGTH = 32

const RATING_OPTIONS: {
  value: IntrospectionEnum<"AlbumRating">
  label: string
}[] = [
  { value: "G", label: "全年齢" },
  { value: "R15", label: "R15" },
  { value: "R18", label: "R18" },
  { value: "R18G", label: "R18G" },
]

/**
 * リンク名の初期値（英数字。あとから変更できる）
 */
const createDefaultSlug = () => {
  return `series${createRandomString(6).toLowerCase()}`
}

/**
 * シリーズ作成ダイアログ
 * 作品選び → タイトル → 説明・カバー・年齢制限 の順に、必要なものほど上に置く。
 * リンク名は自動で入れておき、変えたい人だけ開いて編集する。
 */
export function CreateAlbumDialog(props: Props) {
  const appContext = useContext(AuthContext)
  const formId = useId()

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [thumbnailImageBase64, setThumbnailImageBase64] = useState<string>("")

  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("")

  const [title, setTitle] = useState<string>("")

  const [slug, setSlug] = useState<string>(createDefaultSlug)

  const [isSlugEditing, setIsSlugEditing] = useState(false)

  const [description, setDescription] = useState<string>("")

  const [rating, setRating] = useState<IntrospectionEnum<"AlbumRating">>("G")

  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([])

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  // 「作成する」を押したあとだけ、足りない項目を赤く表示する
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const [createAlbum] = useMutation(createAlbumMutation)

  const { data: token } = useQuery(viewerTokenQuery, { skip: !isOpen })
  const { data: currentPassData } = useQuery(viewerCurrentPassQuery, {
    skip: !isOpen,
  })
  const currentPassType = currentPassData?.viewer?.currentPass?.type ?? null
  const albumWorksMax = getAlbumWorksLimit(currentPassType)
  const nextUpgrade = getAlbumWorksLimitUpgradeTarget(currentPassType)

  const trimmedTitle = title.trim()
  const trimmedSlug = slug.trim()
  const isTitleMissing = trimmedTitle === ""
  const isSlugMissing = trimmedSlug === ""
  const isWorksMissing = selectedWorkIds.length === 0
  const missingItems = [
    isWorksMissing ? "作品" : null,
    isTitleMissing ? "タイトル" : null,
    isSlugMissing ? "リンク名" : null,
  ].filter((item): item is string => item !== null)

  const resetForm = () => {
    setThumbnailImageBase64("")
    setThumbnailPreviewUrl("")
    setTitle("")
    setSlug(createDefaultSlug())
    setIsSlugEditing(false)
    setDescription("")
    setRating("G")
    setSelectedWorkIds([])
    setHasTriedSubmit(false)
    setSubmitError(null)
  }

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // URL に使うので英数字だけにする
    setSlug(event.target.value.replace(/[^a-zA-Z0-9]/g, ""))
    setSubmitError(null)
  }

  /**
   * クロップ完了
   * @param croppedImage クロップした画像
   */
  const onCrop = async (croppedImage: string) => {
    setThumbnailPreviewUrl(croppedImage)
    const base64 = await getBase64FromImageUrl(croppedImage)
    setThumbnailImageBase64(base64)
  }

  const onResetThumbnail = () => {
    setThumbnailImageBase64("")
    setThumbnailPreviewUrl("")
  }

  /**
   * シリーズ作成
   */
  const onCreateAlbum = async () => {
    setHasTriedSubmit(true)
    setSubmitError(null)

    if (appContext.userId === null) {
      toast("ログインしてください")
      return
    }

    if (missingItems.length > 0) {
      return
    }

    setIsCreating(true)

    try {
      const thumbnailUrl = thumbnailImageBase64
        ? await uploadPublicImage(thumbnailImageBase64, token?.viewer?.token)
        : undefined

      await createAlbum({
        variables: {
          input: {
            title: trimmedTitle,
            slug: trimmedSlug,
            description: description.trim(),
            ...(thumbnailUrl && { thumbnailUrl }),
            workIds: selectedWorkIds,
            rating,
          },
        },
      })

      toast("シリーズを作成しました")
      setIsOpen(false)
      resetForm()
      props.refetch()
    } catch (error) {
      // 入力した内容は残したまま、ダイアログの中で理由を出す
      const message = error instanceof Error ? error.message : ""
      if (message.includes("スラッグ")) {
        setIsSlugEditing(true)
        setSubmitError(
          "同じリンク名のシリーズがすでにあります。リンク名を変えてください。",
        )
      } else {
        setSubmitError(
          message && !message.startsWith("Internal")
            ? message
            : "シリーズを作成できませんでした。時間をおいてもう一度お試しください。",
        )
      }
    } finally {
      setIsCreating(false)
    }
  }

  const albumUrlPrefix = `aipictors.com/${appContext.login ?? appContext.userId ?? ""}/albums/`

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (isCreating) return
          setIsOpen(open)
        }}
      >
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent className="flex max-h-[92svh] w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 text-left sm:px-6">
            <DialogTitle>シリーズを作成</DialogTitle>
            <DialogDescription>
              作品をまとめて、シリーズとして公開できます
            </DialogDescription>
          </DialogHeader>

          <form
            id={formId}
            className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6"
            onSubmit={(event) => {
              event.preventDefault()
              onCreateAlbum()
            }}
          >
            {/* 1. 作品 */}
            <section className="space-y-2">
              <FieldLabel
                step={1}
                label="作品を選ぶ"
                required
                error={hasTriedSubmit && isWorksMissing}
                aside={
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      selectedWorkIds.length >= albumWorksMax
                        ? "font-medium text-amber-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {selectedWorkIds.length} / {albumWorksMax}
                  </span>
                }
              />
              <SelectCreatedWorksDialogWithIds
                currentPassType={currentPassType}
                limit={albumWorksMax}
                selectedWorkIds={selectedWorkIds}
                setSelectedWorkIds={setSelectedWorkIds}
              />
              {hasTriedSubmit && isWorksMissing && (
                <p className="text-destructive text-xs">
                  作品を1つ以上選んでください
                </p>
              )}
              {nextUpgrade && selectedWorkIds.length >= albumWorksMax && (
                <button
                  type="button"
                  className="font-medium text-primary text-xs underline-offset-4 hover:underline"
                  onClick={() => setIsUpgradeDialogOpen(true)}
                >
                  {`${nextUpgrade.passType === "LITE" ? "ライト" : "スタンダード"}プランで${nextUpgrade.limit}作品まで追加できます`}
                </button>
              )}
            </section>

            {/* 2. タイトル・リンク名 */}
            <section className="space-y-2">
              <FieldLabel
                step={2}
                label="タイトル"
                required
                htmlFor={`${formId}-title`}
                error={hasTriedSubmit && isTitleMissing}
                aside={
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {title.length} / {TITLE_MAX_LENGTH}
                  </span>
                }
              />
              <Input
                id={`${formId}-title`}
                placeholder="例: 夏のイラストまとめ"
                value={title}
                type="text"
                onChange={(event) => {
                  setTitle(event.target.value)
                }}
                maxLength={TITLE_MAX_LENGTH}
                aria-invalid={hasTriedSubmit && isTitleMissing}
                className={cn(
                  hasTriedSubmit && isTitleMissing && "border-destructive",
                )}
              />
              {hasTriedSubmit && isTitleMissing && (
                <p className="text-destructive text-xs">
                  タイトルを入力してください
                </p>
              )}

              {/* リンク名（自動で入っているので、変えたい人だけ編集する） */}
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                {isSlugEditing ? (
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${formId}-slug`}
                      className="font-medium text-xs"
                    >
                      リンク名（英数字のみ）
                    </label>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <span className="hidden shrink-0 sm:inline">
                        {albumUrlPrefix}
                      </span>
                      <Input
                        id={`${formId}-slug`}
                        value={slug}
                        type="text"
                        onChange={handleSlugChange}
                        maxLength={SLUG_MAX_LENGTH}
                        className={cn(
                          "h-8 text-sm",
                          (isSlugMissing ||
                            submitError?.includes("リンク名")) &&
                            "border-destructive",
                        )}
                        aria-invalid={isSlugMissing}
                      />
                    </div>
                    {isSlugMissing && (
                      <p className="text-destructive text-xs">
                        リンク名を入力してください
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-muted-foreground text-xs">
                      URL: {albumUrlPrefix}
                      <span className="text-foreground">{slug}</span>
                    </p>
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-1 font-medium text-primary text-xs hover:underline"
                      onClick={() => setIsSlugEditing(true)}
                    >
                      <PencilIcon className="size-3" />
                      変更
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 3. 説明・カバー・年齢制限（任意） */}
            <section className="space-y-4">
              <FieldLabel step={3} label="説明・カバー・年齢制限" />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`${formId}-description`}
                    className="font-medium text-sm"
                  >
                    説明
                    <span className="ml-1.5 font-normal text-muted-foreground text-xs">
                      任意
                    </span>
                  </label>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {description.length} / {DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
                <AutoResizeTextarea
                  id={`${formId}-description`}
                  placeholder="どんなシリーズか、ひとことで"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                  }}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                />
              </div>

              <div className="space-y-1.5">
                <p className="font-medium text-sm">
                  カバー画像
                  <span className="ml-1.5 font-normal text-muted-foreground text-xs">
                    任意・未設定なら作品の画像を使います
                  </span>
                </p>
                {thumbnailPreviewUrl ? (
                  <div className="relative overflow-hidden rounded-lg border">
                    <img
                      src={thumbnailPreviewUrl}
                      alt="カバー画像"
                      className="aspect-[1200/627] w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <CropImageField
                        isHidePreviewImage={true}
                        cropWidth={1200}
                        cropHeight={627}
                        onDeleteImage={onResetThumbnail}
                        onCrop={onCrop}
                        fileExtension="webp"
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-8 bg-background/90 backdrop-blur"
                        >
                          変更
                        </Button>
                      </CropImageField>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="size-8 bg-background/90 backdrop-blur"
                        onClick={onResetThumbnail}
                        aria-label="カバー画像を削除"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <CropImageField
                    isHidePreviewImage={true}
                    cropWidth={1200}
                    cropHeight={627}
                    onDeleteImage={onResetThumbnail}
                    onCrop={onCrop}
                    fileExtension="webp"
                  >
                    <button
                      type="button"
                      className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
                    >
                      <ImagePlusIcon className="size-6" />
                      <span className="text-sm">画像を選ぶ</span>
                      <span className="text-xs">
                        横長（1200×627）に切り抜きます
                      </span>
                    </button>
                  </CropImageField>
                )}
                <p className="text-muted-foreground text-xs">
                  カバーにはR18の部分を含めないでください
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-medium text-sm">年齢制限</p>
                <fieldset
                  className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1"
                  aria-label="年齢制限"
                >
                  {RATING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={rating === option.value}
                      onClick={() => setRating(option.value)}
                      className={cn(
                        "rounded-md px-2 py-1.5 font-medium text-sm transition-colors",
                        rating === option.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </fieldset>
                <p className="text-muted-foreground text-xs">
                  {
                    "R15・R18 の作品が入っている場合は、それに合わせて自動で上がります"
                  }
                </p>
              </div>
            </section>
          </form>

          {/* フッター（いつでも押せるように固定） */}
          <div className="shrink-0 space-y-2 border-t bg-background px-4 py-3 sm:px-6">
            {submitError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-destructive text-sm">
                {submitError}
              </p>
            )}
            {hasTriedSubmit && missingItems.length > 0 && (
              <p className="text-destructive text-xs">
                {`${missingItems.join("・")}を入力してください`}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isCreating}
                onClick={() => setIsOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                form={formId}
                disabled={isCreating}
                className="min-w-28"
              >
                {isCreating ? (
                  <>
                    <Loader2Icon className="mr-1.5 size-4 animate-spin" />
                    作成中…
                  </>
                ) : (
                  "作成する"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlbumWorkLimitUpgradeDialog
        currentPassType={currentPassType}
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
      />
    </>
  )
}

type FieldLabelProps = {
  step: number
  label: string
  required?: boolean
  error?: boolean
  htmlFor?: string
  aside?: React.ReactNode
}

function FieldLabel(props: FieldLabelProps) {
  const content = (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full font-semibold text-[11px]",
          props.error
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        {props.step}
      </span>
      <span className="font-semibold text-sm">{props.label}</span>
      {props.required ? (
        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-[10px] text-primary">
          必須
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">任意</span>
      )}
    </span>
  )

  return (
    <div className="flex items-center justify-between gap-2">
      {props.htmlFor ? (
        <label htmlFor={props.htmlFor}>{content}</label>
      ) : (
        <div>{content}</div>
      )}
      {props.aside}
    </div>
  )
}

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      id
      token
    }
  }`,
)

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)

const createAlbumMutation = graphql(
  `mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id
    }
  }`,
)

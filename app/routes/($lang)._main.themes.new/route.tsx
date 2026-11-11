import { gql, useMutation } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { ArrowLeftIcon, Loader2Icon, UsersIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "お題を立てる",
      enTitle: "Host a theme",
      description:
        "期間・参加タグ・対象年齢を決めて、みんなが参加できるお題を立てられます。",
      enDescription: "Host a theme with its own period, entry tag and ratings.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

const RATINGS = [
  { value: "G", label: "全年齢" },
  { value: "R15", label: "R15" },
  { value: "R18", label: "R18" },
  { value: "R18G", label: "R18G" },
] as const

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

/** 日付（JST の壁時計）を、イベント編集画面と同じ「UTC として数えた秒」に */
const toUnix = (dateText: string, hours: number, minutes: number) => {
  const [year, month, day] = dateText.split("-").map(Number)
  return Math.floor(
    Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hours, minutes) / 1000,
  )
}

/** タイトルから参加タグの候補（空白と # を除く・40 文字まで） */
const toTagCandidate = (title: string) =>
  title
    .replace(/^#+/, "")
    .replace(/[\s　#、,]+/g, "")
    .slice(0, 40)

const randomSuffix = () =>
  crypto.randomUUID().replace(/-/g, "").slice(0, 8)

/**
 * ユーザー主催のお題を立てる（ユーザー企画の作成を、お題向けに必要な項目だけにした入り口）
 */
export default function NewUserThemePage() {
  const t = useTranslation()
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  const today = getJstDate(new Date())
  const weekLater = new Date(today.getTime() + 7 * 86400 * 1000)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tag, setTag] = useState("")
  const [tagEdited, setTagEdited] = useState(false)
  const [extraTags, setExtraTags] = useState("")
  const [startDate, setStartDate] = useState(toDateInput(today))
  const [endDate, setEndDate] = useState(toDateInput(weekLater))
  const [ratings, setRatings] = useState<string[]>(["G", "R15"])
  const [rankingEnabled, setRankingEnabled] = useState(true)
  const [createEvent, { loading }] = useMutation(createUserThemeMutation)

  const mainTag = tagEdited ? tag : toTagCandidate(title)

  const toggleRating = (value: string) => {
    setRatings((prev) =>
      prev.includes(value)
        ? prev.length > 1
          ? prev.filter((item) => item !== value)
          : prev
        : [...prev, value],
    )
  }

  const onSubmit = async () => {
    if (title.trim().length === 0) {
      toast(t("タイトルを入力してください", "Enter a title"))
      return
    }
    if (mainTag.trim().length === 0) {
      toast(t("参加タグを入力してください", "Enter an entry tag"))
      return
    }
    const startAt = toUnix(startDate, 0, 0)
    const endAt = toUnix(endDate, 23, 59)
    if (endAt <= startAt) {
      toast(t("終了日は開始日より後にしてください", "End date must be after start"))
      return
    }
    const tags = extraTags
      .split(/[\n,、\s]+/)
      .map((item) => item.trim().replace(/^#+/, ""))
      .filter((item) => item.length > 0 && item !== mainTag)
      .slice(0, 4)
    const slug = `theme-${randomSuffix()}`
    try {
      await createEvent({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim() || null,
            participationGuide: t(
              `作品にタグ「${mainTag}」を付けて投稿すると参加できます。`,
              `Post your work with the tag "${mainTag}" to join.`,
            ),
            mainTag: mainTag.trim(),
            tags,
            rankingEnabled,
            rankingType: rankingEnabled ? "LIKES" : null,
            visibilityType: "PUBLIC",
            startAt,
            endAt,
            ratings,
            slug,
          },
        },
      })
      toast(t("お題を立てました", "Your theme is live"))
      navigate(`/events/${slug}`)
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : t("お題を立てられませんでした", "Could not create the theme"),
      )
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6">
      <Link
        to="/themes"
        className="flex items-center gap-1 text-muted-foreground text-sm hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        {t("お題に戻る", "Back to themes")}
      </Link>
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 font-bold text-2xl">
          <UsersIcon className="size-6" />
          {t("お題を立てる", "Host a theme")}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(
            "あなたが決めたお題で、みんなに作品を投稿してもらえます。参加作品は参加タグで集まり、いいね順のランキングも出せます。",
            "Let everyone post works for your theme. Entries are gathered by tag, with an optional likes ranking.",
          )}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t(
            "立てられる条件: アカウント作成から 7 日以上・作品を 3 件以上公開。1 か月に 20 件・開催中と開催予定は 5 件まで。通報が重なったお題は運営が確認するまで非表示になります。",
            "Requirements: account at least 7 days old with 3 or more public works. Up to 20 per month and 5 active at a time. Themes reported by several people are hidden until reviewed.",
          )}{" "}
          <Link to="/events/new" className="text-primary hover:underline">
            {t("画像や細かい設定もするならこちら", "Need images or more settings?")}
          </Link>
        </p>
      </div>

      <label className="space-y-1.5">
        <span className="font-medium text-sm">{t("タイトル", "Title")}</span>
        <Input
          value={title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("例: 雨の日の猫", "e.g. Cats on a rainy day")}
        />
      </label>

      <label className="space-y-1.5">
        <span className="font-medium text-sm">{t("説明", "Description")}</span>
        <Textarea
          value={description}
          maxLength={4000}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t(
            "どんな作品を募集したいか、決まりごとなど",
            "What kind of works you are looking for, rules, etc.",
          )}
          className="min-h-28"
        />
      </label>

      <label className="space-y-1.5">
        <span className="font-medium text-sm">
          {t("参加タグ", "Entry tag")}
        </span>
        <Input
          value={mainTag}
          maxLength={40}
          onChange={(event) => {
            setTag(event.target.value.replace(/^#+/, ""))
            setTagEdited(true)
          }}
          placeholder={t("タイトルから自動で入ります", "Filled from the title")}
        />
        <span className="text-muted-foreground text-xs">
          {t(
            "このタグが付いた作品が参加作品になります。ほかのお題で使っているタグは使えません。",
            "Works with this tag become entries. Tags used by other themes can't be used.",
          )}
        </span>
      </label>

      <label className="space-y-1.5">
        <span className="font-medium text-sm">
          {t("関連タグ（任意・4 個まで）", "Related tags (optional, up to 4)")}
        </span>
        <Input
          value={extraTags}
          onChange={(event) => setExtraTags(event.target.value)}
          placeholder={t("例: 猫 雨", "e.g. cat rain")}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="font-medium text-sm">{t("開始日", "Start")}</span>
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label className="space-y-1.5">
          <span className="font-medium text-sm">
            {t("終了日（31 日まで）", "End (max 31 days)")}
          </span>
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <span className="font-medium text-sm">
          {t("参加できる作品の対象年齢", "Allowed ratings")}
        </span>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((rating) => (
            <button
              key={rating.value}
              type="button"
              onClick={() => toggleRating(rating.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                ratings.includes(rating.value)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {rating.label}
            </button>
          ))}
        </div>
        {(ratings.includes("R18") || ratings.includes("R18G")) && (
          <span className="text-muted-foreground text-xs">
            {t(
              "R18 を含むお題は、センシティブの一覧にだけ表示されます。",
              "Themes that include R18 are only listed in the sensitive section.",
            )}
          </span>
        )}
      </div>

      <label className="flex items-center justify-between gap-3 rounded-xl border p-3">
        <span className="space-y-0.5">
          <span className="block font-medium text-sm">
            {t("いいね順のランキングを出す", "Show a likes ranking")}
          </span>
          <span className="block text-muted-foreground text-xs">
            {t("参加作品をいいねの数で並べます", "Ranks entries by likes")}
          </span>
        </span>
        <Switch checked={rankingEnabled} onCheckedChange={setRankingEnabled} />
      </label>

      {authContext.isNotLoggedIn ? (
        <LoginDialogButton
          label={t("ログインしてお題を立てる", "Sign in to host")}
          isWidthFull={true}
        />
      ) : (
        <Button
          size="lg"
          className="rounded-full"
          disabled={loading || authContext.isLoading}
          onClick={onSubmit}
        >
          {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
          {t("お題を立てる", "Host this theme")}
        </Button>
      )}
    </div>
  )
}

const createUserThemeMutation = gql`
  mutation CreateUserTheme($input: CreateUserEventInput!) {
    createUserEvent(input: $input) {
      id
      slug
    }
  }
`

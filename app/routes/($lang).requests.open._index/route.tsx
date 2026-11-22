import type { MetaFunction } from "@remix-run/cloudflare"
import { useSearchParams } from "@remix-run/react"
import { EyeOff, Loader2, Megaphone, Plus, ShieldCheck } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import {
  appFilterChipClassName,
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import { OpenRequestCard } from "~/components/requests/open-request-ui"
import {
  readAgeConfirmed,
  writeAgeConfirmed,
} from "~/components/requests/request-showcase"
import type { RequestUsers } from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useContentMode } from "~/hooks/use-content-mode"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { type OpenRequest, openRequestsGet } from "~/lib/open-requests-api"
import { cn } from "~/lib/utils"
import { HomeHeaderContentToggle } from "~/routes/($lang)._main._index/components/home-header-content-toggle"
import { writeContentMode } from "~/utils/content-mode"

export const meta: MetaFunction = () => [
  { title: "募集リクエスト | Aipictors" },
  {
    name: "description",
    content:
      "描いてほしい絵をプレミアムコインの報酬つきで募集。誰でも画像で提案でき、採用された人に報酬が届きます。",
  },
]

const TABS = [
  { value: "open", ja: "募集中", en: "Open" },
  { value: "done", ja: "採用済み", en: "Awarded" },
  { value: "requested", ja: "自分の募集", en: "My requests", login: true },
  { value: "proposed", ja: "提案した募集", en: "My entries", login: true },
] as const

const SORTS = [
  { value: "new", ja: "新着", en: "Newest" },
  { value: "deadline", ja: "締切間近", en: "Ending soon" },
  { value: "reward", ja: "報酬が高い", en: "Highest reward" },
  { value: "proposals", ja: "提案が多い", en: "Most entries" },
]

/** 募集リクエストの一覧（募集中 / 採用済み / 自分の募集 / 提案した募集） */
export default function OpenRequestsPage() {
  const t = useTranslation()
  const auth = useContext(AuthContext)
  const contentMode = useContentMode()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") ?? "open"
  const sort = searchParams.get("sort") ?? "new"
  const isMine = tab === "requested" || tab === "proposed"
  const [requests, setRequests] = useState<OpenRequest[] | null>(null)
  const [users, setUsers] = useState<RequestUsers>({})
  // R18 の募集は年齢を確かめてから読む（null = まだ読めていない）。
  // ヘッダーやこのページの切り替えで確認したときも、モードが変わったときに読み直す
  const [ageOk, setAgeOk] = useState<boolean | null>(null)
  const showsR18 = !isMine && contentMode === "r18"
  const needsAgeGate = showsR18 && ageOk === false

  useEffect(() => {
    setAgeOk(readAgeConfirmed())
  }, [contentMode])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { preventScrollReset: true })
  }

  useEffect(() => {
    if (isMine && !auth.isLoggedIn) return
    if (showsR18 && ageOk !== true) return
    let alive = true
    setRequests(null)
    openRequestsGet<{ requests: OpenRequest[]; users: RequestUsers }>({
      op: "list",
      ...(isMine
        ? { mine: tab }
        : {
            status: tab,
            sort,
            // R18 のモードでは R18 の募集、それ以外は全年齢の募集
            r18: contentMode === "r18" ? 1 : null,
          }),
      limit: 48,
    })
      .then((data) => {
        if (!alive) return
        setRequests(data.requests)
        setUsers(data.users)
      })
      .catch(() => alive && setRequests([]))
    return () => {
      alive = false
    }
  }, [tab, sort, contentMode, auth.isLoggedIn, isMine, showsR18, ageOk])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 pt-4 pb-24 md:px-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-5 text-white md:p-8">
        <div className="relative z-10 flex flex-col gap-3 md:max-w-xl">
          <span className="w-fit rounded-full bg-white/20 px-3 py-1 font-bold text-xs backdrop-blur">
            {t("募集リクエスト", "Open requests")}
          </span>
          <h1 className="font-bold text-2xl leading-tight md:text-3xl">
            {t("描いてほしい絵を", "Post what you want drawn,")}
            <br />
            {t("みんなに募集しよう", "and let everyone submit")}
          </h1>
          <p className="text-sm text-white/90">
            {t(
              "報酬（プレミアムコイン）を決めて募集すると、誰でも画像で提案できます。気に入った提案を採用すると、その人に報酬が届きます。",
              "Set a reward in premium coins and anyone can submit an image. Pick the one you like and the reward goes to its creator.",
            )}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              asChild
              variant="secondary"
              className="rounded-full font-bold"
            >
              <Link to="/requests/open/new">
                <Plus className="mr-1 size-4" />
                {t("募集する", "Post a request")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-full font-bold text-white hover:bg-white/15 hover:text-white"
            >
              <a href="#how-to">{t("募集の流れ", "How it works")}</a>
            </Button>
          </div>
        </div>
        <Megaphone className="-right-6 -bottom-8 absolute size-48 text-white/15 md:right-6 md:size-64" />
      </section>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={cn(appPillRowClassName, "min-w-0 flex-1")}>
            {TABS.filter((item) => !("login" in item) || auth.isLoggedIn).map(
              (item) => (
                <button
                  key={item.value}
                  type="button"
                  className={appPillTabClassName(tab === item.value)}
                  onClick={() =>
                    setParam("tab", item.value === "open" ? "" : item.value)
                  }
                >
                  {t(item.ja, item.en)}
                </button>
              ),
            )}
          </div>
          {/* 全年齢 / R18 の募集の切り替え（ヘッダーと同じもの。R18 にするときは年齢を確認する） */}
          {!isMine && <HomeHeaderContentToggle className="shrink-0" />}
        </div>
        {!isMine && (
          <div className={appPillRowClassName}>
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={appFilterChipClassName(sort === s.value)}
                onClick={() =>
                  setParam("sort", s.value === "new" ? "" : s.value)
                }
              >
                {t(s.ja, s.en)}
              </button>
            ))}
          </div>
        )}
      </div>

      {needsAgeGate ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-400/50 border-dashed bg-rose-500/5 px-6 py-12 text-center">
          <EyeOff className="size-10 text-rose-500" />
          <p className="font-bold">
            {t("R18 の募集を表示します", "Showing R18 requests")}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(
              "18 歳以上であることを確認してから表示します。あなたは 18 歳以上ですか？",
              "Shown after confirming you are 18 or older. Are you 18 or older?",
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => writeContentMode("all")}
            >
              {t("いいえ（全年齢に戻る）", "No (back to all ages)")}
            </Button>
            <Button
              className="rounded-full font-bold"
              onClick={() => {
                writeAgeConfirmed(false)
                setAgeOk(true)
              }}
            >
              {t("はい、18 歳以上です", "Yes, I am 18+")}
            </Button>
          </div>
        </div>
      ) : requests === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-14 text-center">
          <Megaphone className="size-10 text-muted-foreground" />
          <p className="font-bold">
            {tab === "proposed"
              ? t(
                  "まだ提案した募集はありません",
                  "You have not submitted any entries yet",
                )
              : t("まだ募集がありません", "No requests yet")}
          </p>
          <Button asChild className="rounded-full font-bold">
            <Link to="/requests/open/new">
              {t("最初の募集をする", "Post the first request")}
            </Link>
          </Button>
        </div>
      ) : (
        <section
          className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4")}
        >
          {requests.map((request) => (
            <OpenRequestCard
              key={request.id}
              request={request}
              user={users[request.requesterUserId]}
            />
          ))}
        </section>
      )}

      <section
        id="how-to"
        className="grid scroll-mt-20 gap-3 rounded-3xl bg-muted/50 p-5 md:grid-cols-3"
      >
        <HowTo
          step="1"
          title={t("報酬を決めて募集", "Post with a reward")}
          body={t(
            "内容・参考画像・報酬・締切（3〜14日）を書いて募集します。報酬は購入したプレミアムコインで、いったん預かりになります。",
            "Describe what you want, add references, and set a reward and a deadline (3–14 days). The reward is paid in purchased premium coins and held until the end.",
          )}
        />
        <HowTo
          step="2"
          title={t("誰でも画像で提案", "Anyone can submit")}
          body={t(
            "画像をアップロードするか、自分の作品を選んで提案します。1つの募集に1人3件まで。提案にはいいね・コメントができます。",
            "Upload an image or pick one of your works. Up to 3 entries per person. Entries can be liked and commented on.",
          )}
        />
        <HowTo
          step="3"
          title={t("1件を採用", "Pick one")}
          body={t(
            "気に入った提案を採用すると、手数料を引いた報酬がその人に届きます。締切までに採用しないと、いいねが一番多い提案が自動で採用されます。",
            "When you pick an entry, the reward (minus the fee) goes to its creator. If you don't pick one by the deadline, the most-liked entry is picked automatically.",
          )}
        />
        <p className="flex items-start gap-2 text-muted-foreground text-xs md:col-span-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          {t(
            "提案が1件もないまま締切になったときは、報酬が全額戻ります。提案が届く前なら募集を取り下げられます。",
            "If the deadline passes with no entries, the full reward is returned. You can cancel the request before any entries arrive.",
          )}
        </p>
      </section>
    </div>
  )
}

function HowTo(props: { step: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground font-bold text-background text-sm">
        {props.step}
      </span>
      <div>
        <p className="font-bold text-sm">{props.title}</p>
        <p className="text-muted-foreground text-xs">{props.body}</p>
      </div>
    </div>
  )
}

import { ArmchairIcon, Gamepad2Icon } from "lucide-react"
import { lazy, Suspense, useEffect, useState } from "react"
import { fetchPictorRunLobbyCount } from "~/components/pictor-run/pictor-run-lobby"
import {
  PICTOR_RUN_STAGES,
  toPictorRunStageFile,
} from "~/components/pictor-run/pictor-run-stages"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { PictorChanGameSection } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-game-section"
import { PictorChanLobbySection } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-lobby-section"
import { PictorChanStyles } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-styles"

/** ゲーム本体は押されたときにだけ読み込む（ページの表示を重くしない） */
const PictorRunOverlay = lazy(
  () => import("~/components/pictor-run/pictor-run-overlay"),
)

/** よくある質問（ページの下と、検索向けの構造化データの両方に出す） */
export const PICTOR_RUN_FAQ: readonly {
  q: readonly [ja: string, en: string]
  a: readonly [ja: string, en: string]
}[] = [
  {
    q: ["無料で遊べますか？", "Is it free?"],
    a: [
      "はい、無料です。ブラウザですぐ遊べて、アプリのインストールや会員登録はいりません。",
      "Yes. It runs in your browser with no install and no sign-up.",
    ],
  },
  {
    q: ["スマホでも遊べますか？", "Can I play on a phone?"],
    a: [
      "遊べます。スマホ・タブレット・PC のブラウザに対応しています。動きが重いときは、スタート画面の「軽量モード」をオンにしてください。",
      "Yes. It works in phone, tablet and PC browsers. If it feels slow, turn on Lite mode on the start screen.",
    ],
  },
  {
    q: ["操作方法は？", "How do I play?"],
    a: [
      "PC はスペースキーかクリック、スマホは画面をタップでジャンプします。空中でもう一度押すと 2 段ジャンプができます。ハートは 3 つで、障害物に 3 回ぶつかると終わりです。",
      "Press Space or click on PC, or tap on a phone, to jump. Press again in mid-air for a double jump. You have 3 hearts.",
    ],
  },
  {
    q: ["ランキングにのるには？", "How do I get on the ranking?"],
    a: [
      "Aipictors にログインして遊ぶと、記録が今週のランキングと累計のランキングにのります。ログインしなくても遊べます。",
      "Log in to Aipictors and your scores are added to the weekly and all-time rankings. You can also play without logging in.",
    ],
  },
  {
    q: ["ロビーでは何ができますか？", "What can I do in the lobby?"],
    a: [
      "ほかの人のぴくたーちゃんと同じ広場に入って、あいさつのスタンプ・ダンス・ベンチにすわる・チャットができます。走って集めたコインで、ぼうしや服の色などのきせかえも買えます。",
      "Share a plaza with other players: greet with stamps, dance, sit on benches and chat. Coins you collect buy hats and outfit colours.",
    ],
  },
]

/**
 * ミニゲーム「ぴくたーちゃんラン」のページ（紹介と、ここから遊ぶ入口）
 */
export function PictorRunLanding(): React.ReactNode {
  const t = useTranslation()
  /** ゲームを開いているか（lobby = ロビーから始める） */
  const [game, setGame] = useState<"run" | "lobby" | null>(null)
  const [crowd, setCrowd] = useState<{ lobby: number; playing: number } | null>(
    null,
  )
  useEffect(() => {
    let cancelled = false
    void fetchPictorRunLobbyCount().then((count) => {
      if (!cancelled) setCrowd(count)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl space-y-14 pb-10 md:space-y-20">
      <PictorChanStyles />
      <section className="relative isolate overflow-hidden rounded-[2rem] text-white shadow-2xl">
        <img
          src="/images/pictor-chan/run/bg/stage-01-s.webp"
          alt=""
          width={1280}
          height={640}
          fetchPriority="high"
          decoding="async"
          className="-z-10 absolute inset-0 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="-z-10 absolute inset-0 bg-gradient-to-r from-[#101a5c]/90 via-[#101a5c]/60 to-transparent"
        />
        <div className="grid items-end gap-4 px-6 pt-10 md:grid-cols-[1.4fr_1fr] md:px-12 md:pt-14">
          <div className="space-y-5 pb-10 text-center md:pb-14 md:text-left">
            <p className="inline-flex rounded-full bg-[#ff8a1f] px-4 py-1.5 font-black text-xs md:text-sm">
              {t(
                "無料ブラウザゲーム・登録なしで遊べる",
                "Free browser game · No sign-up",
              )}
            </p>
            <h1 className="font-black leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
              <span className="block whitespace-nowrap text-[2.6rem] md:text-6xl">
                {t("ぴくたーちゃん", "Pictor-chan")}
              </span>{" "}
              <span className="mt-2 block text-6xl text-amber-300 md:text-8xl">
                {t("ラン", "Run")}
              </span>
            </h1>
            <p className="mx-auto max-w-md text-sm text-white/90 leading-relaxed md:mx-0 md:text-base">
              {t(
                "Aipictors のマスコット「ぴくたーちゃん」が走る、3D のランゲームです。ジャンプで障害物をよけてコインを集め、全 15 ステージを走りぬけよう。",
                "A 3D endless runner starring Pictor-chan, the Aipictors mascot. Jump over obstacles, collect coins and run through all 15 stages.",
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <button
                type="button"
                onClick={() => setGame("run")}
                className="pkc-ring flex h-14 cursor-pointer items-center gap-3 rounded-full bg-[#ff8a1f] px-10 font-black text-lg text-white transition-transform hover:scale-105 active:scale-95"
              >
                <Gamepad2Icon aria-hidden="true" className="size-6" />
                {t("いますぐ遊ぶ", "Play now")}
              </button>
              <button
                type="button"
                onClick={() => setGame("lobby")}
                className="flex h-14 cursor-pointer items-center gap-2 rounded-full bg-white/20 px-7 font-black text-base ring-1 ring-white/30 transition-colors hover:bg-white/30"
              >
                <ArmchairIcon aria-hidden="true" className="size-5" />
                {t("ロビーへ", "Go to the lobby")}
                {crowd !== null && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
                    {t(`${crowd.lobby}人`, `${crowd.lobby}`)}
                  </span>
                )}
              </button>
            </div>
          </div>
          <img
            src="/images/pictor-chan/pictor-chan-3d-preview-2.webp"
            alt={t(
              "3D のぴくたーちゃん",
              "Pictor-chan, the 3D mascot of Aipictors",
            )}
            width={495}
            height={900}
            decoding="async"
            className="pkc-float mx-auto hidden h-[26rem] w-auto drop-shadow-2xl md:block"
          />
        </div>
      </section>

      <section className="px-1">
        <h2 className="font-black text-2xl md:text-3xl">
          {t("あそびかた", "How to play")}
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            [
              t("ジャンプでよける", "Jump to dodge"),
              t(
                "スペースキー・クリック・タップでジャンプ。空中でもう一度押すと 2 段ジャンプ。",
                "Space, click or tap to jump. Press again in mid-air for a double jump.",
              ),
            ],
            [
              t("コインとアイテムを集める", "Collect coins and items"),
              t(
                "コインは 1 枚 10 点。ガード・磁石・スター・ハートのアイテムも出ます。集めたコインはきせかえに使えます。",
                "Each coin is worth 10 points. Guard, magnet, star and heart items appear too. Coins buy outfits.",
              ),
            ],
            [
              t("遠くまで走る", "Run as far as you can"),
              t(
                "ハートは 3 つ。80m ごとに景色が変わり、全部で 15 ステージ。記録はランキングにのります。",
                "You have 3 hearts. The scenery changes every 80 m across 15 stages. Scores go on the ranking.",
              ),
            ],
          ].map(([title, text], index) => (
            <li key={title} className="rounded-2xl border bg-card p-5">
              <p className="flex size-8 items-center justify-center rounded-full bg-[#ff8a1f] font-black text-sm text-white">
                {index + 1}
              </p>
              <h3 className="mt-3 font-black text-base">{title}</h3>
              <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <PictorChanGameSection
        onPlay={() => setGame("run")}
        onLobby={() => setGame("lobby")}
        crowd={crowd}
      />

      <PictorChanLobbySection onLobby={() => setGame("lobby")} crowd={crowd} />

      <section className="px-1">
        <h2 className="font-black text-2xl md:text-3xl">
          {t("全 15 ステージ", "All 15 stages")}
        </h2>
        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {PICTOR_RUN_STAGES.map((stage, index) => (
            <li
              key={stage.ja}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <img
                src={`/images/pictor-chan/run/bg/stage-${toPictorRunStageFile(stage)}-t.webp`}
                alt={t(
                  `ステージ ${index + 1}「${stage.ja}」の景色`,
                  `Stage ${index + 1}: ${stage.en}`,
                )}
                width={560}
                height={245}
                loading="lazy"
                decoding="async"
                className="aspect-[16/7] w-full object-cover"
              />
              <p className="px-3 py-2 font-bold text-sm">
                <span className="mr-1.5 text-[#ff8a1f] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {t(stage.ja, stage.en)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-1">
        <h2 className="font-black text-2xl md:text-3xl">
          {t("よくある質問", "FAQ")}
        </h2>
        <dl className="mt-5 space-y-3">
          {PICTOR_RUN_FAQ.map((item) => (
            <div key={item.q[0]} className="rounded-2xl border bg-card p-5">
              <dt className="font-black text-base">
                {t(item.q[0], item.q[1])}
              </dt>
              <dd className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                {t(item.a[0], item.a[1])}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-center text-sm">
          <Link to="/pictor-chan" className="font-bold underline">
            {t(
              "ぴくたーちゃんのプロフィール・3D モデル・イラスト用の素材はこちら",
              "Pictor-chan's profile, 3D model and creative assets",
            )}
          </Link>
        </p>
      </section>

      {game !== null && (
        <Suspense fallback={null}>
          <PictorRunOverlay
            onClose={() => setGame(null)}
            startInLobby={game === "lobby"}
          />
        </Suspense>
      )}
    </div>
  )
}

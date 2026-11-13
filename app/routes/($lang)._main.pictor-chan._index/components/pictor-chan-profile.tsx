import {
  ArrowDownIcon,
  BoxIcon,
  CakeIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  Gamepad2Icon,
  HeartIcon,
  MessageCircleIcon,
  PaletteIcon,
  SparklesIcon,
  TagIcon,
  UtensilsIcon,
  VenusIcon,
  WandSparklesIcon,
} from "lucide-react"
import { lazy, Suspense, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { PictorChan3dSection } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-3d-section"
import { PictorChanGameSection } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-game-section"
import { PictorChanReveal } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-reveal"
import { PictorChanStyles } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-styles"
import { PictorChanViewer } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-viewer"

/** ミニゲームは押されたときにだけ読み込む（ページの表示を重くしない） */
const PictorRunOverlay = lazy(
  () => import("~/components/pictor-run/pictor-run-overlay"),
)

const PROMPT = `masterpiece, best quality, ultra-detailed, illustration
pktc,1girl, solo, multicolored hair, ahoge, colored inner hair, blush stickers, orange hair, blue hair, long hair, bangs, green hair, blue eyes,
maid, maid headdress, maid apron, teacup, saucer, teapot,
simple background, white background,ahoge, full body, gravure pose, looking at viewer,`

/** 見出し（小さな英字 + 大きな題） */
function Heading(props: {
  label: string
  title: string
  icon: React.ReactNode
  className?: string
}): React.ReactNode {
  return (
    <div className={cn("mb-6 flex items-end gap-3", props.className)}>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a1f] via-[#2d6cdf] to-[#19b5a8] text-white shadow-lg">
        {props.icon}
      </span>
      <div>
        <p className="font-black text-[#2d6cdf] text-xs tracking-[0.3em] dark:text-sky-300">
          {props.label}
        </p>
        <h2 className="font-black text-2xl md:text-3xl">{props.title}</h2>
      </div>
    </div>
  )
}

/**
 * ぴくたーちゃんのページ（紹介・ミニゲーム・3D モデル・生成用の素材）
 */
export function PictorChanProfile(): React.ReactNode {
  const t = useTranslation()
  const [isGameOpen, setIsGameOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const copyPrompt = () => {
    void navigator.clipboard.writeText(PROMPT).then(() => {
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 2000)
    })
  }

  const facts: {
    icon: React.ReactNode
    label: string
    value: string
    tone: string
  }[] = [
    {
      icon: <VenusIcon aria-hidden="true" className="size-5" />,
      label: t("性別", "Gender"),
      value: t("女の子", "Girl"),
      tone: "from-pink-400 to-rose-500",
    },
    {
      icon: <SparklesIcon aria-hidden="true" className="size-5" />,
      label: t("年齢", "Age"),
      value: t("ひみつ（不明）", "Unknown"),
      tone: "from-violet-400 to-indigo-500",
    },
    {
      icon: <CakeIcon aria-hidden="true" className="size-5" />,
      label: t("誕生日", "Birthday"),
      value: t("11月21日", "November 21"),
      tone: "from-amber-400 to-orange-500",
    },
    {
      icon: <UtensilsIcon aria-hidden="true" className="size-5" />,
      label: t("好きな食べ物", "Favorite food"),
      value: t("じゃがいも 🥔", "Potatoes 🥔"),
      tone: "from-yellow-400 to-amber-500",
    },
    {
      icon: <PaletteIcon aria-hidden="true" className="size-5" />,
      label: t("趣味", "Hobby"),
      value: t(
        "Aipictorsでみんなの作品を見ること",
        "Browsing everyone's works on Aipictors",
      ),
      tone: "from-sky-400 to-cyan-500",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 pb-16 md:space-y-24">
      <PictorChanStyles />

      {/* いちばん上: 景色の中に、動く 3D のぴくたーちゃん */}
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#101a5c] text-white shadow-2xl">
        <img
          src="/images/pictor-chan/run/bg/stage-01-s.webp"
          alt=""
          width={1280}
          height={640}
          decoding="async"
          className="pkc-pan -z-20 absolute inset-0 h-full w-[112%] max-w-none object-cover"
        />
        <div className="-z-10 absolute inset-0 bg-gradient-to-b from-[#0b1348]/85 via-[#0b1348]/45 to-[#0b1348]/80 md:bg-gradient-to-r md:from-[#0b1348]/92 md:via-[#0b1348]/55 md:to-[#0b1348]/10" />
        {/* 舞う花びらと、またたく光 */}
        <div
          aria-hidden="true"
          className="-z-10 pointer-events-none absolute inset-0 overflow-hidden"
        >
          {[8, 22, 37, 51, 66, 79, 91].map((left, index) => (
            <span
              key={left}
              className="pkc-petal absolute top-0 block h-3 w-2 rounded-[60%_40%_60%_40%] bg-pink-200/90"
              style={{
                left: `${left}%`,
                animationDelay: `${index * -1.3}s`,
                animationDuration: `${8 + (index % 3) * 2}s`,
              }}
            />
          ))}
          {[
            [12, 18],
            [28, 62],
            [46, 12],
            [58, 74],
            [72, 30],
            [88, 58],
            [94, 14],
          ].map(([left, top], index) => (
            <SparklesIcon
              key={`${left}-${top}`}
              className="pkc-twinkle absolute size-4 text-amber-200"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${index * 0.45}s`,
              }}
            />
          ))}
        </div>

        <div className="grid items-center gap-2 px-6 pt-10 pb-6 md:grid-cols-[1.15fr_1fr] md:gap-6 md:px-12 md:py-12">
          <div className="fade-in slide-in-from-bottom-6 animate-in space-y-5 text-center duration-700 md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 font-bold text-xs backdrop-blur-sm md:text-sm">
              <SparklesIcon aria-hidden="true" className="size-4" />
              {t(
                "Aipictors 公式マスコットキャラクター",
                "Official mascot of Aipictors",
              )}
            </p>
            <h1 className="font-black leading-none">
              <span className="pkc-shine block bg-[linear-gradient(90deg,#ffb15e,#ffffff,#7fd8ff,#8ff0c8,#ffb15e)] bg-clip-text text-5xl text-transparent drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] md:text-7xl">
                ぴくたーちゃん
              </span>
              <span className="mt-3 block font-bold text-base text-white/80 tracking-[0.4em] md:text-lg">
                PICTOR-CHAN
              </span>
            </h1>
            <p className="mx-auto max-w-md text-sm text-white/90 leading-relaxed md:mx-0 md:text-base">
              {t(
                "オレンジ・ブルー・グリーンの髪がトレードマーク。みんなの作品を見るのが大好きで、今日も Aipictors を楽しそうにめぐっています。",
                "Known for her orange, blue and green hair. She loves seeing everyone's works and happily wanders around Aipictors every day.",
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <button
                type="button"
                onClick={() => setIsGameOpen(true)}
                className="pkc-ring flex h-12 cursor-pointer items-center gap-2 rounded-full bg-[#ff8a1f] px-7 font-black text-base text-white transition-transform hover:scale-105 active:scale-95"
              >
                <Gamepad2Icon aria-hidden="true" className="size-5" />
                {t("ミニゲームであそぶ", "Play the mini game")}
              </button>
              <a
                href="#model-3d"
                className="flex h-12 items-center gap-2 rounded-full bg-white/15 px-6 font-bold text-sm backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <BoxIcon aria-hidden="true" className="size-5" />
                {t("3Dモデルを無料でもらう", "Get the free 3D model")}
              </a>
            </div>
            <dl className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-xs md:justify-start md:text-sm">
              {[
                [t("誕生日", "Birthday"), t("11月21日", "Nov 21")],
                [t("好きなもの", "Loves"), t("じゃがいも", "Potatoes")],
                [t("ミニゲーム", "Mini game"), t("全13ステージ", "13 stages")],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <dt className="text-white/60">{label}</dt>
                  <dd className="font-black">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto h-[23rem] w-full max-w-sm md:h-[30rem]">
            {/* うしろで回る光の輪 */}
            <div
              aria-hidden="true"
              className="pkc-spin -translate-x-1/2 -translate-y-1/2 absolute top-[46%] left-1/2 size-[19rem] rounded-full bg-[conic-gradient(from_0deg,rgba(255,138,31,0.55),rgba(45,108,223,0.15),rgba(25,181,168,0.55),rgba(255,255,255,0.1),rgba(255,138,31,0.55))] blur-2xl md:size-[24rem]"
            />
            <PictorChanViewer />
          </div>
        </div>
        <a
          href="#profile"
          aria-label={t("下へ", "Scroll down")}
          className="mx-auto mb-4 hidden size-9 animate-bounce items-center justify-center rounded-full bg-white/15 backdrop-blur-sm md:flex"
        >
          <ArrowDownIcon aria-hidden="true" className="size-4" />
        </a>
      </section>

      {/* プロフィール */}
      <section id="profile" className="scroll-mt-20 px-1">
        <PictorChanReveal>
          <Heading
            label="PROFILE"
            title={t("プロフィール", "Profile")}
            icon={<HeartIcon aria-hidden="true" className="size-6" />}
          />
        </PictorChanReveal>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {facts.map((fact, index) => (
            <PictorChanReveal
              as="li"
              key={fact.label}
              delay={index * 80}
              className={cn(
                "pkc-card rounded-2xl border bg-card p-4",
                index === 4 && "col-span-2 md:col-span-1",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                  fact.tone,
                )}
              >
                {fact.icon}
              </span>
              <p className="mt-3 font-bold text-muted-foreground text-xs">
                {fact.label}
              </p>
              <p className="mt-0.5 font-black text-sm leading-snug md:text-base">
                {fact.value}
              </p>
            </PictorChanReveal>
          ))}
        </ul>
        <PictorChanReveal className="mt-4 overflow-hidden rounded-3xl border bg-card">
          <div className="flex h-2">
            <span className="flex-1 bg-[#ff8a1f]" />
            <span className="flex-1 bg-[#2d6cdf]" />
            <span className="flex-1 bg-[#19b5a8]" />
          </div>
          <div className="flex flex-col items-center gap-5 p-6 md:flex-row md:p-8">
            <img
              src="https://assets.aipictors.com/6308eaf00a05fd7c3001b709dbe8e39a.webp"
              alt={t("ぴくたーちゃん", "Pictor-chan")}
              width={160}
              height={160}
              loading="lazy"
              decoding="async"
              className="size-28 shrink-0 rounded-full object-cover ring-4 ring-[#ff8a1f]/40"
            />
            <div>
              <h3 className="font-black text-lg">
                {t("ぴくたーちゃんについて", "About Pictor-chan")}
              </h3>
              <p className="mt-2 text-sm leading-loose md:text-base">
                {t(
                  "ぴくたーちゃんは、Aipictorsが開設された2022年11月21日に誕生した公式マスコットキャラクターです。オレンジ、ブルー、グリーンの美しいマルチカラーヘアが特徴的で、いつも学生服を着ています。みんなの素敵な作品を見ることが大好きで、今日も楽しそうにAipictorsを巡回しています。",
                  "Pictor-chan is the official mascot character who was born on November 21, 2022, when Aipictors was launched. She is known for her beautiful multicolored hair in orange, blue, and green, and always wears a school uniform. She loves looking at everyone's wonderful works and happily browses Aipictors every day.",
                )}
              </p>
            </div>
          </div>
        </PictorChanReveal>
      </section>

      {/* ミニゲーム */}
      <PictorChanGameSection onPlay={() => setIsGameOpen(true)} />

      {/* 3D モデルの配布 */}
      <section id="model-3d" className="scroll-mt-20 px-1">
        <PictorChanReveal>
          <Heading
            label="3D MODEL"
            title={t("3Dモデルを無料で配布中", "Free 3D model")}
            icon={<BoxIcon aria-hidden="true" className="size-6" />}
          />
        </PictorChanReveal>
        <PictorChanReveal>
          <PictorChan3dSection />
        </PictorChanReveal>
      </section>

      {/* 話す・見る */}
      <section className="grid gap-5 px-1 md:grid-cols-2">
        <PictorChanReveal className="pkc-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5865f2] to-[#8b5cf6] p-7 text-white">
          <MessageCircleIcon
            aria-hidden="true"
            className="-right-6 -bottom-6 absolute size-40 text-white/10"
          />
          <p className="font-black text-white/70 text-xs tracking-[0.3em]">
            DISCORD
          </p>
          <h2 className="mt-1 font-black text-2xl">
            {t("ぴくたーちゃんと話そう", "Chat with Pictor-chan")}
          </h2>
          <p className="mt-3 text-sm text-white/90 leading-relaxed">
            {t(
              "AipictorsのDiscordサーバーにある専用チャンネルで、AIで動いているぴくたーちゃんと直接会話できます。",
              "Talk directly with AI-powered Pictor-chan in her own channel on the Aipictors Discord server.",
            )}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs">
            {[
              t("雑談", "Small talk"),
              t("Aipictorsの質問", "Questions about Aipictors"),
              t("AI生成のコツ", "AI generation tips"),
              t("創作の相談", "Creative advice"),
            ].map((item) => (
              <li
                key={item}
                className="rounded-full bg-white/20 px-3 py-1 font-bold"
              >
                {item}
              </li>
            ))}
          </ul>
          <a
            href="https://discord.gg/7jA2MmtvtR"
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 font-black text-[#5865f2] text-sm transition-transform hover:scale-105"
          >
            <ExternalLinkIcon aria-hidden="true" className="size-4" />
            {t("Discordで話す", "Chat on Discord")}
          </a>
        </PictorChanReveal>

        <PictorChanReveal
          delay={100}
          className="pkc-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff8a1f] via-[#ff6f91] to-[#ffb15e] p-7 text-white"
        >
          <img
            src="https://assets.aipictors.com/pictor-chan-01.webp"
            alt=""
            width={160}
            height={316}
            loading="lazy"
            decoding="async"
            className="pkc-float absolute right-4 bottom-0 h-44 w-auto drop-shadow-xl"
          />
          <p className="font-black text-white/70 text-xs tracking-[0.3em]">
            GALLERY
          </p>
          <h2 className="mt-1 font-black text-2xl">
            {t("みんなが作ったぴくたーちゃん", "Pictor-chan by everyone")}
          </h2>
          <p className="mt-3 max-w-[70%] text-sm text-white/95 leading-relaxed">
            {t(
              "Aipictorsにはたくさんのぴくたーちゃんイラストが投稿されています。タグで探してみましょう！",
              "Many Pictor-chan illustrations are posted on Aipictors. Find them by tag!",
            )}
          </p>
          <Link
            to="/tags/ぴくたーちゃん"
            className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 font-black text-[#e8590c] text-sm transition-transform hover:scale-105"
          >
            <TagIcon aria-hidden="true" className="size-4" />
            {t("#ぴくたーちゃん の作品を見る", "View #ぴくたーちゃん works")}
          </Link>
        </PictorChanReveal>
      </section>

      {/* AI で描く */}
      <section className="scroll-mt-20 px-1">
        <PictorChanReveal>
          <Heading
            label="CREATE"
            title={t(
              "AIでぴくたーちゃんを描く",
              "Generate Pictor-chan with AI",
            )}
            icon={<WandSparklesIcon aria-hidden="true" className="size-6" />}
          />
        </PictorChanReveal>
        <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
          <PictorChanReveal className="overflow-hidden rounded-3xl bg-[#0f1535] text-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-white/10 border-b px-5 py-3">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-rose-400" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-bold text-white/60 text-xs">
                  {t("生成用プロンプト", "Prompt")}
                </span>
              </div>
              <button
                type="button"
                onClick={copyPrompt}
                className={cn(
                  "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-4 font-bold text-xs transition-colors",
                  isCopied
                    ? "bg-emerald-400 text-emerald-950"
                    : "bg-white/15 hover:bg-white/25",
                )}
              >
                {isCopied ? (
                  <CheckIcon aria-hidden="true" className="size-3.5" />
                ) : (
                  <CopyIcon aria-hidden="true" className="size-3.5" />
                )}
                {isCopied ? t("コピーしました", "Copied") : t("コピー", "Copy")}
              </button>
            </div>
            <pre className="whitespace-pre-wrap p-5 font-mono text-[13px] text-sky-100 leading-relaxed">
              {PROMPT}
            </pre>
          </PictorChanReveal>
          <PictorChanReveal
            delay={100}
            className="pkc-card flex flex-col justify-between rounded-3xl border bg-card p-6"
          >
            <div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
                <DownloadIcon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 font-black text-lg">
                {t("ぴくたーちゃん LoRA", "Pictor-chan LoRA")}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {t(
                  "ぴくたーちゃんを生成するためのLoRAモデルをダウンロードできます（Google Drive）。",
                  "Download the LoRA model for generating Pictor-chan (Google Drive).",
                )}
              </p>
            </div>
            <a
              href="https://drive.google.com/drive/folders/1Cu8Y1SQdc1UKJN2OKdYBCP-Q2HTmvf8P?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 font-black text-background text-sm transition-opacity hover:opacity-85"
            >
              <ExternalLinkIcon aria-hidden="true" className="size-4" />
              {t("ダウンロード", "Download")}
            </a>
          </PictorChanReveal>
        </div>
      </section>

      {/* 使うときの約束 */}
      <section className="px-1">
        <PictorChanReveal className="rounded-3xl border border-amber-300/60 bg-amber-50 p-6 md:p-8 dark:border-amber-500/30 dark:bg-amber-950/40">
          <h2 className="flex items-center gap-2 font-black text-lg">
            <HeartIcon aria-hidden="true" className="size-5 text-rose-500" />
            {t("使用上の注意", "Usage guidelines")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed">
            {[
              t(
                "ぴくたーちゃんは個人利用・商用利用ともに自由にご利用いただけます",
                "Pictor-chan can be used freely for both personal and commercial purposes",
              ),
              t(
                "ただし、不適切な内容や他者を傷つける表現での使用はご遠慮ください",
                "However, please refrain from using her for inappropriate content or expressions that may harm others",
              ),
              t(
                "ぴくたーちゃんを使用した作品をAipictorsに投稿する際は、「pictor-chan」「ぴくたーちゃん」タグなどを付けることを推奨いたします",
                "When posting works featuring Pictor-chan on Aipictors, we recommend adding tags such as 'pictor-chan' and 'ぴくたーちゃん'",
              ),
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <CheckIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-emerald-600"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link to="/pictor-chan/license" className="font-bold underline">
              {t(
                "3Dモデルの利用条件（ぴくたーちゃんライセンス）",
                "Terms for the 3D model (Pictor-chan License)",
              )}
            </Link>
          </p>
        </PictorChanReveal>
        <PictorChanReveal className="mt-12 text-center">
          <p className="pkc-shine inline-block bg-[linear-gradient(90deg,#ff8a1f,#2d6cdf,#19b5a8,#ff8a1f)] bg-clip-text font-black text-transparent text-xl md:text-2xl">
            {t(
              "みんなで作る、みんなのぴくたーちゃん",
              "Pictor-chan, created by everyone, for everyone",
            )}
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            {t(
              "ぴくたーちゃんと一緒に、素敵な創作活動を楽しみましょう！",
              "Let's enjoy creating together with Pictor-chan!",
            )}
          </p>
        </PictorChanReveal>
      </section>

      {isGameOpen && (
        <Suspense fallback={null}>
          <PictorRunOverlay onClose={() => setIsGameOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

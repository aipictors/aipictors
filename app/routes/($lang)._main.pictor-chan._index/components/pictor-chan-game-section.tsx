import {
  ArmchairIcon,
  Gamepad2Icon,
  MagnetIcon,
  MapIcon,
  MessageCircleIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { PICTOR_RUN_STAGES } from "~/components/pictor-run/pictor-run-stages"
import { useTranslation } from "~/hooks/use-translation"
import { PictorChanReveal } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-reveal"

type Props = Readonly<{
  onPlay: () => void
  /** ロビーに入る */
  onLobby: () => void
  /** いまロビーにいる人数・走っている人数（まだわからない間は null） */
  crowd: { lobby: number; playing: number } | null
}>

/**
 * ミニゲーム「ぴくたーちゃんラン」の紹介（13 ステージの景色が流れる）
 */
export function PictorChanGameSection(props: Props): React.ReactNode {
  const t = useTranslation()

  const features: { icon: React.ReactNode; title: string; text: string }[] = [
    {
      icon: <MapIcon aria-hidden="true" className="size-5" />,
      title: t("全13ステージ", "13 stages"),
      text: t(
        "草原、ネオン街、海の底、星の世界…走るほど景色が変わる",
        "Meadows, a neon city, the sea floor, outer space — the scenery changes as you run",
      ),
    },
    {
      icon: <MagnetIcon aria-hidden="true" className="size-5" />,
      title: t("アイテム", "Items"),
      text: t(
        "ガード・マグネット・スターで、もっと遠くへ",
        "Go further with the guard, magnet and star",
      ),
    },
    {
      icon: <TrophyIcon aria-hidden="true" className="size-5" />,
      title: t("ランキング", "Ranking"),
      text: t(
        "今週の記録が、走れた地点に看板で立つ",
        "This week's records stand as signs where each player got to",
      ),
    },
    {
      icon: <ArmchairIcon aria-hidden="true" className="size-5" />,
      title: t("ロビー", "Lobby"),
      text: t(
        "ほかの人のぴくたーちゃんが、リアルタイムで見える休憩場",
        "A rest area where you see other players' Pictor-chans in real time",
      ),
    },
    {
      icon: <MessageCircleIcon aria-hidden="true" className="size-5" />,
      title: t("チャット", "Chat"),
      text: t(
        "スタンプも使える、みんな共通のチャット",
        "A shared chat with stickers",
      ),
    },
    {
      icon: <UsersIcon aria-hidden="true" className="size-5" />,
      title: t("無料・登録なし", "Free, no sign-up"),
      text: t(
        "すぐ遊べます（ランキングとチャットはログインが必要）",
        "Play right away (ranking and chat need login)",
      ),
    },
  ]

  const stages = PICTOR_RUN_STAGES.map((stage, index) => ({
    ...stage,
    src: `/images/pictor-chan/run/bg/stage-${String(index + 1).padStart(2, "0")}-t.webp`,
  }))

  return (
    <section id="game" className="scroll-mt-20">
      <PictorChanReveal className="relative isolate overflow-hidden rounded-[2rem] bg-[#0b1238] py-10 text-white shadow-2xl md:py-14">
        <div
          aria-hidden="true"
          className="-z-10 absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(45,108,223,0.55),transparent_55%),radial-gradient(ellipse_at_90%_100%,rgba(255,138,31,0.4),transparent_50%)]"
        />
        <div className="px-6 md:px-12">
          <p className="font-black text-amber-300 text-xs tracking-[0.3em]">
            MINI GAME
          </p>
          <h2 className="mt-2 font-black text-3xl md:text-5xl">
            {t("ぴくたーちゃんラン", "Pictor-chan Run")}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/85 leading-relaxed md:text-base">
            {t(
              "3D のぴくたーちゃんが走るミニゲーム。ジャンプで障害物をよけて、コインを集めながら 13 のステージを走りぬけよう。",
              "A mini game where 3D Pictor-chan runs. Jump over obstacles, collect coins and run through 13 stages.",
            )}
          </p>
        </div>

        {/* 13 ステージの景色が、横に流れていく */}
        <div
          className="mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
          aria-hidden="true"
        >
          <div className="pkc-marquee flex w-max gap-4 pr-4">
            {[...stages, ...stages].map((stage, index) => (
              <figure
                // biome-ignore lint/suspicious/noArrayIndexKey: 同じ並びを 2 回くり返している
                key={index}
                className="relative w-64 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/20 md:w-80"
              >
                <img
                  src={stage.src}
                  alt=""
                  width={560}
                  height={245}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/7] w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-6 pb-2 font-black text-sm">
                  <span className="mr-2 text-amber-300">
                    {String((index % stages.length) + 1).padStart(2, "0")}
                  </span>
                  {t(stage.ja, stage.en)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <ul className="mt-8 grid gap-3 px-6 sm:grid-cols-2 md:grid-cols-3 md:px-12">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="flex gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-amber-300">
                {feature.icon}
              </span>
              <div>
                <p className="font-black text-sm">{feature.title}</p>
                <p className="mt-0.5 text-white/75 text-xs leading-relaxed">
                  {feature.text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 px-6">
          <button
            type="button"
            onClick={props.onPlay}
            className="pkc-ring flex h-14 cursor-pointer items-center gap-3 rounded-full bg-[#ff8a1f] px-12 font-black text-lg text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Gamepad2Icon aria-hidden="true" className="size-6" />
            {t("あそぶ", "Play")}
          </button>
          <button
            type="button"
            onClick={props.onLobby}
            className="flex h-14 cursor-pointer items-center gap-2 rounded-full bg-white/15 px-8 font-black text-base text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <ArmchairIcon aria-hidden="true" className="size-5" />
            {t("ロビーに入る", "Enter the lobby")}
          </button>
        </div>
        {props.crowd !== null && (
          <p className="mt-3 text-center text-sm text-white/80">
            {t(
              `いま ロビーに ${props.crowd.lobby} 人・プレイ中 ${props.crowd.playing} 人`,
              `${props.crowd.lobby} in the lobby · ${props.crowd.playing} playing now`,
            )}
          </p>
        )}
      </PictorChanReveal>
    </section>
  )
}

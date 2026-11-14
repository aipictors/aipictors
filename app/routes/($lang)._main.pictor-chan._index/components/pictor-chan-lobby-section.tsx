import { ArmchairIcon, MessageCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import {
  fetchPictorRunMessages,
  type PictorRunMessage,
} from "~/components/pictor-run/pictor-run-api"
import { useTranslation } from "~/hooks/use-translation"
import { PictorChanReveal } from "~/routes/($lang)._main.pictor-chan._index/components/pictor-chan-reveal"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = Readonly<{
  /** ロビーに入る */
  onLobby: () => void
  /** いまロビーにいる人数・走っている人数（まだわからない間は null） */
  crowd: { lobby: number; playing: number } | null
}>

/** Discord の、チャットとつながっているチャンネル */
const DISCORD_CHANNEL_URL =
  "https://discord.com/channels/1069968879272595476/1570949994620657746"

/**
 * ロビーの入口。いまいる人数と、チャットの新しい書き込みを見せる
 */
export function PictorChanLobbySection(props: Props): React.ReactNode {
  const t = useTranslation()
  const [messages, setMessages] = useState<PictorRunMessage[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetchPictorRunMessages({})
        .then((result) => {
          if (!cancelled) setMessages(result.messages.slice(-5))
        })
        .catch(() => {
          if (!cancelled) setMessages((current) => current ?? [])
        })
    }
    load()
    // 開いたままの人にも、新しい書き込みを見せる（画面を見ている間だけ）
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load()
    }, 30_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return (
    <section id="lobby" className="scroll-mt-20 px-1">
      <PictorChanReveal className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="grid md:grid-cols-[1fr_1.25fr]">
          <div className="flex flex-col justify-between gap-5 bg-gradient-to-br from-pink-200 via-rose-100 to-sky-100 p-6 text-slate-900 md:p-8 dark:from-pink-950 dark:via-slate-900 dark:to-sky-950 dark:text-white">
            <div>
              <p className="font-black text-[#d6457f] text-xs tracking-[0.3em] dark:text-pink-300">
                LOBBY
              </p>
              <h2 className="mt-1 font-black text-2xl md:text-3xl">
                {t("みんなのロビー", "The lobby")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed opacity-80">
                {t(
                  "さくらの広場で、ほかの人のぴくたーちゃんと会えます。あいさつ・ダンス・きせかえ・チャットができます。",
                  "Meet other players' Pictor-chans in the cherry blossom plaza. Greet, dance, dress up and chat.",
                )}
              </p>
            </div>
            <div className="space-y-3">
              <p className="flex flex-wrap gap-2 font-black text-sm">
                <span className="rounded-full bg-white/80 px-3 py-1 text-slate-900">
                  ☕ {t("ロビー", "Lobby")}{" "}
                  <span className="tabular-nums">
                    {props.crowd ? props.crowd.lobby : "–"}
                  </span>{" "}
                  {t("人", "")}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-slate-900">
                  🏃 {t("プレイ中", "Playing")}{" "}
                  <span className="tabular-nums">
                    {props.crowd ? props.crowd.playing : "–"}
                  </span>{" "}
                  {t("人", "")}
                </span>
              </p>
              <button
                type="button"
                onClick={props.onLobby}
                className="pkc-ring flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#d6457f] font-black text-lg text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                <ArmchairIcon aria-hidden="true" className="size-6" />
                {t("ロビーに入る", "Enter the lobby")}
              </button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col p-6 md:p-8">
            <h3 className="flex items-center gap-2 font-black text-base">
              <MessageCircleIcon aria-hidden="true" className="size-5" />
              {t("最新のチャット", "Latest chat")}
            </h3>
            {messages === null ? (
              <p className="mt-4 text-muted-foreground text-sm">
                {t("読み込み中…", "Loading…")}
              </p>
            ) : messages.length === 0 ? (
              <p className="mt-4 text-muted-foreground text-sm">
                {t(
                  "まだ書き込みがありません。最初のひとことをどうぞ。",
                  "No messages yet. Be the first to say something.",
                )}
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {messages.map((message) => (
                  <li
                    key={message.id}
                    className="flex min-w-0 items-start gap-2"
                  >
                    <img
                      src={withIconUrlFallback(message.user.iconUrl)}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      className="size-8 shrink-0 rounded-full bg-muted object-cover"
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs">
                        <span className="truncate font-bold">
                          {message.user.name}
                        </span>
                        {message.source === "discord" && (
                          <span className="shrink-0 rounded bg-[#5865f2] px-1 py-px font-bold text-[10px] text-white leading-tight">
                            Discord
                          </span>
                        )}
                        <time
                          dateTime={new Date(
                            message.createdAt * 1000,
                          ).toISOString()}
                          className="shrink-0 text-muted-foreground"
                        >
                          {new Date(message.createdAt * 1000).toLocaleString(
                            undefined,
                            {
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </time>
                      </p>
                      {message.body.length > 0 && (
                        <p className="mt-0.5 line-clamp-2 break-words rounded-2xl rounded-tl-md bg-muted px-3 py-1.5 text-sm">
                          {message.body}
                        </p>
                      )}
                      {message.stickerUrl && (
                        <img
                          src={message.stickerUrl}
                          alt={t("スタンプ", "Sticker")}
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="mt-0.5 size-16 object-contain"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-auto pt-4 text-muted-foreground text-xs leading-relaxed">
              {t(
                "チャットはロビーやゲームの中から書けます。Discord の ",
                "You can write from the lobby or the game. The chat is shared with ",
              )}
              <a
                href={DISCORD_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline"
              >
                #🏃ぴくたーちゃんラン
              </a>
              {t(" ともつながっています。", " on Discord.")}
            </p>
          </div>
        </div>
      </PictorChanReveal>
    </section>
  )
}

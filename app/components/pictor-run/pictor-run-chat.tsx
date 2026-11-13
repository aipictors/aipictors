import {
  AtSignIcon,
  CornerDownRightIcon,
  ReplyIcon,
  SendIcon,
  SmileIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import {
  deletePictorRunMessage,
  PictorRunApiError,
  type PictorRunMention,
  type PictorRunMessage,
  postPictorRunMessage,
} from "~/components/pictor-run/pictor-run-api"
import {
  PictorRunAvatar,
  PictorRunUserName,
} from "~/components/pictor-run/pictor-run-user"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

/** スタンプ選びは押されたときにだけ読み込む */
const StickerDialog = lazy(() =>
  import("~/components/work/sticker-dialog").then((module) => ({
    default: module.StickerDialog,
  })),
)

const MAX_LENGTH = 200

const ACTION_BUTTON =
  "flex h-7 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full bg-white/90 px-2.5 font-bold text-slate-700 text-xs shadow-sm hover:bg-white"

type Props = Readonly<{
  messages: PictorRunMessage[]
  isLoaded: boolean
  viewer: { id: string; name: string } | null
  isModerator: boolean
  onPosted: (message: PictorRunMessage) => void
  onDeleted: (messageId: string) => void
}>

const toTimeText = (epoch: number, now: number, isJa: boolean): string => {
  const seconds = Math.max(0, now - epoch)
  if (seconds < 60) return isJa ? "たった今" : "now"
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return isJa ? `${minutes}分前` : `${minutes}m`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return isJa ? `${hours}時間前` : `${hours}h`
  }
  const date = new Date(epoch * 1000)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

/**
 * 本文の中の「@名前」に色を付ける
 */
function MessageBody(props: {
  body: string
  mentions: PictorRunMention[]
  viewerId: string | null
}): React.ReactNode {
  const parts = useMemo(() => {
    let rest: (string | PictorRunMention)[] = [props.body]
    for (const mention of props.mentions) {
      const token = `@${mention.name}`
      rest = rest.flatMap((part) => {
        if (typeof part !== "string") return [part]
        const pieces = part.split(token)
        return pieces.flatMap((piece, index) =>
          index === 0 ? [piece] : [mention, piece],
        )
      })
    }
    return rest
  }, [props.body, props.mentions])

  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-snug [overflow-wrap:anywhere]">
      {parts.map((part, index) =>
        typeof part === "string" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: 並びは変わらない
          <span key={index}>{part}</span>
        ) : (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: 並びは変わらない
            key={index}
            className={cn(
              "rounded px-0.5 font-bold",
              part.userId === props.viewerId
                ? "bg-amber-200 text-amber-900"
                : "text-blue-700",
            )}
          >
            @{part.name}
          </span>
        ),
      )}
    </p>
  )
}

/**
 * みんなで共通のチャット欄（コメントとスタンプ。返信・メンションができる）
 */
export function PictorRunChatPanel(props: Props): React.ReactNode {
  const t = useTranslation()
  const isJa = t("ja", "en") === "ja"
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isAtBottomRef = useRef(true)
  const [text, setText] = useState("")
  const [replyTo, setReplyTo] = useState<PictorRunMessage | null>(null)
  const [mentions, setMentions] = useState<PictorRunMention[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStickerOpen, setIsStickerOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  /** 押して、返信などのボタンを出している書き込み */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      30_000,
    )
    return () => window.clearInterval(timer)
  }, [])

  const lastId = props.messages.at(-1)?.id ?? null

  // 新しい書き込みが来たら下まで送る（さかのぼって読んでいる間は動かさず、知らせだけ出す）
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    if (isAtBottomRef.current) {
      list.scrollTop = list.scrollHeight
      setHasNew(false)
    } else if (lastId !== null) {
      setHasNew(true)
    }
  }, [lastId, props.isLoaded])

  const scrollToBottom = () => {
    const list = listRef.current
    if (!list) return
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" })
    setHasNew(false)
  }

  const errorText = (code: string): string => {
    if (code === "rate_limited")
      return t("少し待ってから送ってください。", "Please wait a moment.")
    if (code === "duplicate")
      return t("同じ内容は続けて送れません。", "You already sent that.")
    if (code === "comment_banned")
      return t("現在コメントできません。", "You cannot comment right now.")
    if (code === "login_required" || code === "Unauthorized")
      return t("ログインが必要です。", "Please log in.")
    return t("送信できませんでした。", "Could not send.")
  }

  const send = async (sticker?: { id: string; url: string }) => {
    const body = sticker ? "" : text.trim()
    if (isSending || (!sticker && body.length === 0)) return
    setIsSending(true)
    setError(null)
    try {
      const { message } = await postPictorRunMessage({
        body,
        stickerId: sticker?.id,
        stickerUrl: sticker?.url,
        replyToId: replyTo?.id,
        mentions: mentions.filter((item) => body.includes(`@${item.name}`)),
      })
      props.onPosted(message)
      isAtBottomRef.current = true
      if (!sticker) setText("")
      setReplyTo(null)
      setMentions([])
    } catch (caught) {
      setError(
        errorText(caught instanceof PictorRunApiError ? caught.code : ""),
      )
    } finally {
      setIsSending(false)
    }
  }

  const addMention = (message: PictorRunMessage) => {
    const token = `@${message.user.name} `
    setMentions((items) =>
      items.some((item) => item.userId === message.user.id)
        ? items
        : [...items, { userId: message.user.id, name: message.user.name }],
    )
    setText((value) =>
      value.includes(token.trim())
        ? value
        : `${value}${token}`.slice(0, MAX_LENGTH),
    )
    inputRef.current?.focus()
  }

  const remove = async (message: PictorRunMessage) => {
    if (
      !window.confirm(t("この書き込みを消しますか？", "Delete this message?"))
    ) {
      return
    }
    try {
      await deletePictorRunMessage(message.id)
      props.onDeleted(message.id)
    } catch {
      setError(t("消せませんでした。", "Could not delete."))
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#8fb0d9]">
      <div className="relative min-h-0 flex-1">
        <div
          ref={listRef}
          className="h-full overflow-y-auto overscroll-contain px-2.5 py-3"
          onScroll={(event) => {
            const list = event.currentTarget
            const isAtBottom =
              list.scrollHeight - list.scrollTop - list.clientHeight < 48
            isAtBottomRef.current = isAtBottom
            if (isAtBottom) setHasNew(false)
          }}
        >
          {!props.isLoaded && (
            <p className="mx-auto mt-4 w-fit rounded-full bg-black/20 px-4 py-1 text-white text-xs">
              {t("よみこみ中…", "Loading…")}
            </p>
          )}
          {props.isLoaded && props.messages.length === 0 && (
            <p className="mx-auto mt-4 max-w-64 rounded-2xl bg-black/20 px-4 py-2 text-center text-white text-xs leading-relaxed">
              {t(
                "まだ書き込みがありません。スコアを自慢したり、あいさつしてみましょう！",
                "No messages yet. Say hi or brag about your score!",
              )}
            </p>
          )}
          {props.messages.map((message, index) => {
            const isMine = message.user.id === props.viewer?.id
            const isForMe =
              props.viewer !== null &&
              !isMine &&
              (message.replyTo?.userId === props.viewer.id ||
                message.mentions.some(
                  (item) => item.userId === props.viewer?.id,
                ))
            const previous = props.messages[index - 1]
            // 同じ人が続けて書いたときは、アイコンと名前をくり返さない
            const isContinued =
              previous !== undefined &&
              previous.user.id === message.user.id &&
              message.createdAt - previous.createdAt < 300
            const isSelected = selectedId === message.id
            const canAct = props.viewer !== null
            const select = () => {
              if (canAct) setSelectedId(isSelected ? null : message.id)
            }
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-1.5",
                  isMine && "flex-row-reverse",
                  isContinued ? "mt-1" : "mt-3 first:mt-0",
                )}
              >
                {!isMine &&
                  (isContinued ? (
                    <span className="w-9 shrink-0" />
                  ) : (
                    <PictorRunAvatar user={message.user} size={36} />
                  ))}
                <div
                  className={cn(
                    "flex min-w-0 flex-1 flex-col",
                    isMine ? "items-end" : "items-start",
                  )}
                >
                  {!isMine && !isContinued && (
                    <div className="mb-0.5 max-w-full px-1 text-slate-800">
                      <PictorRunUserName user={message.user} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex max-w-full items-end gap-1",
                      isMine && "flex-row-reverse",
                    )}
                  >
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: 吹き出しを押すと、下に返信などのボタンが出る（ボタン自体はキーボードでも押せる） */}
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: 同上 */}
                    <div
                      onClick={select}
                      className={cn(
                        "min-w-0 max-w-[15.5rem]",
                        canAct && "cursor-pointer",
                        message.body.length > 0 || message.replyTo
                          ? cn(
                              "rounded-2xl px-3 py-2 text-slate-900 shadow-sm",
                              isMine
                                ? "rounded-tr-md bg-[#8de055]"
                                : "rounded-tl-md bg-white",
                              isForMe && "ring-2 ring-amber-400",
                            )
                          : "",
                      )}
                    >
                      {message.replyTo && (
                        <p
                          className={cn(
                            "mb-1 flex items-center gap-1 border-l-2 pl-1.5 text-xs",
                            isMine
                              ? "border-green-700/50 text-green-950/70"
                              : "border-slate-300 text-slate-500",
                          )}
                        >
                          <CornerDownRightIcon
                            aria-hidden="true"
                            className="size-3 shrink-0"
                          />
                          <span className="max-w-20 shrink-0 truncate font-bold">
                            {message.replyTo.name}
                          </span>
                          <span className="truncate">
                            {message.replyTo.excerpt}
                          </span>
                        </p>
                      )}
                      {message.body.length > 0 && (
                        <MessageBody
                          body={message.body}
                          mentions={message.mentions}
                          viewerId={props.viewer?.id ?? null}
                        />
                      )}
                      {message.stickerUrl && (
                        <img
                          src={message.stickerUrl}
                          alt={t("スタンプ", "Sticker")}
                          width={112}
                          height={112}
                          loading="lazy"
                          decoding="async"
                          className="size-28 object-contain drop-shadow-sm"
                        />
                      )}
                    </div>
                    <span className="shrink-0 pb-0.5 text-[10px] text-slate-700 leading-none">
                      {toTimeText(message.createdAt, now, isJa)}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(message)
                          setSelectedId(null)
                          inputRef.current?.focus()
                        }}
                        className={ACTION_BUTTON}
                      >
                        <ReplyIcon aria-hidden="true" className="size-3.5" />
                        {t("返信", "Reply")}
                      </button>
                      {!isMine && (
                        <button
                          type="button"
                          onClick={() => {
                            addMention(message)
                            setSelectedId(null)
                          }}
                          className={ACTION_BUTTON}
                        >
                          <AtSignIcon aria-hidden="true" className="size-3.5" />
                          {t("メンション", "Mention")}
                        </button>
                      )}
                      {(isMine || props.isModerator) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(null)
                            void remove(message)
                          }}
                          className={cn(ACTION_BUTTON, "text-rose-600")}
                        >
                          <Trash2Icon aria-hidden="true" className="size-3.5" />
                          {t("消す", "Delete")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {hasNew && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="-translate-x-1/2 absolute bottom-3 left-1/2 cursor-pointer whitespace-nowrap rounded-full bg-slate-800/90 px-4 py-1.5 font-bold text-white text-xs shadow-lg"
          >
            {t("新しい書き込み ↓", "New messages ↓")}
          </button>
        )}
      </div>

      {props.viewer === null ? (
        <p className="bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-slate-600 text-sm">
          <a
            href="/login"
            className="font-bold text-clear-bright-blue underline"
          >
            {t("ログイン", "Log in")}
          </a>
          {t("するとチャットに参加できます", " to join the chat")}
        </p>
      ) : (
        <form
          className="bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          onSubmit={(event) => {
            event.preventDefault()
            void send()
          }}
        >
          {replyTo && (
            <p className="mb-1 flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-slate-600 text-xs">
              <ReplyIcon aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">
                {t(
                  `${replyTo.user.name} に返信`,
                  `Replying to ${replyTo.user.name}`,
                )}
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                aria-label={t("返信をやめる", "Cancel reply")}
                className="ml-auto flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-slate-200"
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            </p>
          )}
          {error && (
            <p role="alert" className="mb-1 px-1 text-rose-600 text-xs">
              {error}
            </p>
          )}
          <div className="flex items-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsStickerOpen(true)}
              aria-label={t("スタンプ", "Stickers")}
              title={t("スタンプ", "Stickers")}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <SmileIcon aria-hidden="true" className="size-5" />
            </button>
            <textarea
              ref={inputRef}
              value={text}
              rows={1}
              maxLength={MAX_LENGTH}
              placeholder={t("コメントを書く", "Write a comment")}
              aria-label={t("コメント", "Comment")}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                // 変換を確定する Enter では送らない
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault()
                  void send()
                }
              }}
              className="max-h-24 min-h-10 min-w-0 flex-1 resize-none rounded-3xl bg-slate-100 px-4 py-2 text-base text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[#06c755] md:text-sm"
            />
            <button
              type="submit"
              disabled={isSending || text.trim().length === 0}
              aria-label={t("送る", "Send")}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#06c755] text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:bg-slate-300"
            >
              <SendIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
        </form>
      )}

      {isStickerOpen && (
        <Suspense fallback={null}>
          <StickerDialog
            isOpen={true}
            onClose={() => setIsStickerOpen(false)}
            onSend={(stickerId, stickerImageURL) => {
              setIsStickerOpen(false)
              void send({ id: stickerId, url: stickerImageURL })
            }}
          />
        </Suspense>
      )}
    </div>
  )
}

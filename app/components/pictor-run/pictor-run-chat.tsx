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
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
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
                : "text-clear-bright-blue",
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
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-2"
        onScroll={(event) => {
          const list = event.currentTarget
          const isAtBottom =
            list.scrollHeight - list.scrollTop - list.clientHeight < 48
          isAtBottomRef.current = isAtBottom
          if (isAtBottom) setHasNew(false)
        }}
      >
        {!props.isLoaded && (
          <p className="py-6 text-center text-slate-400 text-sm">
            {t("よみこみ中…", "Loading…")}
          </p>
        )}
        {props.isLoaded && props.messages.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-500 text-sm">
            {t(
              "まだ書き込みがありません。スコアを自慢したり、あいさつしてみましょう！",
              "No messages yet. Say hi or brag about your score!",
            )}
          </p>
        )}
        {props.messages.map((message) => {
          const isMine = message.user.id === props.viewer?.id
          const isForMe =
            props.viewer !== null &&
            !isMine &&
            (message.replyTo?.userId === props.viewer.id ||
              message.mentions.some((item) => item.userId === props.viewer?.id))
          return (
            <div
              key={message.id}
              className={cn(
                "group flex gap-2 rounded-xl px-2 py-1.5",
                isForMe
                  ? "bg-amber-50 ring-1 ring-amber-200"
                  : "hover:bg-slate-50",
              )}
            >
              <PictorRunAvatar user={message.user} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <PictorRunUserName user={message.user} />
                  <span className="shrink-0 text-slate-400 text-xs">
                    {toTimeText(message.createdAt, now, isJa)}
                  </span>
                  {props.viewer !== null && (
                    <span className="ml-auto flex shrink-0 gap-0.5 opacity-70 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(message)
                          inputRef.current?.focus()
                        }}
                        aria-label={t("返信", "Reply")}
                        title={t("返信", "Reply")}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
                      >
                        <ReplyIcon aria-hidden="true" className="size-4" />
                      </button>
                      {!isMine && (
                        <button
                          type="button"
                          onClick={() => addMention(message)}
                          aria-label={t("メンション", "Mention")}
                          title={t("メンション", "Mention")}
                          className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
                        >
                          <AtSignIcon aria-hidden="true" className="size-4" />
                        </button>
                      )}
                      {(isMine || props.isModerator) && (
                        <button
                          type="button"
                          onClick={() => void remove(message)}
                          aria-label={t("消す", "Delete")}
                          title={t("消す", "Delete")}
                          className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-600"
                        >
                          <Trash2Icon aria-hidden="true" className="size-4" />
                        </button>
                      )}
                    </span>
                  )}
                </div>
                {message.replyTo && (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-slate-500 text-xs">
                    <CornerDownRightIcon
                      aria-hidden="true"
                      className="size-3 shrink-0"
                    />
                    <span className="shrink-0 font-bold">
                      {message.replyTo.name}
                    </span>
                    <span className="truncate">{message.replyTo.excerpt}</span>
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
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="mt-1 size-24 rounded-lg object-contain"
                  />
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
          className="-translate-x-1/2 absolute bottom-28 left-1/2 cursor-pointer rounded-full bg-slate-800 px-4 py-1.5 font-bold text-white text-xs shadow-lg"
        >
          {t("新しい書き込み ↓", "New messages ↓")}
        </button>
      )}

      {props.viewer === null ? (
        <p className="border-t bg-slate-50 px-4 py-3 text-center text-slate-600 text-sm">
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
          className="border-t bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
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
              className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border bg-slate-50 px-3 py-2 text-base text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-clear-bright-blue md:text-sm"
            />
            <button
              type="submit"
              disabled={isSending || text.trim().length === 0}
              aria-label={t("送る", "Send")}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-clear-bright-blue text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
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

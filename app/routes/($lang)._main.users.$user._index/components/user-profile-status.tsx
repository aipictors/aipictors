import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

const STATUS_MAX_LENGTH = 60

const SWITCH_ID = "user-status-visible"

/** 消えるまでの時間（分）。null は消さない */
const EXPIRY_OPTIONS: { minutes: number | null; ja: string; en: string }[] = [
  { minutes: 30, ja: "30分", en: "30 minutes" },
  { minutes: 60, ja: "1時間", en: "1 hour" },
  { minutes: 240, ja: "4時間", en: "4 hours" },
  { minutes: 1440, ja: "24時間", en: "24 hours" },
  { minutes: 4320, ja: "3日", en: "3 days" },
  { minutes: 10080, ja: "7日", en: "7 days" },
  { minutes: null, ja: "消さない", en: "Don't clear" },
]

/** 選択肢の「今の期限のまま」 */
const KEEP_EXPIRY = "keep"

type ExpiryChoice = typeof KEEP_EXPIRY | number | null

type Props = {
  /** 他の人に見えているステータス */
  statusText: string | null
  isOwn: boolean
}

const BUBBLE_CLASS_NAME =
  "relative block w-max max-w-[calc(100vw-8rem)] rounded-3xl bg-popover px-3.5 py-2 text-left text-popover-foreground text-sm leading-snug shadow-lg ring-1 ring-border/60 md:max-w-md"

/**
 * Discord のような、アイコンの横の吹き出し。ヘッダーとその下の境目を中心に置く
 * 長い文はスマホだと 4 行になって吹き出しが大きくなるので 2 行で省略し、他の人は押すと全文が読める
 * 自分のページでは押して変えられる
 */
export function UserProfileStatus(props: Props) {
  if (props.isOwn) {
    return <OwnUserProfileStatus statusText={props.statusText} />
  }
  if (props.statusText === null) {
    return null
  }
  return <PublicUserProfileStatus statusText={props.statusText} />
}

function PublicUserProfileStatus(props: { statusText: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <BubblePosition>
      <button
        type="button"
        title={props.statusText}
        aria-expanded={isExpanded}
        className={BUBBLE_CLASS_NAME}
        onClick={() => setIsExpanded((value) => !value)}
      >
        <span className={cn("break-words", !isExpanded && "line-clamp-2")}>
          {props.statusText}
        </span>
      </button>
    </BubblePosition>
  )
}

function BubblePosition(props: { children: React.ReactNode }) {
  return (
    <div className="-translate-y-1/2 absolute top-14 left-[calc(100%+0.25rem)] z-20 md:top-20 md:left-[calc(100%+0.5rem)]">
      {/* 吹き出しの丸 2 つ。大きい方は本体の下にもぐらせてつなげる */}
      <span className="-bottom-3.5 absolute left-1 size-2 rounded-full bg-popover shadow-md ring-1 ring-border/60" />
      <span className="-bottom-1.5 absolute left-4 size-4 rounded-full bg-popover shadow-md ring-1 ring-border/60" />
      {props.children}
    </div>
  )
}

function OwnUserProfileStatus(props: { statusText: string | null }) {
  const t = useTranslation()
  const { data } = useQuery(viewerUserStatusQuery)
  const [isOpen, setIsOpen] = useState(false)

  const status = data?.viewerUserStatus
  const text = status?.text ?? props.statusText ?? ""
  const isVisible = status?.isVisible ?? true

  return (
    <>
      <BubblePosition>
        <button
          type="button"
          className={cn(BUBBLE_CLASS_NAME, "transition hover:brightness-95")}
          onClick={() => setIsOpen(true)}
        >
          {text.length > 0 ? (
            <span
              className={cn(
                "line-clamp-2 break-words",
                !isVisible && "text-muted-foreground",
              )}
            >
              {text}
              {!isVisible && (
                <span className="ml-1.5 whitespace-nowrap text-xs">
                  {t("（非表示）", "(Hidden)")}
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <PlusIcon className="size-3.5" strokeWidth={3} />
              </span>
              {t("ステータスを設定", "Set a status")}
            </span>
          )}
        </button>
      </BubblePosition>
      {isOpen && (
        <UserStatusDialog
          text={text}
          isVisible={isVisible}
          expiresAt={status?.expiresAt ?? null}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

const toExpiresAt = (choice: ExpiryChoice, currentExpiresAt: number | null) => {
  if (choice === KEEP_EXPIRY) return currentExpiresAt
  if (choice === null) return null
  return Math.floor(Date.now() / 1000) + choice * 60
}

const formatExpiresAt = (expiresAt: number) => {
  return new Date(expiresAt * 1000).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function UserStatusDialog(props: {
  text: string
  isVisible: boolean
  expiresAt: number | null
  onClose: () => void
}) {
  const t = useTranslation()
  const [text, setText] = useState(props.text)
  const [isVisible, setIsVisible] = useState(props.isVisible)
  const [expiryChoice, setExpiryChoice] = useState<ExpiryChoice>(
    props.expiresAt !== null ? KEEP_EXPIRY : null,
  )
  const [updateStatus, { loading }] = useMutation(updateUserStatusMutation, {
    refetchQueries: [viewerUserStatusQuery],
    awaitRefetchQueries: true,
  })

  const length = Array.from(text.trim()).length
  const isTooLong = length > STATUS_MAX_LENGTH

  const save = async (nextText: string) => {
    try {
      await updateStatus({
        variables: {
          input: {
            text: nextText,
            isVisible,
            expiresAt: toExpiresAt(expiryChoice, props.expiresAt),
          },
        },
      })
      toast(t("ステータスを更新しました", "Status updated"))
      props.onClose()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("更新できませんでした", "Could not update"),
      )
    }
  }

  const options: { value: ExpiryChoice; label: string }[] = [
    ...(props.expiresAt !== null
      ? [
          {
            value: KEEP_EXPIRY as ExpiryChoice,
            label: t(
              `今の期限（${formatExpiresAt(props.expiresAt)}）`,
              `Current (${formatExpiresAt(props.expiresAt)})`,
            ),
          },
        ]
      : []),
    ...EXPIRY_OPTIONS.map((option) => ({
      value: option.minutes,
      label: t(option.ja, option.en),
    })),
  ]

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ステータス", "Status")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Input
              aria-label={t("ステータス", "Status")}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t(
                "例: 今週は忙しいので投稿をお休みします",
                "e.g. Taking a break from posting this week",
              )}
            />
            <p
              className={cn(
                "text-right text-xs",
                isTooLong ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {length} / {STATUS_MAX_LENGTH}
            </p>
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm">
              {t("自動で消すまでの時間", "Clear after")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  aria-pressed={expiryChoice === option.value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    expiryChoice === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                  onClick={() => setExpiryChoice(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={SWITCH_ID} className="cursor-pointer text-sm">
              {t("プロフィールに表示する", "Show on my profile")}
            </label>
            <Switch
              id={SWITCH_ID}
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
          </div>
          <div className="flex justify-end gap-2">
            {props.text.length > 0 && (
              <Button
                variant="ghost"
                disabled={loading}
                onClick={() => save("")}
              >
                {t("消す", "Clear")}
              </Button>
            )}
            <Button disabled={loading || isTooLong} onClick={() => save(text)}>
              {t("保存", "Save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const viewerUserStatusQuery = graphql(
  `query ViewerUserStatus {
    viewerUserStatus {
      text
      isVisible
      expiresAt
    }
  }`,
)

const updateUserStatusMutation = graphql(
  `mutation UpdateUserStatus($input: UpdateUserStatusInput!) {
    updateUserStatus(input: $input) {
      text
      isVisible
      expiresAt
    }
  }`,
)

import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ImageIcon, Loader2Icon, XIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/** ピックアップに選べる数（設定の /settings/profile と同じ） */
const PICKUP_LIMIT = 3

const PAGE_SIZE = 30

type PickupWork = { id: string; title: string; smallThumbnailImageURL: string }

type Props = {
  /** 全年齢のピックアップか、R18 のページのピックアップか */
  kind: "all" | "sensitive"
  /** 今のピックアップ（選んだ順） */
  currentWorks: PickupWork[]
  triggerChildren: React.ReactNode
  /** 保存したあと（一覧を読み直す） */
  onSaved?: () => void
}

/**
 * プロフィールの上で、その場でピックアップ作品を選んで保存する
 * （以前は設定のプロフィールの下の方まで行かないと選べず、場所を聞かれていた）
 */
export function UserPickupEditDialog(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.triggerChildren}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        {isOpen && (
          <PickupEditContent {...props} onClose={() => setIsOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PickupEditContent(props: Props & { onClose: () => void }) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [selected, setSelected] = useState<PickupWork[]>(props.currentWorks)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const isSensitive = props.kind === "sensitive"

  const { data, loading } = useQuery(pickupCandidateWorksQuery, {
    skip: !authContext.userId,
    variables: {
      limit,
      where: {
        userId: authContext.userId,
        orderBy: "DATE_CREATED",
        sort: "DESC",
        ratings: isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        ...(isSensitive && { isSensitive: true }),
        // 投稿から 24 時間以内の作品も選べるように
        isNowCreatedAt: true,
      },
    },
  })

  const [updateProfile, { loading: isSaving }] =
    useMutation(updatePickupMutation)

  const works = data?.works ?? []
  const hasMore = works.length >= limit

  const onToggle = (work: PickupWork) => {
    if (selected.some((item) => item.id === work.id)) {
      setSelected(selected.filter((item) => item.id !== work.id))
      return
    }
    if (selected.length >= PICKUP_LIMIT) {
      toast(
        t(
          `ピックアップは ${PICKUP_LIMIT} つまでです。先にどれかを外してください`,
          `Up to ${PICKUP_LIMIT} pickups. Remove one first.`,
        ),
      )
      return
    }
    setSelected([...selected, work])
  }

  const onSave = async () => {
    const ids = selected.map((work) => work.id)
    try {
      await updateProfile({
        variables: {
          input: isSensitive
            ? { featuredSensitiveWorkIds: ids }
            : { featuredWorkIds: ids },
        },
      })
      toast(t("ピックアップを保存しました", "Pickups saved"))
      props.onSaved?.()
      props.onClose()
    } catch (error) {
      toast(
        error instanceof Error && error.message.length > 0
          ? error.message
          : t("保存できませんでした", "Could not save"),
      )
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isSensitive
            ? t("R18 のピックアップを選ぶ", "Choose R18 pickups")
            : t("ピックアップを選ぶ", "Choose pickups")}
        </DialogTitle>
        <DialogDescription>
          {t(
            `プロフィールの上に出す作品を ${PICKUP_LIMIT} つまで選べます。押した順に並びます。`,
            `Pick up to ${PICKUP_LIMIT} works to show at the top of your profile, in the order you tap them.`,
          )}
        </DialogDescription>
      </DialogHeader>

      {/* 今選んでいるもの。古い作品は下の一覧の最初のページにないので、ここから外せるようにする */}
      <div className="flex items-center gap-2">
        {Array.from({ length: PICKUP_LIMIT }, (_, index) => {
          const work = selected[index]
          return work ? (
            <button
              key={work.id}
              type="button"
              onClick={() => onToggle(work)}
              aria-label={t(`${work.title} を外す`, `Remove ${work.title}`)}
              className="group relative size-16 overflow-hidden rounded-lg bg-muted md:size-20"
            >
              <img
                src={toResizedImageUrl(work.smallThumbnailImageURL, 240)}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[11px] text-primary-foreground">
                {index + 1}
              </span>
              <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white">
                <XIcon className="size-3" />
              </span>
            </button>
          ) : (
            <div
              key={`empty-${index}`}
              className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground text-xs md:size-20"
            >
              {index + 1}
            </div>
          )
        })}
        <p className="ml-1 text-muted-foreground text-xs leading-5">
          {t("押すと外れます", "Tap to remove")}
        </p>
      </div>

      <div className="max-h-[45vh] overflow-y-auto pr-1">
        {loading && works.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : works.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
            <ImageIcon className="size-8 opacity-60" />
            {t("選べる作品がありません", "No works to choose")}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {works.map((work) => {
              const order = selected.findIndex((item) => item.id === work.id)
              const isSelected = order !== -1
              return (
                <button
                  key={work.id}
                  type="button"
                  onClick={() => onToggle(work)}
                  aria-pressed={isSelected}
                  aria-label={work.title}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition",
                    isSelected
                      ? "ring-2 ring-primary"
                      : "hover:opacity-80 active:scale-95",
                  )}
                >
                  <img
                    src={toResizedImageUrl(work.smallThumbnailImageURL, 240)}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <span className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs shadow">
                      {order + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
        {hasMore && (
          <div className="mt-3 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={() => setLimit(limit + PAGE_SIZE)}
            >
              {t("もっと見る", "Show more")}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-3">
        <span className="text-muted-foreground text-sm tabular-nums">
          {selected.length} / {PICKUP_LIMIT}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={props.onClose}>
            {t("キャンセル", "Cancel")}
          </Button>
          <Button disabled={isSaving} onClick={onSave}>
            {isSaving && <Loader2Icon className="size-4 animate-spin" />}
            {t("保存", "Save")}
          </Button>
        </div>
      </div>
    </>
  )
}

const pickupCandidateWorksQuery = graphql(
  `query PickupCandidateWorks($limit: Int!, $where: WorksWhereInput) {
    works(offset: 0, limit: $limit, where: $where) {
      id
      title
      smallThumbnailImageURL
    }
  }`,
)

const updatePickupMutation = graphql(
  `mutation UpdateUserPickup($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
    }
  }`,
)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Heart, MessageCircle, Eye, ExternalLink, X } from "lucide-react"
import { Link } from "@remix-run/react"
import { OptimizedImage } from "~/components/optimized-image"
import { LikeButton } from "~/components/like-button"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"

type WorkDetailWork = {
  id: string
  title: string
  smallThumbnailImageURL: string
  smallThumbnailImageWidth: number
  smallThumbnailImageHeight: number
  largeThumbnailImageURL: string
  largeThumbnailImageWidth: number
  largeThumbnailImageHeight: number
  subWorksCount: number
  likesCount: number
  commentsCount: number
  viewsCount: number
  isLiked: boolean
  user: {
    id: string
    login?: string | null
    name: string
    iconUrl?: string | null
  } | null
}

type Props = {
  work: WorkDetailWork
  open: boolean
  onClose: () => void
}

/**
 * 作品詳細ダイアログ
 */
export function WorkDetailDialog (props: Props) {
  const t = useTranslation()
  const { work } = props

  if (!work) return null

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* 画像部分 */}
          <div className="relative flex items-center justify-center bg-black/5">
            <OptimizedImage
              src={work.largeThumbnailImageURL || work.smallThumbnailImageURL}
              alt={work.title}
              width={
                work.largeThumbnailImageWidth || work.smallThumbnailImageWidth
              }
              height={
                work.largeThumbnailImageHeight || work.smallThumbnailImageHeight
              }
              className="max-h-full max-w-full object-contain"
            />

            {/* 閉じるボタン */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/20 text-white hover:bg-black/40"
              onClick={props.onClose}
            >
              <X className="size-4" />
            </Button>

            {/* サブ作品数バッジ */}
            {work.subWorksCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 bg-black/60 text-white"
              >
                +{work.subWorksCount}
              </Badge>
            )}
          </div>

          {/* 詳細情報部分 */}
          <div className="overflow-y-auto p-6">
            <DialogHeader className="space-y-4">
              <DialogTitle className="font-bold text-xl leading-tight">
                {work.title}
              </DialogTitle>

              {/* ユーザー情報 */}
              {work.user && (
                <Link
                  to={`/posts/gallery/users/${work.user.login ?? work.user.id}`}
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={withIconUrlFallback(work.user.iconUrl)}
                      alt={work.user.name}
                    />
                    <AvatarFallback>{work.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{work.user.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {t("作者", "Artist")}
                    </p>
                  </div>
                </Link>
              )}
            </DialogHeader>

            {/* 統計情報 */}
            <div className="mt-6 flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Heart className="size-4" />
                <span>{work.likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="size-4" />
                <span>{work.viewsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="size-4" />
                <span>{work.commentsCount}</span>
              </div>
            </div>

            {/* いいねボタン */}
            <div className="mt-6">
              <LikeButton
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.user?.id ?? ""}
                defaultLiked={work.isLiked}
                defaultLikedCount={work.likesCount}
                size={40}
                strokeWidth={2}
              />
            </div>

            {/* 作品詳細へのリンク */}
            <div className="mt-6 border-t pt-6">
              <Button asChild className="w-full" onClick={props.onClose}>
                <Link
                  to={`/posts/${work.id}`}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="size-4" />
                  {t("作品詳細を見る", "View Details")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

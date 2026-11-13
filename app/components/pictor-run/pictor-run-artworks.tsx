import { LikeButton } from "~/components/like-button"
import type { PictorRunArtwork } from "~/components/pictor-run/pictor-run-api"
import { useTranslation } from "~/hooks/use-translation"

type Props = Readonly<{
  works: PictorRunArtwork[]
}>

/**
 * その回に額ぶちに出てきた作品の一覧（作者の名前・作品のページへのリンク・いいね）。
 * 走り終わったあとにだけ出すので、走っている間の負荷にはならない
 */
export function PictorRunArtworks(props: Props): React.ReactNode {
  const t = useTranslation()
  if (props.works.length === 0) return null

  return (
    <div className="w-full">
      <p className="mb-1.5 text-left font-black text-slate-600 text-xs">
        {t("今回出てきた作品", "Artworks you passed")}
      </p>
      <ul className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1">
        {props.works.map((work) => (
          <li
            key={work.id}
            className="w-24 shrink-0 overflow-hidden rounded-xl border bg-white"
          >
            <a
              href={`/posts/${work.id}`}
              target="_blank"
              rel="noreferrer"
              title={work.title}
              className="block"
            >
              <img
                src={work.imageUrl}
                alt={work.title}
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
            </a>
            <div className="flex items-center gap-1 px-1.5 py-1">
              <p
                className="min-w-0 flex-1 truncate text-left font-bold text-[10px] text-slate-700"
                title={work.userName}
              >
                {work.userName}
              </p>
              <LikeButton
                size={28}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.userId}
                defaultLiked={false}
                defaultLikedCount={work.likesCount}
                isBackgroundNone={true}
                strokeWidth={2}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

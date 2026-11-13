import { BoxIcon, DownloadIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  PICTOR_CHAN_3D_FILES,
  PICTOR_CHAN_3D_VERSION,
} from "~/lib/pictor-chan/pictor-chan-3d"
import { PICTOR_CHAN_CREDIT } from "~/lib/pictor-chan/pictor-chan-license"

/**
 * ぴくたーちゃんの 3D モデルの配布（ページの主役ではないので、素材のひとつとして小さく見せる）
 */
export function PictorChan3dSection(): React.ReactNode {
  const t = useTranslation()

  return (
    <div className="rounded-3xl border bg-card p-6 md:p-8">
      <div className="flex gap-4">
        <img
          src="/images/pictor-chan/pictor-chan-3d-preview-2.webp"
          alt={t("ぴくたーちゃんの3Dモデル", "The Pictor-chan 3D model")}
          width={495}
          height={900}
          loading="lazy"
          decoding="async"
          className="hidden h-36 w-auto shrink-0 sm:block"
        />
        <div className="min-w-0 space-y-3">
          <h2 className="flex items-center gap-2 font-black text-lg">
            <BoxIcon aria-hidden="true" className="size-5 text-[#2d6cdf]" />
            {t("3Dモデル", "3D model")}
            <span className="font-bold text-muted-foreground text-xs">
              v{PICTOR_CHAN_3D_VERSION}
            </span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(
              "ぴくたーちゃんの 3D モデルも用意しています。個人・法人、商用を問わず使えます。",
              "A 3D model of Pictor-chan is also available, free for personal and commercial use.",
            )}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs leading-relaxed">
            {PICTOR_CHAN_3D_FILES.features.map(([ja, en]) => (
              <li key={ja}>{t(ja, en)}</li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-2">
            {PICTOR_CHAN_3D_FILES.downloads.map((file) => (
              <li key={file.url}>
                <a
                  href={file.url}
                  download
                  title={t(file.note[0], file.note[1])}
                  className="flex h-9 items-center gap-1.5 rounded-full border px-4 font-bold text-xs transition-colors hover:bg-muted/60"
                >
                  <DownloadIcon aria-hidden="true" className="size-3.5" />
                  {t(file.name[0], file.name[1])}
                  <span className="font-normal text-muted-foreground">
                    {file.size}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t(
              `使うときは、作品のどこかに「${PICTOR_CHAN_CREDIT}」の表記をお願いします。`,
              `When you use it, please show the credit "${PICTOR_CHAN_CREDIT}" somewhere in your work.`,
            )}{" "}
            <Link to="/pictor-chan/license" className="font-bold underline">
              {t("ぴくたーちゃんライセンス", "Pictor-chan License")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

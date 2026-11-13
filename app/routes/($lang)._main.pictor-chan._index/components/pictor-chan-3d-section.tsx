import { CheckIcon, DownloadIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  PICTOR_CHAN_3D_FILES,
  PICTOR_CHAN_3D_VERSION,
} from "~/lib/pictor-chan/pictor-chan-3d"
import { PICTOR_CHAN_CREDIT } from "~/lib/pictor-chan/pictor-chan-license"

/**
 * ぴくたーちゃんの 3D モデルの配布
 */
export function PictorChan3dSection(): React.ReactNode {
  const t = useTranslation()

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="grid md:grid-cols-[18rem_1fr]">
        <div className="relative flex items-end justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 px-6 pt-8 dark:from-sky-900 dark:via-indigo-950 dark:to-slate-900">
          <span className="absolute top-4 left-4 rounded-full bg-white/80 px-3 py-1 font-black text-slate-800 text-xs">
            v{PICTOR_CHAN_3D_VERSION}
          </span>
          <img
            src="/images/pictor-chan/pictor-chan-3d-preview.webp"
            alt={t("ぴくたーちゃんの3Dモデル", "The Pictor-chan 3D model")}
            width={477}
            height={900}
            loading="lazy"
            decoding="async"
            className="pkc-float h-72 w-auto drop-shadow-xl md:h-80"
          />
        </div>
        <div className="space-y-5 p-6 md:p-8">
          <p className="text-sm leading-relaxed md:text-base">
            {t(
              "ぴくたーちゃんの 3D モデルを無料で配布しています。ゲーム・動画・配信・イラストの資料・グッズなど、個人でも法人でも、商用でも自由に使えます。",
              "The Pictor-chan 3D model is free to download. Use it for games, videos, streaming, drawing reference, merchandise and more — individuals and companies, commercial use included.",
            )}
          </p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {PICTOR_CHAN_3D_FILES.features.map(([ja, en]) => (
              <li key={ja} className="flex gap-2">
                <CheckIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-emerald-500"
                />
                <span>{t(ja, en)}</span>
              </li>
            ))}
          </ul>
          <div className="grid gap-2 sm:grid-cols-2">
            {PICTOR_CHAN_3D_FILES.downloads.map((file, index) => (
              <a
                key={file.url}
                href={file.url}
                download
                className={
                  index === 0
                    ? "pkc-card flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#ff8a1f] to-[#ff6f91] p-4 text-white sm:col-span-2"
                    : "pkc-card flex items-center justify-between gap-3 rounded-2xl border p-4 hover:bg-muted/50"
                }
              >
                <span className="min-w-0">
                  <span className="block truncate font-black text-sm">
                    {t(file.name[0], file.name[1])}
                  </span>
                  <span
                    className={
                      index === 0
                        ? "block text-white/85 text-xs"
                        : "block text-muted-foreground text-xs"
                    }
                  >
                    {t(file.note[0], file.note[1])} ・ {file.size}
                  </span>
                </span>
                <DownloadIcon aria-hidden="true" className="size-5 shrink-0" />
              </a>
            ))}
          </div>
          <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed">
            <p>
              {t(
                "利用条件は「ぴくたーちゃんライセンス」です。作品のどこかに次の表記をお願いします。",
                'The terms of use are the "Pictor-chan License". Please show this credit somewhere in your work.',
              )}
            </p>
            <p className="mt-2 font-black">{PICTOR_CHAN_CREDIT}</p>
            <p className="mt-2">
              <Link to="/pictor-chan/license" className="font-bold underline">
                {t(
                  "ぴくたーちゃんライセンスを読む",
                  "Read the Pictor-chan License",
                )}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

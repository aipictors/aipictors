import { BoxIcon, Download, Gamepad2Icon } from "lucide-react"
import { lazy, Suspense, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  PICTOR_CHAN_3D_FILES,
  PICTOR_CHAN_3D_VERSION,
} from "~/lib/pictor-chan/pictor-chan-3d"
import { PICTOR_CHAN_CREDIT } from "~/lib/pictor-chan/pictor-chan-license"

/** ミニゲームは押されたときにだけ読み込む（ページの表示を重くしない） */
const PictorRunOverlay = lazy(
  () => import("~/components/pictor-run/pictor-run-overlay"),
)

/**
 * ぴくたーちゃんの 3D モデルの配布と、ミニゲーム「ぴくたーちゃんラン」
 */
export function PictorChan3dSection(): React.ReactNode {
  const t = useTranslation()
  const [isGameOpen, setIsGameOpen] = useState(false)

  return (
    <>
      <Card id="game">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2Icon className="h-5 w-5 text-emerald-500" />
            {t(
              "ミニゲーム「ぴくたーちゃんラン」",
              "Mini game: Pictor-chan Run",
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <img
              src="/images/pictor-chan/pictor-run-thumbnail.webp"
              alt={t(
                "ぴくたーちゃんランのゲーム画面",
                "Screenshot of Pictor-chan Run",
              )}
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
              className="aspect-video w-full max-w-sm rounded-xl border object-cover"
            />
            <div className="space-y-3 text-center sm:text-left">
              <p className="text-sm leading-relaxed">
                {t(
                  "3D のぴくたーちゃんが走るミニゲームです。ジャンプで障害物をよけて、コインを集めましょう。みんなのスコアランキングと、スタンプも使えるチャットがあります。",
                  "A mini game where 3D Pictor-chan runs. Jump over obstacles and collect coins. It has a score ranking and a chat with stickers.",
                )}
              </p>
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={() => setIsGameOpen(true)}
              >
                <Gamepad2Icon className="mr-2 h-5 w-5" />
                {t("あそぶ", "Play")}
              </Button>
              <p className="text-muted-foreground text-xs">
                {t(
                  "無料・登録なしで遊べます（ランキングとチャットはログインが必要）",
                  "Free to play without an account (ranking and chat need login)",
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="model-3d">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BoxIcon className="h-5 w-5 text-orange-500" />
            {t(
              `3Dモデル v${PICTOR_CHAN_3D_VERSION}`,
              `3D Model v${PICTOR_CHAN_3D_VERSION}`,
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <img
              src="/images/pictor-chan/pictor-chan-3d-preview.webp"
              alt={t("ぴくたーちゃんの3Dモデル", "The Pictor-chan 3D model")}
              width={477}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-auto w-48 shrink-0 rounded-xl border bg-white sm:w-56"
            />
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                {t(
                  "ぴくたーちゃんの 3D モデルを無料で配布しています。ゲーム・動画・配信・イラストの資料・グッズなど、個人でも法人でも、商用でも自由に使えます。",
                  "The Pictor-chan 3D model is free to download. Use it for games, videos, streaming, drawing reference, merchandise and more — individuals and companies, commercial use included.",
                )}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
                {PICTOR_CHAN_3D_FILES.features.map(([ja, en]) => (
                  <li key={ja}>{t(ja, en)}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {PICTOR_CHAN_3D_FILES.downloads.map((file) => (
              <div
                key={file.url}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">
                    {t(file.name[0], file.name[1])}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t(file.note[0], file.note[1])} ・ {file.size}
                  </p>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <a href={file.url} download>
                    <Download className="mr-1 h-4 w-4" />
                    {t("ダウンロード", "Download")}
                  </a>
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
            <p>
              {t(
                "利用条件は「ぴくたーちゃんライセンス」です。作品のどこかに次の表記をお願いします。",
                'The terms of use are the "Pictor-chan License". Please show this credit somewhere in your work.',
              )}
            </p>
            <p className="mt-2 font-bold">{PICTOR_CHAN_CREDIT}</p>
            <p className="mt-2">
              <Link to="/pictor-chan/license" className="font-medium underline">
                {t(
                  "ぴくたーちゃんライセンスを読む",
                  "Read the Pictor-chan License",
                )}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {isGameOpen && (
        <Suspense fallback={null}>
          <PictorRunOverlay onClose={() => setIsGameOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

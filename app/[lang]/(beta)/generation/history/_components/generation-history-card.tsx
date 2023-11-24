import { ErrorHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/error-history-card"
import { FallbackHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/fallback-history-card"
import { InProgressGenerationCard } from "@/app/[lang]/(beta)/generation/history/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense } from "react"

type Props = {
  taskId: string
  token: string | null
  onClick(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationHistoryCard = (props: Props) => {
  if (props.token == null) {
    return <InProgressGenerationCard />
  }

  return (
    <ErrorBoundary fallback={ErrorHistoryCard}>
      <Suspense fallback={<FallbackHistoryCard />}>
        <Button
          className="p-0 h-auto overflow-hidden border-1 rounded outline-none"
          onClick={props.onClick}
        >
          <PrivateImage taskId={props.taskId} token={props.token} alt={"-"} />
        </Button>
      </Suspense>
    </ErrorBoundary>
  )
}

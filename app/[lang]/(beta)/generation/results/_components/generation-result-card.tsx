import { ErrorResultCard } from "@/app/[lang]/(beta)/generation/results/_components/error-result-card"
import { FallbackResultCard } from "@/app/[lang]/(beta)/generation/results/_components/fallback-result-card"
import { InProgressGenerationCard } from "@/app/[lang]/(beta)/generation/results/_components/in-progress-generation-card"
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
export const GenerationResultCard = (props: Props) => {
  if (props.token == null) {
    return <InProgressGenerationCard />
  }

  return (
    <ErrorBoundary fallback={ErrorResultCard}>
      <Suspense fallback={<FallbackResultCard />}>
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

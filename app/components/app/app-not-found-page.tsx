import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YFhY3hdw0jD
 */
export function AppNotFoundPage (): React.ReactNode {
  const t = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bold text-9xl">404</h1>
      <p className="mt-4 text-xl">
        {t(
          "おっと! お探しのページは存在しないようです。",
          "Oops! The page you're looking for doesn't exist.",
        )}
      </p>
      <Button className="mt-8 rounded-md px-8 py-2">
        <Link to="https://www.aipictors.com">
          {t("ホームに戻る", "Return to Home")}
        </Link>
      </Button>
    </div>
  )
}

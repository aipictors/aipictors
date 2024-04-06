import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YFhY3hdw0jD
 */
export function AppNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bold text-9xl">404</h1>
      <p className="mt-4 text-xl">
        おっと! お探しのページは存在しないようです。
      </p>
      <Button className="mt-8 rounded-md px-8 py-2">
        <Link to="https://www.aipictors.com">ホームに戻る</Link>
      </Button>
    </div>
  )
}

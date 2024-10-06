import { Button } from "~/components/ui/button"
import { Link } from "react-router"

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YFhY3hdw0jD
 */
export function AppDevelopmentPage() {
  return (
    <div className="flex h-main w-full flex-col items-center justify-center">
      <h1 className="font-bold text-9xl">503</h1>
      <p className="mt-4 text-xl">{"このページは開発中です。"}</p>
      <Button className="mt-8 rounded-md px-8 py-2">
        <Link to="https://www.aipictors.com">ホームに戻る</Link>
      </Button>
    </div>
  )
}

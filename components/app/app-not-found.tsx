import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YFhY3hdw0jD
 */
export function AppNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-9xl font-bold">404</h1>
      <p className="mt-4 text-xl">
        おっと! お探しのページは存在しないようです。
      </p>
      <Button className="mt-8 px-8 py-2 rounded-md">
        <Link href="/">ホームに戻る</Link>
      </Button>
    </div>
  )
}

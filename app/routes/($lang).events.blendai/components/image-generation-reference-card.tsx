import { Card } from "~/components/ui/card"
import { Link } from "@remix-run/react"

type Props = {
  prompts: string
  children: React.ReactNode
  title: string
}

/**
 * 画像生成参考カード
 */
export function ImageGenerationReferenceCard(props: Props) {
  return (
    <Link
      className="bg-gray-100 dark:bg-gray-900"
      to={`/generation?prompts=${encodeURIComponent(props.prompts)}`}
    >
      <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-900">
        <div className="relative m-auto max-w-64">
          <Card className="relative z-10 bg-white">{props.children}</Card>
          <div className="ta-c relative z-10 m-auto mb-4 text-sm">
            {props.title}
          </div>
          <div className="-inset-1 absolute z-0 rounded-lg bg-linear-to-r from-red-600 to-violet-600 opacity-25 blur-sm transition duration-1000 group-hover:opacity-90 group-hover:duration-200 dark:opacity-75" />
        </div>
      </div>
    </Link>
  )
}

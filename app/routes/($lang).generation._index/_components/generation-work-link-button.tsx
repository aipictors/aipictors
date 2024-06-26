import { Link } from "@remix-run/react"
import { ExternalLinkIcon } from "lucide-react"

type Props = {
  id: string
  setIsHovered: (isHovered: boolean) => void
}

/**
 * 画像生成作品のリンクボタン
 */
export const GenerationWorkLinkButton = (props: Props) => {
  return (
    <Link
      className="absolute bottom-2 left-2 rounded-full hover:opacity-80"
      to={`https://www.aipictors.com/works/${props.id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex rounded-lg bg-white px-1 py-1 opacity-80">
        <div
          onMouseEnter={() => {
            props.setIsHovered(true)
          }}
        >
          <ExternalLinkIcon color="black" />
        </div>
      </div>
    </Link>
  )
}

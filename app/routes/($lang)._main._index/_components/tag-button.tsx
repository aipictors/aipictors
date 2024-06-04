import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"

type Props = {
  name: string
}

export const TagButton = (props: Props) => {
  // 彩度は同じでカラーをランダムに決定する
  const randomColor = () => {
    const hue = Math.floor(Math.random() * 360)
    const saturation = 32
    const lightness = 64
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  return (
    <Link to={`/tags/${props.name}`}>
      <Button
        className="bg-blue-500 text-white"
        style={{ backgroundColor: randomColor() }}
      >
        #{props.name}
      </Button>
    </Link>
  )
}

import { Link } from "@remix-run/react"

type Props = {
  name: string
  link: string
}

/**
 * 文字列からハッシュ値を生成
 * @param text
 * @returns
 * TODO_2024_08: 別のファイルに移動する
 */
const hashCode = (text: string) => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

/**
 * ハッシュ値を元にHSLカラーを生成
 * @param text
 * @returns
 * TODO_2024_08: 別のファイルに移動する
 */
const stringToColor = (text: string) => {
  const hash = hashCode(text)
  const hue = Math.abs(hash) % 360
  const saturation = 32
  const lightness = 64
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function TagButton(props: Props) {
  return (
    <Link to={`/tags/${props.link}`}>
      <div
        className="rounded-md bg-blue-500 p-1 pr-2 pl-2 text-white"
        style={{ backgroundColor: stringToColor(props.name) }}
      >
        #{props.name}
      </div>
    </Link>
  )
}

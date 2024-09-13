import { Link } from "@remix-run/react"

type Props = {
  name: string
  title?: string
  link: string
  isDisabled?: boolean
  isTagName?: boolean
  border?: boolean
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
const stringToColor = (text: string, isDisabled: boolean) => {
  if (isDisabled) {
    return "hsl(0, 0%, 50%)" // グレー色
  }

  const hash = hashCode(text)
  const hue = Math.abs(hash) % 360
  const saturation = 32
  const lightness = 64
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function TagButton(props: Props) {
  const borderStyle = props.border
    ? "border-4 border-blue-500"
    : "border-4 border-transparent"

  return props.isDisabled ? (
    <div
      className={`rounded-full bg-blue-500 p-1 pr-4 pl-4 text-white ${borderStyle} box-border`}
      style={{
        backgroundColor: stringToColor(props.name, props.isDisabled ?? false),
      }}
    >
      {props.title && (
        <div className="text-center font-bold text-md">{props.title}</div>
      )}
      {props.isTagName ? (
        <div className="text-center font-bold">#{props.name}</div>
      ) : (
        <div className="text-center font-bold">{props.name}</div>
      )}
    </div>
  ) : (
    <Link to={`${props.link}`}>
      <div
        className={`rounded-full bg-blue-500 p-1 pr-4 pl-4 text-white ${borderStyle} box-border`}
        style={{
          backgroundColor: stringToColor(props.name, props.isDisabled ?? false),
        }}
      >
        {props.title && (
          <div className="text-center font-bold text-md">{props.title}</div>
        )}
        {props.isTagName ? (
          <div className="text-center font-bold">#{props.name}</div>
        ) : (
          <div className="text-center font-bold">{props.name}</div>
        )}
      </div>
    </Link>
  )
}

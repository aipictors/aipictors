import { Link } from "react-router";
import { cn } from "~/lib/utils"
import { stringToColor } from "~/utils/string-to-color"

type Props = {
  name: string
  title?: string
  link: string
  isDisabled?: boolean
  isTagName?: boolean
  border?: boolean
}

export function TagButton(props: Props) {
  const borderStyle = props.border
    ? "border-4 border-blue-500"
    : "border-4 border-transparent"

  return props.isDisabled ? (
    <div
      className={cn(
        "box-border rounded-full bg-blue-500 p-1 pr-4 pl-4 text-white",
        borderStyle,
      )}
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
        className={cn(
          "box-border rounded-full bg-blue-500 p-1 pr-4 pl-4 text-white",
          borderStyle,
        )}
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

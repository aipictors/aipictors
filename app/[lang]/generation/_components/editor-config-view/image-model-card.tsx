type Props = {
  displayName: string | null
  description?: string | null
  type?: string | null
  thumbnailImageURL: string | null
  isActive: boolean
  onSelect(): void
}

export const ImageModelCard = (props: Props) => {
  const classes = `flex relative cursor-pointer flex-col rounded-md border border-neutral-1100 bg-neutral-1100 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 ${
    props.isActive ? "border-2 border-blue-500" : ""
  }`

  return (
    <div className={classes} onClick={props.onSelect} onKeyUp={() => {}}>
      <img
        className={
          "relative focus:outline-none bg-cover bg-center w-full rounded-lg border-2"
        }
        src={props.thumbnailImageURL ?? ""}
        alt={props.displayName ?? ""}
        style={{ transformOrigin: "center" }}
      />
      <div className="">
        <span className="text-sm font-bold break-words whitespace-pre-wrap">
          {props.displayName ?? ""}
        </span>
        {props.type && (
          <span className="absolute text-white top-2 left-1 bg-black bg-opacity-50 rounded-lg p-4">
            {props.type}
          </span>
        )}
        {props.description && (
          <span className="text-sm break-words whitespace-pre-wrap">
            {props.description}
          </span>
        )}
      </div>
    </div>
  )
}

type Props = {
  imageBase64: string
}

export function ControlThumbnailPosition(props: Props) {
  return (
    <>
      <div className="h-16 w-16 overflow-hidden">
        <img src={props.imageBase64} alt="thumbnail" />
      </div>
    </>
  )
}

import {} from "react"

type Props = {
  videoUrl: string
}

export const WorkVideoView = ({ videoUrl }: Props) => {
  return (
    <div className="relative m-0">
      <video
        controls
        className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
        src={videoUrl}
      >
        <track kind="captions" srcLang="en" label="English" />
      </video>
    </div>
  )
}

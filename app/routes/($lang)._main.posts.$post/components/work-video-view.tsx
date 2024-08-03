type Props = {
  videoUrl: string
}

export const WorkVideoView = ({ videoUrl }: Props) => {
  return (
    <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
      <video
        controls
        className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
        src={videoUrl}
        autoPlay={true}
        loop={true}
        muted={true}
      >
        <track kind="captions" srcLang="en" label="English" />
      </video>
    </div>
  )
}

import {
  isCloudflareStreamUrl,
  toCloudflareStreamEmbedUrl,
} from "~/utils/cloudflare-stream"

type Props = {
  videoUrl: string
}

export function WorkVideoView ({ videoUrl }: Props) {
  const isStream = isCloudflareStreamUrl(videoUrl)
  const embedUrl = toCloudflareStreamEmbedUrl(videoUrl)

  if (isStream && embedUrl) {
    return (
      <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
        <div className="mx-auto aspect-video w-full max-w-[1280px]">
          <iframe
            src={embedUrl}
            title="Cloudflare Stream Video"
            className="h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative m-0 bg-zinc-100 object-contain dark:bg-zinc-900">
      <video
        controls
        className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
        src={videoUrl}
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline
      >
        <track kind="captions" srcLang="en" label="English" />
      </video>
    </div>
  )
}

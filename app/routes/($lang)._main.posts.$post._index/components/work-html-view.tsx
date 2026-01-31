type Props = {
  html: string
  thumbnailUrl: string
}

export function WorkHtmlView ({ thumbnailUrl, html }: Props) {
  return (
    <div className="relative">
      <img
        src={thumbnailUrl}
        alt="Thumbnail"
        className="m-auto h-auto w-full max-w-96"
      />

      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

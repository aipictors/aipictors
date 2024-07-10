type Props = {
  html: string
  thumbnailUrl: string
}

export const WorkHtmlView = ({ thumbnailUrl, html }: Props) => {
  return (
    <div className="relative m-0 bg-gray-100 dark:bg-zinc-950">
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

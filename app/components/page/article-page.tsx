type Props = {
  children: React.ReactNode
}

/**
 * 記事のページ
 */
export function ArticlePage(props: Props) {
  return (
    <div className="mx-auto w-full max-w-screen-lg p-4">{props.children}</div>
  )
}

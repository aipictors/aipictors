type Props = {
  children: React.ReactNode
}

/**
 * 記事のページ
 */
export function ArticlePage (props: Props): React.ReactNode {
  return (
    <div className="mx-auto w-full max-w-(--breakpoint-lg) p-4">
      {props.children}
    </div>
  )
}

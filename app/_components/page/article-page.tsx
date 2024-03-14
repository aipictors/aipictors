type Props = {
  children: React.ReactNode
}

/**
 * 記事のページ
 * @param props
 * @returns
 */
export const ArticlePage = (props: Props) => {
  return (
    <div className="mx-auto w-full max-w-screen-lg p-4">{props.children}</div>
  )
}

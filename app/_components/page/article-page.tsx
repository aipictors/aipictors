"use client"

type Props = {
  children: React.ReactNode
}

export const ArticlePage = (props: Props) => {
  return (
    <div className="px-4 w-full max-w-container.xl mx-auto">
      {props.children}
    </div>
  )
}

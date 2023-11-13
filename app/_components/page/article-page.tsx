"use client"

type Props = {
  children: React.ReactNode
}

export const ArticlePage: React.FC<Props> = (props) => {
  return (
    <div className="px-4 w-full max-w-container.xl mx-auto">
      {props.children}
    </div>
  )
}

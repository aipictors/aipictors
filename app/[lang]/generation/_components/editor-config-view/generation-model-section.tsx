type Props = {
  title: string
  children: React.ReactNode
}

/**
 * モデルのセクション
 * @param props
 * @returns
 */
export const GenerationModelSection = (props: Props) => {
  return (
    <div className="px-4 space-y-2">
      <p className="font-bold">{props.title}</p>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {props.children}
      </div>
    </div>
  )
}

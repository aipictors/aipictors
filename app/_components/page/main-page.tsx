type Props = {
  children: React.ReactNode
}

/**
 * 普通のページ
 * @param props
 * @returns
 */
export const MainPage = (props: Props) => {
  return (
    <div className="overflow-x-hidden pl-4 w-full mx-auto max-w-container.lg">
      {props.children}
    </div>
  )
}

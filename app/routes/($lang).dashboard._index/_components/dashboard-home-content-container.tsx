type Props = {
  title: string
  children: React.ReactNode
}

/**
 * ダッシュボードホームコンテンツコンテナ
 */
export const DashboardHomeContentContainer = (props: Props) => {
  return (
    <>
      <div className="h-auto rounded-md bg-card md:h-[640px]">
        <div className="w-full rounded-t-md bg-secondary p-4 font-bold">
          {props.title}
        </div>
        {props.children}
      </div>
    </>
  )
}

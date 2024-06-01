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
      <div className="h-auto rounded-md bg-zinc-50 md:h-[572px] dark:bg-zinc-700">
        <div className="w-full rounded-t-md bg-zinc-100 p-4 font-bold dark:bg-zinc-800">
          {props.title}
        </div>
        {props.children}
      </div>
    </>
  )
}

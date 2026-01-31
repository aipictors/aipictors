type Props = {
  title: string
  children: React.ReactNode
}

/**
 * ダッシュボードホームコンテンツコンテナ
 */
export function DashboardHomeContentContainer (props: Props) {
  return (
    <>
      <div className="flex h-auto flex-col space-y-2 rounded-md">
        <div className="w-full rounded-t-md font-bold text-lg">
          {props.title}
        </div>
        {props.children}
      </div>
    </>
  )
}

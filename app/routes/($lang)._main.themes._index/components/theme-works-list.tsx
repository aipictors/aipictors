import { Button } from "~/components/ui/button"
import { useNavigate } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import type { ThemeListItemFragment } from "~/routes/($lang)._main.themes._index/components/theme-list"
import { RefreshCcwIcon } from "lucide-react"
import type { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { HomeCroppedWorkListWithScroll } from "~/routes/($lang)._main._index/components/home-cropped-work-list-with-scroll"

type Props = {
  todayTheme: FragmentOf<typeof ThemeListItemFragment> | null
  works: FragmentOf<typeof ThemeWorkFragment>[] | null
  isSensitive: boolean
}

/**
 * お題カレンダーの作品一覧
 */
export function ThemeWorksList(props: Props) {
  const navigate = useNavigate()

  const onMore = () => {
    if (!props.todayTheme) {
      navigate("/themes")
    }

    if (!props.isSensitive) {
      navigate(
        `/themes/${props.todayTheme?.year}/${props.todayTheme?.month}/${props.todayTheme?.day}`,
      )
      return
    }
    navigate(
      `/sensitive/themes/${props.todayTheme?.year}/${props.todayTheme?.month}/${props.todayTheme?.day}`,
    )
  }

  return (
    <>
      {props.todayTheme && (
        <div className="relative h-24 overflow-hidden rounded-md p-4">
          <h2 className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 transform text-center font-bold text-white">
            {"今日のお題は"}
            <br />「{props.todayTheme.title}」
          </h2>
          <img
            className="absolute top-0 left-0 w-full"
            src={props.todayTheme.firstWork?.smallThumbnailImageURL}
            alt={props.todayTheme.title}
          />
          <div className="absolute top-0 left-0 h-full w-full bg-black opacity-40" />
        </div>
      )}
      {props.works && props.works.length > 0 && (
        <>
          <div className="flex">
            <div className="relative grid gap-4">
              {!props.isSensitive ? (
                <AppConfirmDialog
                  title={"確認"}
                  description={
                    "センシティブな作品を表示します、あなたは18歳以上ですか？"
                  }
                  onNext={() => {
                    navigate("/sensitive/themes")
                  }}
                  cookieKey={"check-sensitive-ranking"}
                  onCancel={() => {}}
                >
                  <Button
                    variant={"secondary"}
                    className="flex w-full transform cursor-pointer items-center"
                  >
                    <RefreshCcwIcon className="mr-1 w-3" />
                    <p className="text-sm">{"対象年齢"}</p>
                  </Button>
                </AppConfirmDialog>
              ) : (
                <Button
                  onClick={() => {
                    navigate("/themes")
                  }}
                  variant={"secondary"}
                  className="flex w-full transform cursor-pointer items-center"
                >
                  <RefreshCcwIcon className="mr-1 w-3" />
                  <p className="text-sm">{"対象年齢"}</p>
                </Button>
              )}
            </div>
            <div className="ml-auto flex justify-end">
              <Button onClick={onMore} variant={"secondary"}>
                {"もっと見る"}
              </Button>
            </div>
          </div>
          <HomeCroppedWorkListWithScroll works={props.works} />
        </>
      )}
    </>
  )
}

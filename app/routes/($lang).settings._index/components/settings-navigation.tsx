import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import {
  ArrowLeftIcon,
  BellIcon,
  BookmarkXIcon,
  ImageIcon,
  MedalIcon,
  StickerIcon,
  PaletteIcon,
  UserXIcon,
  ChevronRight,
  Radio,
} from "lucide-react"
import { graphql } from "gql.tada"
import { useQuery } from "@apollo/client/index"

export function SettingsNavigation() {
  const { data } = useQuery(viewerIsAdvertiserQuery)

  return (
    <div className="w-full space-y-1 md:w-auto">
      <HomeNavigationButton href={"/"} icon={ArrowLeftIcon}>
        {"もどる"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/notification"} icon={BellIcon}>
        <div className="flex w-full items-center justify-between">
          {"通知・いいね"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/restriction"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {"表示コンテンツ"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/profile"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {"プロフィール"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/account/login"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {"ID"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"/settings/account/password"}
        icon={ImageIcon}
      >
        <div className="flex w-full items-center justify-between">
          {"パスワード"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/users"} icon={UserXIcon}>
        <div className="flex w-full items-center justify-between">
          {"ユーザミュート"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/tags"} icon={BookmarkXIcon}>
        <div className="flex w-full items-center justify-between">
          {"タグミュート"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/sticker"} icon={StickerIcon}>
        <div className="flex w-full items-center justify-between">
          {"スタンプ"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/color"} icon={PaletteIcon}>
        <div className="flex w-full items-center justify-between">
          {"カラーテーマ"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/request"} icon={MedalIcon}>
        <div className="flex w-full items-center justify-between">
          {"サポートを受け取る"}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      {data?.viewer?.isAdvertiser && (
        <HomeNavigationButton href={"/settings/advertisements"} icon={Radio}>
          <div className="flex w-full items-center justify-between">
            {"広告設定"}
            <div className="ml-auto text-right md:hidden">
              <ChevronRight />
            </div>
          </div>
        </HomeNavigationButton>
      )}
    </div>
  )
}

const viewerIsAdvertiserQuery = graphql(
  `query ViewerIsAdvertiser {
    viewer {
      isAdvertiser
    }
  }`,
)

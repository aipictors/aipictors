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
import { useTranslation } from "~/hooks/use-translation" // useTranslation フックをインポート

export function SettingsNavigation() {
  const { data } = useQuery(viewerIsAdvertiserQuery)
  const t = useTranslation() // useTranslation フックを使う

  return (
    <div className="w-full space-y-1 md:w-auto">
      <HomeNavigationButton href={"/"} icon={ArrowLeftIcon}>
        {t("もどる", "Back")}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/notification"} icon={BellIcon}>
        <div className="flex w-full items-center justify-between">
          {t("通知・いいね", "Notifications & Likes")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/restriction"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {t("表示コンテンツ", "Display Content")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/profile"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {t("プロフィール", "Profile")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/account/login"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {t("ID", "ID")}
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
          {t("パスワード", "Password")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton
        href={"/settings/followed/tags"}
        icon={BookmarkXIcon}
      >
        <div className="flex w-full items-center justify-between">
          {t("フォロータグ", "Followed Tags")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/users"} icon={UserXIcon}>
        <div className="flex w-full items-center justify-between">
          {t("ユーザミュート", "Muted Users")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/muted/tags"} icon={BookmarkXIcon}>
        <div className="flex w-full items-center justify-between">
          {t("タグミュート", "Muted Tags")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/sticker"} icon={StickerIcon}>
        <div className="flex w-full items-center justify-between">
          {t("スタンプ", "Stickers")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/color"} icon={PaletteIcon}>
        <div className="flex w-full items-center justify-between">
          {t("カラーテーマ", "Color Theme")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      <HomeNavigationButton href={"/settings/request"} icon={MedalIcon}>
        <div className="flex w-full items-center justify-between">
          {t("サポートを受け取る", "Receive Support")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </HomeNavigationButton>
      {data?.viewer?.isAdvertiser && (
        <HomeNavigationButton href={"/settings/advertisements"} icon={Radio}>
          <div className="flex w-full items-center justify-between">
            {t("広告設定", "Advertisement Settings")}
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
      id
      isAdvertiser
    }
  }`,
)

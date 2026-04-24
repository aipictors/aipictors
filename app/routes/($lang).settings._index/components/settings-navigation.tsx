import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  ArrowLeftIcon,
  BellIcon,
  BookmarkXIcon,
  ChevronRight,
  CoinsIcon,
  ImageIcon,
  MedalIcon,
  PaletteIcon,
  Radio,
  StickerIcon,
  UserIcon,
  UserXIcon,
} from "lucide-react"
import { useTranslation } from "~/hooks/use-translation" // useTranslation フックをインポート
import { SettingNavigationButton } from "~/routes/($lang).settings._index/components/settings-navigation-button"

export function SettingsNavigation() {
  const { data } = useQuery(viewerIsAdvertiserQuery)
  const t = useTranslation() // useTranslation フックを使う

  return (
    <div className="w-full space-y-1 md:w-auto md:max-w-48">
      <SettingNavigationButton href={"/"} icon={ArrowLeftIcon}>
        {t("もどる", "Back")}
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/notification"} icon={BellIcon}>
        <div className="flex w-full items-center justify-between">
          {t("通知・いいね", "Notifications & Likes")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/restriction"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {t("表示コンテンツ", "Display Content")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/profile"} icon={ImageIcon}>
        <div className="flex w-full items-center justify-between">
          {t("プロフィール", "Profile")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/account"} icon={UserIcon}>
        <div className="flex w-full items-center justify-between">
          {t("アカウント設定", "Account Settings")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton
        href={"/settings/followed/tags"}
        icon={BookmarkXIcon}
      >
        <div className="flex w-full items-center justify-between">
          {t("フォロータグ", "Followed Tags")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/muted/users"} icon={UserXIcon}>
        <div className="flex w-full items-center justify-between">
          {t("ユーザミュート", "Muted Users")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton
        href={"/settings/blocked/users"}
        icon={UserXIcon}
      >
        <div className="flex w-full items-center justify-between">
          {t("ユーザブロック", "Blocked Users")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton
        href={"/settings/muted/tags"}
        icon={BookmarkXIcon}
      >
        <div className="flex w-full items-center justify-between">
          {t("タグミュート", "Muted Tags")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/sticker"} icon={StickerIcon}>
        <div className="flex w-full items-center justify-between">
          {t("スタンプ", "Stickers")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/color"} icon={PaletteIcon}>
        <div className="flex w-full items-center justify-between">
          {t("カラーテーマ", "Color Theme")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/request"} icon={MedalIcon}>
        <div className="flex w-full items-center justify-between">
          {t("サポートを受け取る", "Receive Support")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      <SettingNavigationButton href={"/settings/points"} icon={CoinsIcon}>
        <div className="flex w-full items-center justify-between">
          {t("ポイント", "Points")}
          <div className="ml-auto text-right md:hidden">
            <ChevronRight />
          </div>
        </div>
      </SettingNavigationButton>
      {data?.viewer?.isAdvertiser && (
        <SettingNavigationButton href={"/settings/advertisements"} icon={Radio}>
          <div className="flex w-full items-center justify-between">
            {t("広告設定", "Advertisement Settings")}
            <div className="ml-auto text-right md:hidden">
              <ChevronRight />
            </div>
          </div>
        </SettingNavigationButton>
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

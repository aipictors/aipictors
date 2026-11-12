import {
  ActivityIcon,
  AwardIcon,
  BookImageIcon,
  BookOpenIcon,
  BoxesIcon,
  GemIcon,
  HeartIcon,
  HelpCircleIcon,
  HistoryIcon,
  HomeIcon,
  ImageIcon,
  ImagePlusIcon,
  InfoIcon,
  LibraryBigIcon,
  LightbulbIcon,
  type LucideIcon,
  MapIcon,
  NewspaperIcon,
  RocketIcon,
  SearchIcon,
  Shield,
  SparklesIcon,
  StampIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  WandSparklesIcon,
} from "lucide-react"
import type { LiteOffer } from "~/hooks/use-lite-offer"
import type { PlusStatus } from "~/hooks/use-plus-status"
import { toR18Path } from "~/utils/content-mode"

type HomeNavigationItem = {
  key: string
  href: string
  label: [string, string]
  icon: LucideIcon
  /** 外部サイト */
  isExternal?: boolean
  /** ラベルの横に出す小さな印（初月半額など） */
  badge?: [string, string]
  /** 目立たせる項目（Aipictors+） */
  isAccent?: boolean
  /** 押した回数を /api/growth-event で数えるときのイベント名 */
  growthEvent?: string
}

type HomeNavigationSection = {
  key: string
  /** 見出し（なければ見出しなし） */
  title?: [string, string]
  items: HomeNavigationItem[]
  /** 「もっと見る」で開く */
  isCollapsible?: boolean
}

type Options = {
  isSensitive: boolean
  isModerator: boolean
  /** プランの案内の出し分け（確認中は項目を出さない） */
  plusStatus?: PlusStatus
  /** ライトの特典（お試し・初月半額）。確認中は印を出さない */
  liteOffer?: LiteOffer
}

/**
 * 左メニューの項目（PC のサイドバーとスマホのメニューで共通）
 * R18 のページでは /r 付きのリンクにする
 */
export function getHomeNavigationSections(
  options: Options,
): HomeNavigationSection[] {
  const link = (path: string) => {
    if (!options.isSensitive) return path
    return toR18Path(path) ?? path
  }

  const sections: HomeNavigationSection[] = [
    {
      key: "main",
      items: [
        {
          key: "home",
          href: options.isSensitive ? "/r" : "/",
          label: ["ホーム", "Home"],
          icon: HomeIcon,
        },
        {
          key: "search",
          href: link("/search"),
          label: ["検索", "Search"],
          icon: SearchIcon,
        },
        {
          key: "rankings",
          href: link("/rankings"),
          label: ["ランキング", "Ranking"],
          icon: AwardIcon,
        },
        {
          key: "follow",
          href: link("/follow-user-works"),
          label: ["フォロー新着", "Following"],
          icon: UsersIcon,
        },
        // プランのページへの入口がユーザーメニューの中にしかなく、ほとんど開かれていなかった
        ...(options.plusStatus === "guest" || options.plusStatus === "free"
          ? [
              {
                key: "plus",
                href: "/plus",
                label: ["Aipictors+", "Aipictors+"] as [string, string],
                icon: SparklesIcon,
                badge:
                  options.liteOffer === "trial"
                    ? // メニューは幅が狭いので短く書く（長いとサービス名が切れる。対象は /plus に書いてある）
                      (["7日間無料", "Free trial"] as [string, string])
                    : options.liteOffer === "half"
                      ? (["初月半額", "50% off"] as [string, string])
                      : undefined,
                isAccent: true,
                growthEvent: "plus_nav_click",
              },
            ]
          : []),
      ],
    },
    {
      key: "discover",
      title: ["見つける", "Discover"],
      items: [
        {
          key: "archive",
          href: link("/archive"),
          label: ["過去の名作", "Past Masterpieces"],
          icon: HistoryIcon,
        },
        {
          key: "themes",
          href: link("/themes"),
          label: ["お題", "Themes"],
          icon: LightbulbIcon,
        },
        {
          key: "tags",
          href: link("/tags"),
          label: ["タグ", "Tags"],
          icon: TagIcon,
        },
        {
          key: "albums",
          href: link("/albums"),
          label: ["シリーズ", "Series"],
          icon: LibraryBigIcon,
        },
        {
          key: "events",
          href: link("/events"),
          label: ["イベント", "Events"],
          icon: StarIcon,
        },
        {
          key: "illust",
          href: link("/posts/2d"),
          label: ["イラスト", "Illust"],
          icon: ImageIcon,
        },
        {
          key: "photo",
          href: link("/posts/3d"),
          label: ["フォト", "Photo"],
          icon: BookImageIcon,
        },
        // /r のページがなく、押すと全年齢に移ってしまうので R18 では出さない
        ...(options.isSensitive
          ? []
          : [
              {
                key: "novels",
                href: "/novels",
                label: ["小説", "Novels"] as [string, string],
                icon: BookOpenIcon,
              },
              {
                key: "notes",
                href: "/notes",
                label: ["コラム", "Columns"] as [string, string],
                icon: NewspaperIcon,
              },
            ]),
      ],
    },
    {
      key: "create",
      title: ["つくる", "Create"],
      items: [
        {
          key: "generation",
          href: "/generation",
          label: ["画像生成", "Generate"],
          icon: WandSparklesIcon,
        },
        {
          key: "post",
          href: "/new/image",
          label: ["作品を投稿", "Post"],
          icon: ImagePlusIcon,
        },
        {
          key: "models",
          href: "/models",
          label: ["モデル", "Models"],
          icon: BoxesIcon,
        },
        {
          key: "stickers",
          href: link("/stickers"),
          label: ["スタンプ広場", "Stickers"],
          icon: StampIcon,
        },
      ],
    },
    {
      key: "more",
      title: ["その他", "More"],
      isCollapsible: true,
      items: [
        // 加入中の人には案内を出さず、管理の入口だけ置く
        ...(options.plusStatus === "member"
          ? [
              {
                key: "plus",
                href: "/plus",
                label: ["プランの管理", "Manage plan"] as [string, string],
                icon: GemIcon,
              },
            ]
          : []),
        {
          key: "releases",
          href: "/releases",
          label: ["お知らせ", "Announcements"],
          icon: RocketIcon,
        },
        {
          key: "help",
          href: "/help",
          label: ["使い方ガイド", "User Guide"],
          icon: HelpCircleIcon,
        },
        {
          key: "roadmap",
          href: "/roadmap",
          label: ["ロードマップ", "Roadmap"],
          icon: MapIcon,
        },
        {
          key: "about",
          href: "/about",
          label: ["概要", "About"],
          icon: InfoIcon,
        },
        {
          key: "pictor-chan",
          href: "/pictor-chan",
          label: ["ぴくたーちゃん", "Pictor-chan"],
          icon: HeartIcon,
        },
        {
          key: "status",
          href: "https://status.aipictors.com",
          label: ["稼働状況", "Status"],
          icon: ActivityIcon,
          isExternal: true,
        },
      ],
    },
  ]

  if (options.isModerator && !options.isSensitive) {
    sections.push({
      key: "admin",
      title: ["管理", "Admin"],
      items: [
        {
          key: "admin",
          href: "/admin",
          label: ["管理画面", "Admin"],
          icon: Shield,
        },
      ],
    })
  }

  return sections
}

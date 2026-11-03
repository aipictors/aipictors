import { toR18Path } from "~/utils/content-mode"
import {
  ActivityIcon,
  AwardIcon,
  BookImageIcon,
  BookOpenIcon,
  BoxesIcon,
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
  StampIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  WandSparklesIcon,
} from "lucide-react"

type HomeNavigationItem = {
  key: string
  href: string
  label: [string, string]
  icon: LucideIcon
  /** 外部サイト */
  isExternal?: boolean
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
          href: link("/home"),
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

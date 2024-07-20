import { useEffect, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import { config } from "@/config"
import { HomeNavigationButton } from "@/routes/($lang)._main._index/_components/home-navigation-button"
import {
  AwardIcon,
  BookImageIcon,
  BoxIcon,
  FolderIcon,
  HomeIcon,
  ImageIcon,
  LibraryBigIcon,
  LightbulbIcon,
  RocketIcon,
  StampIcon,
} from "lucide-react"
import { Separator } from "@/_components/ui/separator"

const navItems = [
  { href: "/", icon: HomeIcon, label: "ホーム" },
  {
    href: "/themes",
    icon: LightbulbIcon,
    label: "創作アイデア",
    isDisabled: config.isReleaseMode,
  },
  { href: "/stickers", icon: StampIcon, label: "スタンプ広場" },
  {
    href: "/rankings",
    icon: AwardIcon,
    label: "ランキング",
    isDisabled: config.isReleaseMode,
  },
  {
    href: "/albums",
    icon: LibraryBigIcon,
    label: "シリーズ",
    isDisabled: config.isReleaseMode,
  },
  {
    href: "/collections",
    icon: FolderIcon,
    label: "コレクション",
    isDisabled: config.isReleaseMode,
  },
  { href: "/milestones", icon: RocketIcon, label: "開発予定" },
  { separator: true },
  {
    href: "/posts/2d",
    icon: ImageIcon,
    label: "イラスト",
    isDisabled: config.isReleaseMode,
  },
  {
    href: "/posts/2.5d",
    icon: BookImageIcon,
    label: "フォト",
    isDisabled: config.isReleaseMode,
  },
  { href: "/sensitive", icon: BoxIcon, label: "センシティブ" },
]

export const HomeRouteList = () => {
  const [isScrollingUp, setIsScrollingUp] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = () => {
    const currentScrollY = window.scrollY
    setIsScrollingUp(currentScrollY <= lastScrollY || currentScrollY <= 100)
    setLastScrollY(currentScrollY)
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [lastScrollY])

  return (
    <div
      className={`fixed top-18 z-20 w-full bg-card pb-2 ${
        !isScrollingUp ? "hidden" : ""
      }`}
    >
      <div className="space-y-1">
        <Carousel opts={{ dragFree: true, loop: false }}>
          <CarouselContent className="m-auto">
            {navItems.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <CarouselItem key={index} className="basis-1/1 xl:basis-1/8">
                {item.separator ? (
                  <div className="py-2">{<Separator />}</div>
                ) : (
                  <HomeNavigationButton
                    href={item.href}
                    icon={item.icon}
                    isDisabled={item.isDisabled}
                  >
                    {item.label}
                  </HomeNavigationButton>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}

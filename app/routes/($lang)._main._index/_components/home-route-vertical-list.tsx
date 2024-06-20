import { useEffect, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import { Separator } from "@/_components/ui/separator"
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

export const HomeRouteList = () => {
  const [isScrollingUp, setIsScrollingUp] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = () => {
    const currentScrollY = window.scrollY
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsScrollingUp(false)
    } else {
      setIsScrollingUp(true)
    }
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
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`bg-card w-full z-20 fixed top-18 pb-2 ${
        !isScrollingUp ? "hidden" : ""
      }`}
    >
      <div className="space-y-1">
        <Carousel opts={{ dragFree: true, loop: false }}>
          <CarouselContent className="m-auto">
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton href={"/"} icon={HomeIcon}>
                {"ホーム"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton
                isDisabled={config.isReleaseMode}
                href={"/themes"}
                icon={LightbulbIcon}
              >
                {"創作アイデア"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton href={"/stickers"} icon={StampIcon}>
                {"スタンプ広場"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton
                isDisabled={config.isReleaseMode}
                href={"/rankings"}
                icon={AwardIcon}
              >
                {"ランキング"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton
                isDisabled={config.isReleaseMode}
                href={"/albums"}
                icon={LibraryBigIcon}
              >
                {"シリーズ"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton
                isDisabled={config.isReleaseMode}
                href={"/collections"}
                icon={FolderIcon}
              >
                {"コレクション"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton href={"/milestones"} icon={RocketIcon}>
                {"開発予定"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <div className={"py-2"}>
                <Separator />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton
                isDisabled={config.isReleaseMode}
                href={"/works/2d"}
                icon={ImageIcon}
              >
                {"イラスト"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton
                isDisabled={config.isReleaseMode}
                href={"/works/2.5d"}
                icon={BookImageIcon}
              >
                {"フォト"}
              </HomeNavigationButton>
            </CarouselItem>
            <CarouselItem className="basis-1/1 xl:basis-1/8">
              <HomeNavigationButton href={"/sensitive"} icon={BoxIcon}>
                {"センシティブ"}
              </HomeNavigationButton>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}

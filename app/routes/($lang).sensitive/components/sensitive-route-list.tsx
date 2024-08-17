import { Separator } from "~/components/ui/separator"
import { HomeNavigationButton } from "~/routes/($lang)._main._index/components/home-navigation-button"
import {
  AwardIcon,
  FolderIcon,
  HomeIcon,
  LibraryBigIcon,
  LightbulbIcon,
  Undo2Icon,
} from "lucide-react"

export function SensitiveRouteList() {
  return (
    <div className="space-y-1">
      <HomeNavigationButton href={"/"} icon={Undo2Icon}>
        {"全年齢"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive"} icon={HomeIcon}>
        {"ホーム"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/themes"} icon={LightbulbIcon}>
        {"お題"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/rankings"} icon={AwardIcon}>
        {"ランキング"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/albums"} icon={LibraryBigIcon}>
        {"シリーズ"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/collections"} icon={FolderIcon}>
        {"コレクション"}
      </HomeNavigationButton>
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton href={"/sensitive/posts/3d"}>
        {"フォト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/posts/3d/a"}>
        {"フォトA"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/posts/3d/b"}>
        {"フォトB"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/posts/3d/c"}>
        {"フォトC"}
      </HomeNavigationButton>
      <div className="py-2">
        <Separator />
      </div>
      <HomeNavigationButton href={"/sensitive/posts/2d"}>
        {"イラスト"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/posts/2d/a"}>
        {"イラストA"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/posts/2d/b"}>
        {"イラストB"}
      </HomeNavigationButton>
      <HomeNavigationButton href={"/sensitive/posts/2d/c"}>
        {"イラストC"}
      </HomeNavigationButton>
      <div className="py-2">
        <Separator />
      </div>
    </div>
  )
}

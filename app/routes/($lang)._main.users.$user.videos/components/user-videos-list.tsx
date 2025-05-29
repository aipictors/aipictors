import { type FragmentOf, readFragment } from "gql.tada"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumVideoWorkFragment,
  ResponsivePhotoVideoWorksAlbum,
} from "~/components/responsive-photo-video-works-album"

type Props = {
  works: FragmentOf<typeof PhotoAlbumVideoWorkFragment>[]
  page: number
  maxCount: number
}

export function UserVideoList(props: Props) {
  const cachedWorks = readFragment(PhotoAlbumVideoWorkFragment, props.works)

  const userLogin = cachedWorks[0]?.user?.login ?? ""

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <ResponsivePhotoVideoWorksAlbum
            isAutoPlay={true}
            works={props.works}
            page={props.page}
          />
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${userLogin}/videos?page=${page}`)
          }}
        />
      </div>
    </div>
  )
}

import { Link, useNavigate } from "~/lib/app/locale-router"
import { graphql, type FragmentOf } from "gql.tada"
import { useQuery } from "@apollo/client/index"
import { useContext, useState } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { Minus, Plus } from "lucide-react"
import {
  ThemeList,
  type ThemeListItemFragment,
} from "~/routes/($lang)._main.themes._index/components/theme-list"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { useTranslation } from "~/hooks/use-translation"

export const ThemeWorkFragment = graphql(
  `fragment ThemeWork on WorkNode @_unmask {
    id
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

export const themeWorksQuery = graphql(
  `query AlbumWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...ThemeWork
    }
  }`,
  [ThemeWorkFragment],
)

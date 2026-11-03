import { Link } from "~/lib/app/locale-router"
import { ChevronRight, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getRotatingItems,
  useRotatingHomeEvents,
} from "~/routes/($lang)._main._index/components/use-rotating-home-events"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export type HomePreviewEvent = {
  id: string
  slug: string
  title: string
  thumbnailImageUrl: string
  status: string
  startAt: number
  endAt: number
  isOfficial: boolean
  rankingEnabled: boolean
  entryCount: number
  participantCount: number
  userName?: string | null
  userIconUrl?: string | null
  tags: string[]
}

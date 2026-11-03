import { useMutation } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import { SlidersHorizontalIcon } from "lucide-react"
import { useContext, useId, useState } from "react"
import { toast } from "sonner"
import { useSensitiveBlur } from "~/components/sensitive/sensitive-blur"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  setAnonymousR18gEnabled,
  useViewerRatings,
  viewerPreferenceRatingQuery,
} from "~/hooks/use-viewer-ratings"
import { getLocalePrefix } from "~/routes/($lang)._main._index/utils/content-rating-path"

/**
 * 表示の設定への近道（ぼかし・R18G・ミュート）
 */
export function SensitiveDisplaySettings(): React.ReactNode {
  const t = useTranslation()
  const location = useLocation()
  const localePrefix = getLocalePrefix(location.pathname)
  const authContext = useContext(AuthContext)
  const blurId = useId()
  const r18gId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const { isBlurred, setIsBlurred } = useSensitiveBlur()
  const { sensitiveRatings } = useViewerRatings()
  const isR18gEnabled = sensitiveRatings.includes("R18G")

  const [updateUserSetting, { loading: isUpdating }] = useMutation(
    updateSensitivePreferenceRatingMutation,
    { refetchQueries: [viewerPreferenceRatingQuery] },
  )

  const onChangeR18g = async (next: boolean) => {
    if (!authContext.isLoggedIn) {
      setAnonymousR18gEnabled(next)
      return
    }
    try {
      await updateUserSetting({
        variables: { input: { preferenceRating: next ? "R18G" : "R18" } },
      })
    } catch {
      toast(t("設定を変更できませんでした", "Could not update the setting"))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="shrink-0 gap-1.5">
          <SlidersHorizontalIcon className="size-4" />
          {t("表示設定", "Display")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <label
          htmlFor={blurId}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <span>
            {t("作品をぼかす", "Blur works")}
            <span className="block text-muted-foreground text-xs">
              {t("人前で開くときに", "For use around other people")}
            </span>
          </span>
          <Switch
            id={blurId}
            checked={isBlurred}
            onCheckedChange={setIsBlurred}
          />
        </label>
        <label
          htmlFor={r18gId}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <span>
            {t("R18G作品も表示", "Show R18G works")}
            <span className="block text-muted-foreground text-xs">
              {t(
                "暴力的な表現を含む作品が一覧に出ます",
                "Lists will include violent content",
              )}
            </span>
          </span>
          <Switch
            id={r18gId}
            checked={isR18gEnabled}
            disabled={isUpdating}
            onCheckedChange={onChangeR18g}
          />
        </label>
        {authContext.isLoggedIn && (
          <div className="flex flex-col gap-1 border-t pt-2 text-sm">
            <Link
              to={`${localePrefix}/settings/muted/tags`}
              className="rounded px-1 py-1 hover:bg-muted"
            >
              {t("タグのミュート", "Muted tags")}
            </Link>
            <Link
              to={`${localePrefix}/settings/muted/users`}
              className="rounded px-1 py-1 hover:bg-muted"
            >
              {t("ユーザーのミュート", "Muted users")}
            </Link>
            <Link
              to={`${localePrefix}/settings/followed/tags`}
              className="rounded px-1 py-1 hover:bg-muted"
            >
              {t("お気に入りタグの管理", "Favorite tags")}
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

const updateSensitivePreferenceRatingMutation = graphql(`
  mutation UpdateSensitivePreferenceRating($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      preferenceRating
    }
  }
`)

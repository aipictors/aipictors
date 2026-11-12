import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type CommentBadgeMode = "LEVEL" | "BADGE" | "OFF"

/**
 * 実績の表示設定（他の人に見せない・達成のお知らせを出さない）
 */
export function AchievementSettingsCard() {
  const t = useTranslation()

  const { data } = useQuery(achievementSettingsQuery, {
    fetchPolicy: "cache-and-network",
  })
  const [update, { loading }] = useMutation(updateAchievementSettingsMutation)

  const settings = data?.achievementSettings
  if (!settings) return null

  const save = async (next: {
    isHiddenOnProfile: boolean
    isUnlockNoticeOff: boolean
    commentBadgeMode: CommentBadgeMode
  }) => {
    try {
      await update({
        variables: { input: next },
        optimisticResponse: {
          updateAchievementSettings: {
            __typename: "AchievementSettingsNode",
            ...next,
          },
        },
        update(cache, result) {
          const value = result.data?.updateAchievementSettings
          if (!value) return
          cache.writeQuery({
            query: achievementSettingsQuery,
            data: { achievementSettings: value },
          })
        },
      })
      toast.success(t("設定を保存しました", "Saved"))
    } catch {
      toast.error(t("保存できませんでした", "Failed to save"))
    }
  }

  const rows = [
    {
      key: "isHiddenOnProfile" as const,
      title: t(
        "プロフィールに実績を表示しない",
        "Hide achievements on my profile",
      ),
      description: t(
        "オンにすると、プロフィールの実績レベル・バッジと、あなたの実績ページは他の人に見えなくなります（自分には見えます）",
        "Others can't see your achievement level, badges or achievements page",
      ),
    },
    {
      key: "isUnlockNoticeOff" as const,
      title: t("達成したときのお知らせを出さない", "Turn off unlock pop-ups"),
      description: t(
        "オンにすると、実績を達成しても画面にカードを出しません（コインは今までどおり届きます）",
        "No pop-up when you unlock an achievement (you still get the coins)",
      ),
    },
  ]

  const commentBadgeModes: { value: CommentBadgeMode; label: string }[] = [
    { value: "LEVEL", label: t("レベル", "Level") },
    { value: "BADGE", label: t("バッジ", "Badge") },
    { value: "OFF", label: t("出さない", "Nothing") },
  ]

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4">
      <h2 className="flex items-center gap-2 font-bold">
        <SettingsIcon className="size-4" />
        {t("実績の表示設定", "Achievement settings")}
      </h2>
      {rows.map((row) => (
        <div key={row.key} className="flex items-start justify-between gap-4">
          <span className="min-w-0">
            <label
              htmlFor={`achievement-${row.key}`}
              className="block cursor-pointer font-medium text-sm"
            >
              {row.title}
            </label>
            <span className="block text-muted-foreground text-xs">
              {row.description}
            </span>
          </span>
          <Switch
            id={`achievement-${row.key}`}
            checked={settings[row.key]}
            disabled={loading}
            onCheckedChange={(checked) =>
              void save({
                isHiddenOnProfile: settings.isHiddenOnProfile,
                isUnlockNoticeOff: settings.isUnlockNoticeOff,
                commentBadgeMode: settings.commentBadgeMode,
                [row.key]: checked,
              })
            }
          />
        </div>
      ))}
      <div className="space-y-2 border-t pt-3">
        <p className="font-medium text-sm">
          {t("コメントの名前の横に出すもの", "Next to my name in comments")}
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {commentBadgeModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              aria-pressed={settings.commentBadgeMode === mode.value}
              disabled={loading}
              onClick={() =>
                void save({
                  isHiddenOnProfile: settings.isHiddenOnProfile,
                  isUnlockNoticeOff: settings.isUnlockNoticeOff,
                  commentBadgeMode: mode.value,
                })
              }
              className={cn(
                "rounded-lg px-2 py-1.5 font-medium text-sm transition",
                settings.commentBadgeMode === mode.value
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {settings.isHiddenOnProfile
            ? t(
                "「プロフィールに実績を表示しない」がオンのあいだは、コメントにも出ません",
                "Nothing is shown in comments while achievements are hidden on your profile",
              )
            : t(
                "バッジは、達成した中でいちばん上のランクのものが出ます。押すとあなたの実績ページが開きます",
                "The badge is your highest-rank achievement. Tapping it opens your achievements page",
              )}
        </p>
      </div>
    </section>
  )
}

export const achievementSettingsQuery = graphql(
  `query AchievementSettings {
    achievementSettings {
      isHiddenOnProfile
      isUnlockNoticeOff
      commentBadgeMode
    }
  }`,
)

const updateAchievementSettingsMutation = graphql(
  `mutation UpdateAchievementSettings($input: UpdateAchievementSettingsInput!) {
    updateAchievementSettings(input: $input) {
      __typename
      isHiddenOnProfile
      isUnlockNoticeOff
      commentBadgeMode
    }
  }`,
)

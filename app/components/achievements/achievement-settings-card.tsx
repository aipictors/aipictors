import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"

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
                [row.key]: checked,
              })
            }
          />
        </div>
      ))}
    </section>
  )
}

export const achievementSettingsQuery = graphql(
  `query AchievementSettings {
    achievementSettings {
      isHiddenOnProfile
      isUnlockNoticeOff
    }
  }`,
)

const updateAchievementSettingsMutation = graphql(
  `mutation UpdateAchievementSettings($input: UpdateAchievementSettingsInput!) {
    updateAchievementSettings(input: $input) {
      isHiddenOnProfile
      isUnlockNoticeOff
    }
  }`,
)

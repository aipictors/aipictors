import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { AchievementBadge } from "~/components/achievements/achievement-badge"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type CommentBadgeMode = "LEVEL" | "BADGE" | "OFF"

type Settings = {
  isHiddenOnProfile: boolean
  isUnlockNoticeOff: boolean
  commentBadgeMode: CommentBadgeMode
  commentBadgeKey: string | null
}

type Props = {
  /** コメントに出すバッジとして選べる実績（達成済みで、隠し実績でないもの） */
  badges: {
    key: string
    name: string
    enName: string
    tier: number
    isHidden: boolean
  }[]
}

/**
 * 実績の表示設定（他の人に見せない・達成のお知らせを出さない）
 */
export function AchievementSettingsCard(props: Props) {
  const t = useTranslation()

  const { data } = useQuery(achievementSettingsQuery, {
    fetchPolicy: "cache-and-network",
  })
  const [update, { loading }] = useMutation(updateAchievementSettingsMutation)

  const settings = data?.achievementSettings
  if (!settings) return null

  const save = async (changes: Partial<Settings>) => {
    const next: Settings = { ...settings, ...changes }
    try {
      await update({
        variables: {
          input: {
            isHiddenOnProfile: next.isHiddenOnProfile,
            isUnlockNoticeOff: next.isUnlockNoticeOff,
            commentBadgeMode: next.commentBadgeMode,
            // 空文字は「おまかせ（いちばん上のランクのもの）」
            commentBadgeKey: next.commentBadgeKey ?? "",
          },
        },
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

  // ランクの高い順に並べる
  const badges = [...props.badges].sort((a, b) => b.tier - a.tier)
  const selectedBadge = badges.find(
    (badge) => badge.key === settings.commentBadgeKey,
  )

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
            onCheckedChange={(checked) => void save({ [row.key]: checked })}
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
              onClick={() => void save({ commentBadgeMode: mode.value })}
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
        {settings.commentBadgeMode === "BADGE" && badges.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs">
              {t("出すバッジを選ぶ", "Choose your badge")}
            </p>
            <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-xl border bg-background/60 p-2">
              <button
                type="button"
                aria-pressed={selectedBadge === undefined}
                disabled={loading}
                onClick={() => void save({ commentBadgeKey: null })}
                className={cn(
                  "h-11 rounded-full border px-3 font-medium text-xs transition",
                  selectedBadge === undefined
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("おまかせ", "Auto")}
              </button>
              {badges.map((badge) => (
                <button
                  key={badge.key}
                  type="button"
                  aria-pressed={selectedBadge?.key === badge.key}
                  aria-label={t(badge.name, badge.enName)}
                  title={t(badge.name, badge.enName)}
                  disabled={loading}
                  onClick={() => void save({ commentBadgeKey: badge.key })}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full transition hover:scale-105",
                    selectedBadge?.key === badge.key &&
                      "bg-primary/10 ring-2 ring-primary",
                  )}
                >
                  <AchievementBadge
                    achievementKey={badge.key}
                    name={t(badge.name, badge.enName)}
                    tier={badge.tier}
                    isHidden={badge.isHidden}
                    isUnlocked={true}
                    size={36}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="text-muted-foreground text-xs">
          {settings.isHiddenOnProfile
            ? t(
                "「プロフィールに実績を表示しない」がオンのあいだは、コメントにも出ません",
                "Nothing is shown in comments while achievements are hidden on your profile",
              )
            : settings.commentBadgeMode === "BADGE"
              ? selectedBadge === undefined
                ? t(
                    "おまかせは、達成した中でいちばん上のランクのバッジが出ます",
                    "Auto shows your highest-rank badge",
                  )
                : t(
                    `「${selectedBadge.name}」のバッジが出ます`,
                    `Showing "${selectedBadge.enName}"`,
                  )
              : t(
                  "押すと、あなたの実績ページが開きます",
                  "Tapping it opens your achievements page",
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
      commentBadgeKey
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
      commentBadgeKey
    }
  }`,
)

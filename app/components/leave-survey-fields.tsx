import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  LEAVE_SURVEY_MIN_TEXT,
  type LeaveSurveyAnswer,
  type LeaveSurveyKind,
  leaveSurveyReasons,
  visibleLeaveSurveyGroups,
} from "~/utils/leave-survey"

/**
 * 解約・退会の理由のアンケート（主な理由 → 理由ごとの追加質問（複数選択） → 自由記述 → 改善してほしいこと）
 * 質問の中身は app/utils/leave-survey.ts
 */
export function LeaveSurveyFields(props: {
  kind: LeaveSurveyKind
  value: LeaveSurveyAnswer
  onChange: (value: LeaveSurveyAnswer) => void
  onReasonSelect?: (reason: string) => void
}) {
  const t = useTranslation()
  const reasons = leaveSurveyReasons(props.kind)
  const reason = reasons.find((item) => item.value === props.value.reason)
  const groups = visibleLeaveSurveyGroups(reason, props.value.choices)
  const textLength = props.value.text.trim().length

  const toggle = (groupId: string, optionValue: string) => {
    const current = props.value.choices[groupId] ?? []
    const next = current.includes(optionValue)
      ? current.filter((value) => value !== optionValue)
      : [...current, optionValue]
    props.onChange({
      ...props.value,
      choices: { ...props.value.choices, [groupId]: next },
    })
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        {reasons.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
              props.value.reason === option.value
                ? "border-sky-500 bg-sky-500/10"
                : "hover:bg-muted",
            )}
          >
            <input
              type="radio"
              name={`leave-reason-${props.kind}`}
              value={option.value}
              checked={props.value.reason === option.value}
              onChange={() => {
                // 理由を変えたら、前の理由の追加質問の答えは捨てる
                props.onChange({
                  ...props.value,
                  reason: option.value,
                  choices: {},
                  text: "",
                })
                props.onReasonSelect?.(option.value)
              }}
            />
            {t(option.label[0], option.label[1])}
          </label>
        ))}
      </div>

      {reason && (
        <div className="grid gap-3 rounded-lg bg-muted/50 p-3">
          {groups.map((group) => (
            <div key={group.id} className="grid gap-1.5">
              <p className="font-medium text-sm">
                {t(group.question[0], group.question[1])}
                <span className="ml-1 font-normal text-muted-foreground text-xs">
                  {t("（いくつでも）", "(choose any)")}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((option) => {
                  const selected = (
                    props.value.choices[group.id] ?? []
                  ).includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggle(group.id, option.value)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition",
                        selected
                          ? "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300"
                          : "bg-background hover:bg-muted",
                      )}
                    >
                      {t(option.label[0], option.label[1])}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {reason.text && (
            <div className="grid gap-1.5">
              <p className="font-medium text-sm">
                {t(reason.text.label[0], reason.text.label[1])}
                {reason.text.required && (
                  <span className="ml-1 text-red-500 text-xs">
                    {t("必須", "Required")}
                  </span>
                )}
              </p>
              <textarea
                value={props.value.text}
                onChange={(event) =>
                  props.onChange({ ...props.value, text: event.target.value })
                }
                maxLength={500}
                rows={3}
                placeholder={t(
                  reason.text.placeholder[0],
                  reason.text.placeholder[1],
                )}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              {reason.text.required && textLength < LEAVE_SURVEY_MIN_TEXT && (
                <p className="text-muted-foreground text-xs">
                  {t(
                    `${LEAVE_SURVEY_MIN_TEXT}文字以上で入力してください（あと${LEAVE_SURVEY_MIN_TEXT - textLength}文字）`,
                    `Please write at least ${LEAVE_SURVEY_MIN_TEXT} characters (${LEAVE_SURVEY_MIN_TEXT - textLength} more)`,
                  )}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-1.5">
            <p className="font-medium text-sm">
              {t("改善してほしいこと", "What should we improve?")}
              <span className="ml-1 font-normal text-muted-foreground text-xs">
                {t("（任意）", "(optional)")}
              </span>
            </p>
            <textarea
              value={props.value.improvement}
              onChange={(event) =>
                props.onChange({
                  ...props.value,
                  improvement: event.target.value,
                })
              }
              maxLength={1000}
              rows={2}
              placeholder={t(
                "あれば自由に書いてください",
                "Anything you'd like to tell us",
              )}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

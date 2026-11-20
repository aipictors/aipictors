import type { Anniversary4thStats } from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-stats-type"

export type Milestone = { month: string; label: string; enLabel: string }

const WORK_STEPS = [10_000, 100_000, 300_000, 500_000, 750_000]
const MEMBER_STEPS = [10_000, 50_000, 100_000, 150_000, 200_000]

const toJa = (value: number) =>
  value >= 10_000 ? `${value / 10_000}万` : value.toLocaleString("ja-JP")

const toEn = (value: number) =>
  value >= 1_000 ? `${value / 1_000}K` : value.toLocaleString("en-US")

/**
 * 月ごとの数を累計して、投稿数（削除された作品も含む）・登録者数が節目を越えた月を出す（タイムラインの「〇〇突破」）
 */
export function findMilestones(
  monthly: Anniversary4thStats["monthly"],
): Milestone[] {
  const milestones: Milestone[] = []
  let works = 0
  let members = 0
  let workStep = 0
  let memberStep = 0
  for (const item of monthly) {
    works += item.works
    members += item.registrations
    while (
      workStep < WORK_STEPS.length &&
      works >= (WORK_STEPS[workStep] ?? 0)
    ) {
      const step = WORK_STEPS[workStep] ?? 0
      milestones.push({
        month: item.month,
        label: `投稿${toJa(step)}件突破`,
        enLabel: `${toEn(step)} posts`,
      })
      workStep += 1
    }
    while (
      memberStep < MEMBER_STEPS.length &&
      members >= (MEMBER_STEPS[memberStep] ?? 0)
    ) {
      const step = MEMBER_STEPS[memberStep] ?? 0
      milestones.push({
        month: item.month,
        label: `登録${toJa(step)}人突破`,
        enLabel: `${toEn(step)} members`,
      })
      memberStep += 1
    }
  }
  return milestones
}

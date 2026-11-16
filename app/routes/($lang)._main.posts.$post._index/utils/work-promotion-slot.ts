type ActivePromotion = {
  slot: "GENERAL" | "SENSITIVE"
  workId: string
  endsAt: number
}

export type WorkPromotionSlotState =
  | { kind: "AVAILABLE" }
  | { kind: "THIS_WORK"; endsAt: number }
  | { kind: "OTHER_WORK"; endsAt: number }

/**
 * 宣伝枠（全年齢・R18 で 1 作品ずつ）が、この作品で使えるか
 */
export function toWorkPromotionSlotState(props: {
  slot: "GENERAL" | "SENSITIVE"
  workId: string
  activePromotions: ActivePromotion[]
}): WorkPromotionSlotState {
  const active = props.activePromotions.find(
    (promotion) => promotion.slot === props.slot,
  )
  if (active === undefined) return { kind: "AVAILABLE" }
  return active.workId === props.workId
    ? { kind: "THIS_WORK", endsAt: active.endsAt }
    : { kind: "OTHER_WORK", endsAt: active.endsAt }
}

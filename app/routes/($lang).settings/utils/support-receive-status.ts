/**
 * 推しの受け取りの設定を、いまどうなっているかの一文にまとめる（設定の欄の上に出す）
 */
export const toSupportReceiveStatus = (props: {
  isRejectAll: boolean
  isRejectPremium: boolean
  isRejectFree: boolean
}): { level: "open" | "limited" | "closed"; ja: string; en: string } => {
  if (props.isRejectAll) {
    return {
      level: "closed",
      ja: "推しを受け付けていません（だれもあなたを推せません）",
      en: "Not accepting support (nobody can support you)",
    }
  }
  if (props.isRejectPremium && props.isRejectFree) {
    return {
      level: "limited",
      ja: "フリーコインでの推しだけ受け付け、コインは受け取りません（推しの pt だけ付きます）",
      en: "Free-coin support only, and no coins are given to you (only support points)",
    }
  }
  if (props.isRejectPremium) {
    return {
      level: "limited",
      ja: "フリーコインでの推しだけ受け付けています",
      en: "Accepting support with free coins only",
    }
  }
  if (props.isRejectFree) {
    return {
      level: "limited",
      ja: "プレミアムコインは受け取り、フリーコインは受け取りません（推しの pt は付きます）",
      en: "Receiving premium coins only; free-coin support only adds points",
    }
  }
  return {
    level: "open",
    ja: "すべての推しを受け付けています",
    en: "Accepting all support",
  }
}

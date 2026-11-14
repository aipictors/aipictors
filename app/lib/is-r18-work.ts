/**
 * R18 / R18G の作品か（モザイクを掛ける作品）。
 * API の isSensitive は R15 でも true なので、年齢区分があればそれで決める
 * （isSensitive で決めると R15 の作品に R18 のモザイクが掛かっていた）
 */
export const isR18Work = (work: {
  rating?: string | null
  isSensitive?: boolean | null
}) => {
  if (work.rating) {
    return work.rating === "R18" || work.rating === "R18G"
  }
  return work.isSensitive === true
}

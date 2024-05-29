import type { Rating } from "@/_graphql/__generated__/graphql"

/**
 * 作品の年齢制限の文言を返す
 * @param
 * @returns
 */
export const toRatingText = (type: Rating) => {
  switch (type) {
    case "G":
      return "G"
    case "R15":
      return "R15"
    case "R18":
      return "R18"
    case "R18G":
      return "R18G"
  }
}

import pkg from "google-libphonenumber"
const { PhoneNumberUtil, PhoneNumberFormat } = pkg

export const telStringToNumber: (value: string) => string | null = (
  value: string,
): string | null => {
  // 日本の国コード
  const region = "JP"

  const util = PhoneNumberUtil.getInstance()

  // 番号と地域を設定
  const number = util.parseAndKeepRawInput(value, region)

  // 電話番号の有効性チェック
  if (!util.isValidNumberForRegion(number, region)) {
    return null
  }

  // ハイフン付きの形式で返却
  const result = util.format(number, PhoneNumberFormat.NATIONAL)

  return result
}

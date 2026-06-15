export type AmazonExchangePackageId = "AMAZON_1000" | "AMAZON_10000"

export type AmazonExchangePackage = {
  id: AmazonExchangePackageId
  coinAmount: number
  amazonPointYen: number
  label: string
  labelEn: string
}

export const AMAZON_EXCHANGE_PACKAGES: Record<
  AmazonExchangePackageId,
  AmazonExchangePackage
> = {
  AMAZON_1000: {
    id: "AMAZON_1000",
    coinAmount: 1000,
    amazonPointYen: 300,
    label: "1,000コイン → 300円分のAmazonギフト券",
    labelEn: "1,000 coins → ¥300 Amazon Gift Card",
  },
  AMAZON_10000: {
    id: "AMAZON_10000",
    coinAmount: 10000,
    amazonPointYen: 3000,
    label: "10,000コイン → 3,000円分のAmazonギフト券",
    labelEn: "10,000 coins → ¥3,000 Amazon Gift Card",
  },
}

export const AMAZON_EXCHANGE_MAX_PENDING = 3

export const parseAmazonExchangePackageId = (
  value: string,
): AmazonExchangePackageId | null => {
  const valid: AmazonExchangePackageId[] = ["AMAZON_1000", "AMAZON_10000"]
  return valid.includes(value as AmazonExchangePackageId)
    ? (value as AmazonExchangePackageId)
    : null
}
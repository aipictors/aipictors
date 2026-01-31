declare module "bytes" {
  export type BytesOptions = {
    thousandsSeparator?: string
    unitSeparator?: string
    decimalPlaces?: number
    fixedDecimals?: boolean
    unit?: string
  }

  export type BytesInput = number | string

  export type BytesFn = {
    (value: BytesInput, options?: BytesOptions): string | number | null
    format: (value: BytesInput, options?: BytesOptions) => string
    parse: (value: string | number) => number | null
  }

  const bytes: BytesFn
  export default bytes
}

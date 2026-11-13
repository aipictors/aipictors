import { describe, expect, test } from "bun:test"
import { mergeSdEndpoints } from "./sd-endpoints.server"

const FREE = "https://free-8000.proxy.runpod.net"
const PAID = "https://paid-8000.proxy.runpod.net"
const NIGHT = "https://night-8000.proxy.runpod.net"
const CHEAP = "https://cheap-8000.proxy.runpod.net"

describe("mergeSdEndpoints", () => {
  test("KV に何もなければ常設の分だけ", () => {
    expect(mergeSdEndpoints([FREE, PAID], { night: null, free: null })).toEqual(
      [FREE, PAID],
    )
  })

  test("夜だけ動く GPU は足す", () => {
    expect(
      mergeSdEndpoints([FREE, PAID], { night: NIGHT, free: null }),
    ).toEqual([FREE, PAID, NIGHT])
  })

  test("無料用の置き換え先は、止めた元の無料用 GPU と入れ替える（台数を増やさない）", () => {
    expect(
      mergeSdEndpoints([FREE, PAID], { night: NIGHT, free: CHEAP }),
    ).toEqual([CHEAP, PAID, NIGHT])
  })

  test("同じ URL は重ねない", () => {
    expect(mergeSdEndpoints([FREE, PAID], { night: PAID, free: FREE })).toEqual(
      [FREE, PAID],
    )
  })
})

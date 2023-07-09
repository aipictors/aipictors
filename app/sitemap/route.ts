import { NextRequest, NextResponse } from "next/server"
import { Config } from "config"

export const GET = (req: NextRequest, res: NextResponse) => {
  const pages = [`${Config.appURL}/events/wakiaiai`]

  const text = pages.join("\n")

  return new NextResponse(text)
}

import { NextResponse } from "next/server"

export const middleware = () => {
  const response = NextResponse.next()
  response.headers.append("Access-Control-Allow-Origin", "*")
  response.headers.append("Access-Control-Allow-Methods", "*")
  response.headers.append("Access-Control-Allow-Headers", "*")
  return response
}

export function createRandomString(count: number) {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789"

  let text = ""

  const charactersLength = characters.length

  for (let i = 0; i < count; i++) {
    text += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return text
}

type Props = {
  nanoid: string
}

export async function activeImageGeneration(props: Props) {
  const url = "https://www4.aipictors.com/index.php"

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `id=${props.nanoid}`,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return null
}

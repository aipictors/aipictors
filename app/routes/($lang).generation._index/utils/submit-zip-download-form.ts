type Payload = {
  urls: string[]
  name?: string
}

export function submitZipDownloadForm(payload: Payload) {
  const form = document.createElement("form")
  form.method = "POST"
  form.action = "/api/download-images-zip"
  form.style.display = "none"

  const input = document.createElement("input")
  input.type = "hidden"
  input.name = "payload"
  input.value = JSON.stringify(payload)

  form.appendChild(input)
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

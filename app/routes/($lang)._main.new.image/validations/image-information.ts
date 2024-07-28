import { vImageParameters } from "~/routes/($lang)._main.new.image/validations/image-parameters"
import { nullable, object, string } from "valibot"

export const vImageInformation = object({
  params: vImageParameters,
  src: nullable(string()),
})

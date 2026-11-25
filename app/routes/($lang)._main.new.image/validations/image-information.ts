import { nullable, object, string } from "valibot"
import { vImageParameters } from "~/routes/($lang)._main.new.image/validations/image-parameters"

export const vImageInformation = object({
  params: vImageParameters,
  src: nullable(string()),
})

import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { passFieldsFragment } from "~/graphql/fragments/pass-fields"

export function WorkAdSense() {
  const authContext = useContext(AuthContext)

  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isNotLoggedIn || authContext.isLoading,
  })

  const passData = pass?.viewer?.currentPass

  if (
    authContext.isLoading ||
    passData?.type === "LITE" ||
    passData?.type === "STANDARD" ||
    passData?.type === "PREMIUM"
  ) {
    return null
  }

  return (
    <>
      <Link to={"/generation"}>
        <img
          className="w-full rounded-md border-2 border-gray-200 border-solid"
          src="https://assets.aipictors.com/generator_ad.webp"
          alt="広告"
        />
      </Link>
    </>
  )
}

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)

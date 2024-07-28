import { Link } from "@remix-run/react"

export const WorkAdSense = () => {
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

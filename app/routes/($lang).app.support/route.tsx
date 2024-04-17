import { AppFooter } from "@/[lang]/app/_components/app-footer"

export default function AppSupport() {
  return (
    <>
      <div className="flex min-h-screen justify-center py-8">
        <div>
          <p className="text-center">{"お問い合わせはこちらまで"}</p>
          <p className="text-center font-bold">hello@aipictors.com</p>
        </div>
      </div>
      <AppFooter />
    </>
  )
}

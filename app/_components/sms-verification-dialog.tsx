import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import { useEffect, useRef, useState } from "react"
import {
  RecaptchaVerifier,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithPhoneNumber,
} from "firebase/auth"
import { telStringToNumber } from "@/_utils/tel-string-to-number"
import { Input } from "@/_components/ui/input"
import { Button } from "@/_components/ui/button"

type Props = {
  children: React.ReactNode
}

/**
 * SMS認証ダイアログ
 */
export const SmsVerificationDialog = (props: Props) => {
  const [phoneNumber, setPhoneNumber] = useState("")

  const [applicationVerifier, setApplicationVerifier] =
    useState<RecaptchaVerifier | null>(null)

  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const auth = getAuth()

    if (recaptchaContainerRef.current === null) return

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: (response: string) => {
        console.log("recaptcha callback", response)
      },
      "expired-callback": () => {},
    })

    setApplicationVerifier(verifier)

    signInSms()
  }, [phoneNumber])

  const signInSms = async () => {
    if (applicationVerifier === null) return

    const auth = getAuth()

    await setPersistence(auth, browserLocalPersistence)

    const phoneNumberToNumber = telStringToNumber(phoneNumber)

    try {
      if (phoneNumberToNumber) {
        await signInWithPhoneNumber(
          auth,
          phoneNumberToNumber,
          applicationVerifier,
        )
      }
    } catch (error) {
      console.error("signInWithPhoneNumber", error)
    }
  }

  return (
    <>
      <Dialog
      // open={props.isOpen}
      // onOpenChange={() => {
      //   props.onClose()
      // }}
      >
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"認証案内"}</DialogTitle>
            <p>{"SMS認証を行います。"}</p>
            <div ref={recaptchaContainerRef}>
              {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
              <div id="recaptcha-container"></div>
            </div>
            <div className="flex items-center">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button onClick={signInSms}>{"認証"}</Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

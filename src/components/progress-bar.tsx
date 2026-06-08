"use client"

import { AppProgressBar } from "next-nprogress-bar"

export default function ProgressBar() {
  return (
    <AppProgressBar
      height="2px"
      color="#2BA8A2"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}

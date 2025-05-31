import {
  CommandDialog,
} from "@/components/ui/command"
import React, { type ReactElement, useEffect } from "react"

interface DialogBoxProps {
  keyboardShortcut: string,
  component: ReactElement,
  open?: boolean,
  setOpen?: (open: boolean) => void,
}

export const DialogBox = ({
  keyboardShortcut,
  component,
  open: controlledOpen,
  setOpen: controlledSetOpen,
}: DialogBoxProps): React.ReactElement => {

  const [internalOpen, setInternalOpen] = React.useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = controlledSetOpen ?? setInternalOpen

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === keyboardShortcut && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [keyboardShortcut, open, setOpen])

  return (
    <CommandDialog className="px-6 py-2" open={open} onOpenChange={setOpen}>
      {component}
    </CommandDialog>
  )
}


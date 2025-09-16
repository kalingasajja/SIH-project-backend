"use client"

import type * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-2 border-green-300 bg-white dark:bg-green-950/20 dark:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white data-[state=checked]:border-green-600 focus-visible:border-green-500 focus-visible:ring-green-500/30 aria-invalid:ring-red-500/30 aria-invalid:border-red-500 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 size-5 shrink-0 rounded-md shadow-sm transition-all duration-200 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-green-300",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-all duration-200"
      >
        <CheckIcon className="size-4 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

import { cn } from "@/lib/utils"
import * as React from "react"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  wide?: boolean
}

export function Container({ 
  className, 
  children, 
  wide = false,
  ...props 
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6", 
        wide ? "max-w-7xl" : "max-w-4xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 
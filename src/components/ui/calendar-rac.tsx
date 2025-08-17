"use client"

import { cn } from "@/lib/utils"
import { getLocalTimeZone, today } from "@internationalized/date"
import { ComponentProps } from "react"
import {
  Button,
  CalendarCell as CalendarCellRac,
  CalendarGridBody as CalendarGridBodyRac,
  CalendarGridHeader as CalendarGridHeaderRac,
  CalendarGrid as CalendarGridRac,
  CalendarHeaderCell as CalendarHeaderCellRac,
  Calendar as CalendarRac,
  Heading as HeadingRac,
  RangeCalendar as RangeCalendarRac,
  composeRenderProps,
} from "react-aria-components"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface BaseCalendarProps {
  className?: string
  markedDates?: string[]
}

type CalendarProps = ComponentProps<typeof CalendarRac> & BaseCalendarProps
type RangeCalendarProps = ComponentProps<typeof RangeCalendarRac> &
  BaseCalendarProps

const CalendarHeader = () => (
  <header className="flex w-full items-center gap-1 pb-1">
    <Button
      slot="previous"
      className="flex size-9 items-center justify-center rounded-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:bg-accent hover:text-foreground focus:outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70"
    >
      <ChevronLeftIcon className="h-4 w-4" />
    </Button>
    <HeadingRac className="grow text-center text-sm font-medium" />
    <Button
      slot="next"
      className="flex size-9 items-center justify-center rounded-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:bg-accent hover:text-foreground focus:outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70"
    >
      <ChevronRightIcon className="h-4 w-4" />
    </Button>
  </header>
)

const CalendarGridComponent = ({ isRange = false, markedDates = [] }: { isRange?: boolean; markedDates?: string[] }) => {
  const now = today(getLocalTimeZone())

  return (
    <CalendarGridRac>
      <CalendarGridHeaderRac>
        {(day) => (
          <CalendarHeaderCellRac className="size-9 rounded-lg p-0 text-xs font-medium text-muted-foreground/80">
            {day}
          </CalendarHeaderCellRac>
        )}
      </CalendarGridHeaderRac>
      <CalendarGridBodyRac className="[&_td]:px-0">
        {(date) => (
          <CalendarCellRac
            date={date}
            className={cn(
              "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg border border-transparent p-0 text-sm font-normal text-foreground outline-offset-2 duration-150 [transition-property:color,background-color,border-radius,box-shadow] focus:outline-none data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none data-[focus-visible]:z-10 data-[hovered]:bg-accent data-[selected]:bg-primary data-[hovered]:text-foreground data-[selected]:text-primary-foreground data-[unavailable]:line-through data-[disabled]:opacity-30 data-[unavailable]:opacity-30 data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70",
              // Range-specific styles
              isRange &&
                "data-[selected]:rounded-none data-[selection-end]:rounded-e-lg data-[selection-start]:rounded-s-lg data-[invalid]:bg-red-100 data-[selected]:bg-accent data-[selected]:text-foreground data-[invalid]:data-[selection-end]:[&:not([data-hover])]:bg-destructive data-[invalid]:data-[selection-start]:[&:not([data-hover])]:bg-destructive data-[selection-end]:bg-accent data-[selection-start]:bg-accent data-[selection-end]:text-foreground data-[selection-start]:text-foreground data-[selection-end]:after:pointer-events-none data-[selection-start]:after:pointer-events-none data-[selection-end]:after:absolute data-[selection-start]:after:absolute data-[selection-end]:after:top-1 data-[selection-start]:after:top-1 data-[selection-end]:after:start-1/2 data-[selection-start]:after:start-1/2 data-[selection-end]:after:-translate-x-1/2 data-[selection-start]:after:-translate-x-1/2 data-[selection-end]:after:size-[5px] data-[selection-start]:after:size-[5px] data-[selection-end]:after:rounded-full data-[selection-start]:after:rounded-full data-[selection-end]:after:bg-[var(--primary-600)] data-[selection-start]:after:bg-[var(--primary-600)]",
        // Today indicator styles (no border, keep bottom dot)
              date.compare(now) === 0 &&
                cn(
          "after:pointer-events-none after:absolute after:bottom-1 after:start-1/2 after:z-10 after:size-[3px] after:-translate-x-1/2 after:rounded-full after:bg-primary",
                  isRange
                    ? "data-[selection-end]:[&:not([data-hover])]:after:bg-background data-[selection-start]:[&:not([data-hover])]:after:bg-background"
                    : "data-[selected]:after:bg-background",
                ),
              // Completed day marker (small dot at top-right). Use before: to not clash with today 'after:' dot.
              (() => {
                const y = String(date.year).padStart(4, "0")
                const m = String(date.month).padStart(2, "0")
                const d = String(date.day).padStart(2, "0")
                const key = `${y}-${m}-${d}`
                return markedDates.includes(key)
                  ? "before:pointer-events-none before:absolute before:top-1 before:right-1 before:z-10 before:size-[5px] before:rounded-full before:bg-[var(--success-600)]"
                  : undefined
              })(),
            )}
          />
        )}
      </CalendarGridBodyRac>
    </CalendarGridRac>
  )
}

const Calendar = ({ className, markedDates = [], ...props }: CalendarProps) => {
  return (
    <CalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn("w-fit", className),
      )}
    >
      <CalendarHeader />
  <CalendarGridComponent markedDates={markedDates} />
    </CalendarRac>
  )
}

const RangeCalendar = ({ className, markedDates = [], ...props }: RangeCalendarProps) => {
  return (
    <RangeCalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn("w-fit", className),
      )}
    >
      <CalendarHeader />
  <CalendarGridComponent isRange markedDates={markedDates} />
    </RangeCalendarRac>
  )
}

export { Calendar, RangeCalendar }

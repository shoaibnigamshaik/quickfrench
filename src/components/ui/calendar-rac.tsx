"use client";

import { cn } from "@/lib/utils";
import { getLocalTimeZone, today } from "@internationalized/date";
import { ComponentProps } from "react";
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
} from "react-aria-components";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface BaseCalendarProps {
  className?: string;
  markedDates?: string[];
}

type CalendarProps = ComponentProps<typeof CalendarRac> & BaseCalendarProps;
type RangeCalendarProps = ComponentProps<typeof RangeCalendarRac> &
  BaseCalendarProps;

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
);

const CalendarGridComponent = ({
  isRange = false,
  markedDates = [],
}: {
  isRange?: boolean;
  markedDates?: string[];
}) => {
  const now = today(getLocalTimeZone());

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
              // Base styles
              "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg border border-transparent p-0 text-sm font-normal text-foreground outline-offset-2 duration-150 transition-colors focus:outline-none",
              "data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none data-[focus-visible]:z-10 data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70",
              "data-[hovered]:bg-accent data-[selected]:bg-primary data-[hovered]:text-foreground data-[selected]:text-primary-foreground",
              "data-[unavailable]:line-through data-[disabled]:opacity-30 data-[unavailable]:opacity-30",

              // Range-specific styles - simplified
              isRange && [
                "data-[selected]:bg-accent data-[selected]:text-foreground",
                "data-[selection-start]:rounded-l-lg data-[selection-end]:rounded-r-lg",
                "data-[selection-start]:bg-accent data-[selection-end]:bg-accent",
                "data-[selection-start]:text-foreground data-[selection-end]:text-foreground",
                // Selection indicators
                "data-[selection-start]:before:absolute data-[selection-start]:before:top-1 data-[selection-start]:before:left-1/2 data-[selection-start]:before:-translate-x-1/2 data-[selection-start]:before:w-1 data-[selection-start]:before:h-1 data-[selection-start]:before:rounded-full data-[selection-start]:before:bg-primary data-[selection-start]:before:z-10",
                "data-[selection-end]:after:absolute data-[selection-end]:after:top-1 data-[selection-end]:after:left-1/2 data-[selection-end]:after:-translate-x-1/2 data-[selection-end]:after:w-1 data-[selection-end]:after:h-1 data-[selection-end]:after:rounded-full data-[selection-end]:after:bg-primary data-[selection-end]:after:z-10",
              ],

              // Today indicator - simplified
              date.compare(now) === 0 && [
                "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary after:z-10",
                isRange
                  ? "data-[selection-start]:after:bg-background data-[selection-end]:after:bg-background"
                  : "data-[selected]:after:bg-background",
              ],

              // Completed day marker - simplified
              (() => {
                const y = String(date.year).padStart(4, "0");
                const m = String(date.month).padStart(2, "0");
                const d = String(date.day).padStart(2, "0");
                const key = `${y}-${m}-${d}`;
                return markedDates.includes(key)
                  ? "before:absolute before:top-1 before:right-1 before:w-1 before:h-1 before:rounded-full before:bg-green-500 before:z-10"
                  : "";
              })(),
            )}
          />
        )}
      </CalendarGridBodyRac>
    </CalendarGridRac>
  );
};

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
  );
};

const RangeCalendar = ({
  className,
  markedDates = [],
  ...props
}: RangeCalendarProps) => {
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
  );
};

export { Calendar, RangeCalendar };

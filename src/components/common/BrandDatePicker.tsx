'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { If } from './If';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  showTimePicker?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  minAge?: number;
}

export function DateTimePicker({
  value,
  onChange,
  fromYear = 1950,
  toYear,
  showTimePicker = true,
  disablePast = false,
  disableFuture = false,
  minAge,
}: DateTimePickerProps) {
  const today = new Date();
  const currentYear = today.getFullYear();

  // If minAge exists, override max selectable year

  const maxYear = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (minAge) {
      return currentYear - minAge;
    }
    return toYear ?? currentYear;
  }, [minAge, toYear]);

  // Ensure valid year range
  const safeFromYear = Math.min(fromYear, maxYear);

  const years = useMemo(() => {
    return Array.from(
      { length: maxYear - safeFromYear + 1 },
      (_, i) => safeFromYear + i
    );
  }, [safeFromYear, maxYear]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        format(new Date(2020, i, 1), 'MMMM')
      ),
    []
  );

  //Month state syncs with selected value

  const [month, setMonth] = useState<Date>(() => {
    if (value) return value;

    // If today is actually within our allowed range (1950 to maxYear), show today.
    // Otherwise, fallback to the closest valid limit.
    if (currentYear >= fromYear && currentYear <= maxYear) {
      return today;
    }

    return currentYear < fromYear
      ? new Date(fromYear, 0, 1)
      : new Date(maxYear, 0, 1);
  });

  // Disabled date logic
  const disabledDates = (date: Date) => {
    // Event: disable past
    if (disablePast && date < new Date(today.setHours(0, 0, 0, 0))) {
      return true;
    }

    // Generic future restriction
    if (disableFuture && date > today) {
      return true;
    }

    // DOB restriction (minAge)
    if (minAge) {
      const cutoff = new Date();
      cutoff.setFullYear(currentYear - minAge);
      cutoff.setHours(23, 59, 59, 999);

      if (date > cutoff) return true;
    }

    return false;
  };

  const handleSelect = (date?: Date) => {
    if (!date) return;

    const newDate = new Date(date);

    if (value) {
      newDate.setHours(value.getHours(), value.getMinutes());
    }

    onChange(newDate);
  };

  const formattedTime = value ? format(value, 'HH:mm') : '12:00';

  return (
    <div className="mt-0.5 w-full">
      <Popover>
        <PopoverTrigger className="w-full">
          <div className="relative cursor-pointer">
            <CalendarIcon
              strokeWidth={1.5}
              size={20}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-900"
            />
            <Input
              readOnly
              className="pointer-events-none pl-10 text-start text-zinc-900"
              value={
                value
                  ? showTimePicker
                    ? `${format(value, 'PPP')} @ ${format(value, 'HH:mm')}`
                    : format(value, 'PPP')
                  : `Pick a date${showTimePicker ? ' and time' : ''}`
              }
            />
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-auto border-brand-primary p-0">
          <div className="flex flex-col space-y-3 p-3">
            <div className="flex gap-2">
              <Select
                value={month.getMonth().toString()}
                onValueChange={val =>
                  setMonth(new Date(month.getFullYear(), Number(val)))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={m} value={i.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={month.getFullYear().toString()}
                onValueChange={val =>
                  setMonth(new Date(Number(val), month.getMonth()))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Calendar
              mode="single"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              disabled={disabledDates}
              onSelect={handleSelect}
            />

            <If cond={showTimePicker}>
              <input
                type="time"
                className="rounded-md border px-2 py-1"
                value={formattedTime}
                onChange={e => {
                  const [hours, minutes] = e.target.value
                    .split(':')
                    .map(Number);

                  const newDate = value ? new Date(value) : new Date();
                  newDate.setHours(hours, minutes);
                  onChange(newDate);
                }}
              />
            </If>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  fromYear = 1950,
  toYear = new Date().getFullYear(),
  className,
}: DatePickerProps) {
  const [month, setMonth] = React.useState<Date>(value ?? new Date());

  const years = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => fromYear + i
  );

  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2020, i, 1), 'MMMM')
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Input
          readOnly
          value={value ? format(value, 'dd/MM/yyyy') : ''}
          placeholder="DD / MM / YYYY"
          className={cn('cursor-pointer', className)}
        />
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3" align="start">
        <div className="mb-2 flex gap-2">
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
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

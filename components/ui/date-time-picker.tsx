'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface DateTimePickerProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [time, setTime] = React.useState<string>(
    value ? DateTime.fromISO(value).toFormat('HH:mm') : '00:00'
  )

  React.useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      onChange(newDate.toISOString())
    }
  }, [date, time, onChange])

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? DateTime.fromJSDate(date).toFormat('MMM dd, yyyy') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <TimePicker value={time} onChange={setTime} />
    </div>
  )
}

function TimePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [hour, minute] = value.split(':')

  return (
    <div className="flex gap-1">
      <Select
        value={hour}
        onValueChange={(h) => onChange(`${h}:${minute}`)}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }, (_, i) => (
            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
              {i.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="flex items-center">:</span>

      <Select
        value={minute}
        onValueChange={(m) => onChange(`${hour}:${m}`)}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (
            <SelectItem key={i} value={(i * 5).toString().padStart(2, '0')}>
              {(i * 5).toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
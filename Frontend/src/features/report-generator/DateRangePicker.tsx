import { useMemo, useCallback, useState, useEffect } from "react"
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
} from "date-fns"
import type { Locale } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

export type PresetRange = {
  label: string
  range: DateRange
}

export interface DateRangePickerProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  placeholder?: string
  showPresets?: boolean
  customPresets?: PresetRange[]
  numberOfMonths?: number
  locale?: Locale
  onOpenChange?: (open: boolean) => void
}

const createDefaultPresets = (): PresetRange[] => {
  const now = new Date()
  return [
    {
      label: "Hoje",
      range: { from: now, to: now },
    },
    {
      label: "Últimos 7 dias",
      range: { from: subDays(now, 7), to: now },
    },
    {
      label: "Últimos 14 dias",
      range: { from: subDays(now, 14), to: now },
    },
    {
      label: "Últimos 30 dias",
      range: { from: subDays(now, 30), to: now },
    },
    {
      label: "Este mês",
      range: { from: startOfMonth(now), to: endOfMonth(now) },
    },
    {
      label: "Mês passado",
      range: {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
      },
    },
    {
      label: "Este ano",
      range: { from: startOfYear(now), to: now },
    },
  ]
}

export function DateRangePicker({
  date,
  setDate,
  className,
  minDate,
  maxDate,
  disabled = false,
  placeholder = "Selecione um período",
  showPresets = true,
  customPresets,
  numberOfMonths = 2,
  locale = ptBR,
  onOpenChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const presets = useMemo(
    () => customPresets || createDefaultPresets(),
    [customPresets]
  )

  const isPresetActive = useCallback(
    (preset: PresetRange): boolean => {
      if (!date?.from || !date?.to) return false

      const presetFrom = startOfDay(preset.range.from!)
      const presetTo = startOfDay(preset.range.to!)
      const selectedFrom = startOfDay(date.from)
      const selectedTo = startOfDay(date.to)

      return (
        isEqual(selectedFrom, presetFrom) && isEqual(selectedTo, presetTo)
      )
    },
    [date]
  )

  const handlePresetClick = useCallback(
    (preset: PresetRange) => {
      setDate(preset.range)
      setIsOpen(false)
    },
    [setDate]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setDate(undefined)
    },
    [setDate]
  )

  const formattedDate = useMemo(() => {
    if (!date?.from) return null

    const formatStr = "dd/MM/yyyy"
    const fromStr = format(date.from, formatStr, { locale })

    if (!date.to) return fromStr

    const toStr = format(date.to, formatStr, { locale })
    return `${fromStr} - ${toStr}`
  }, [date, locale])

  const isDateDisabled = useCallback(
    (day: Date): boolean => {
      if (minDate && isBefore(day, startOfDay(minDate))) return true
      if (maxDate && isAfter(day, startOfDay(maxDate))) return true
      return false
    },
    [minDate, maxDate]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  const responsiveNumberOfMonths = isMobile ? 1 : numberOfMonths

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Período
      </Label>

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-12 justify-start text-left font-normal border-input/50 shadow-sm hover:bg-accent/50 transition-colors",
              !date && "text-muted-foreground"
            )}
            data-testid="input-date-range"
            aria-label="Selecionar intervalo de datas"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 truncate">
              {formattedDate || placeholder}
            </span>
            {date && !disabled && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors"
                onClick={handleClear}
                aria-label="Limpar seleção"
              />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            {showPresets && presets.length > 0 && (
              <div className="flex flex-col gap-1 border-b p-3 sm:border-b-0 sm:border-r">
                <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                  Atalhos
                </div>
                <div className="flex flex-col gap-0.5">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant={isPresetActive(preset) ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-sm font-normal h-9 transition-colors",
                        isPresetActive(preset) && "font-medium"
                      )}
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={responsiveNumberOfMonths}
                locale={locale}
                disabled={isDateDisabled}
              />

              <div className="flex gap-2 border-t pt-3 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDate(undefined)
                    setIsOpen(false)
                  }}
                  disabled={!date}
                  className="flex-1"
                >
                  Limpar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { createDefaultPresets }

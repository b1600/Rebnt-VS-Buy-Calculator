import { useId } from 'react'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
  prefix?: string
  hint?: string
}

export function NumberField({
  label,
  value,
  onChange,
  step,
  min,
  max,
  suffix,
  prefix,
  hint,
}: Props) {
  const id = useId()

  return (
    <label className="field" htmlFor={id}>
      <div className="fieldTop">
        <span className="fieldLabel">{label}</span>
        {hint ? <span className="fieldHint">{hint}</span> : null}
      </div>
      <div className="fieldControl">
        {prefix ? <span className="fieldAffix">{prefix}</span> : null}
        <input
          id={id}
          className="fieldInput"
          inputMode="decimal"
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(e.currentTarget.value === '' ? 0 : e.currentTarget.valueAsNumber)}
        />
        {suffix ? <span className="fieldAffix">{suffix}</span> : null}
      </div>
    </label>
  )
}


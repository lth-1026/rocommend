'use client'

import { useState, KeyboardEvent } from 'react'

interface TagInputProps {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  required?: boolean
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = '입력 후 Enter',
  required,
}: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag() {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      <div className="flex min-h-10 flex-wrap gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-sm text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-primary/60 hover:text-primary leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-24 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-sub"
        />
      </div>
    </div>
  )
}

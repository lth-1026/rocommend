'use client'

import { useState, useTransition } from 'react'
import {
  createLocation,
  updateLocation,
  deleteLocation,
  setPrimaryLocation,
  geocodeAddress,
  type AdminLocation,
  type LocationInput,
} from '@/actions/admin'

interface Props {
  roasteryId: string
  initialLocations: AdminLocation[]
}

interface FormState {
  address: string
  lat: string
  lng: string
  isPrimary: boolean
}

const emptyForm = (): FormState => ({ address: '', lat: '', lng: '', isPrimary: false })

export function LocationSection({ roasteryId, initialLocations }: Props) {
  const [locations, setLocations] = useState<AdminLocation[]>(initialLocations)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isGeocoding, startGeocodeTransition] = useTransition()

  function handleEdit(loc: AdminLocation) {
    setEditingId(loc.id)
    setShowAddForm(false)
    setForm({
      address: loc.address,
      lat: loc.lat != null ? String(loc.lat) : '',
      lng: loc.lng != null ? String(loc.lng) : '',
      isPrimary: loc.isPrimary,
    })
    setError(null)
    setGeocodeError(null)
  }

  function handleAddNew() {
    setEditingId(null)
    setShowAddForm(true)
    setForm(emptyForm())
    setError(null)
    setGeocodeError(null)
  }

  function handleCancel() {
    setEditingId(null)
    setShowAddForm(false)
    setForm(emptyForm())
    setError(null)
    setGeocodeError(null)
  }

  function handleGeocode() {
    setGeocodeError(null)
    startGeocodeTransition(async () => {
      const result = await geocodeAddress(form.address)
      if (!result.success) {
        setGeocodeError(result.error)
        return
      }
      const { lat, lng } = result.data!
      setForm((f) => ({
        ...f,
        lat: String(lat),
        lng: String(lng),
      }))
    })
  }

  function handleSave() {
    setError(null)
    const input: LocationInput = {
      address: form.address,
      lat: form.lat !== '' ? parseFloat(form.lat) : null,
      lng: form.lng !== '' ? parseFloat(form.lng) : null,
      isPrimary: form.isPrimary,
    }

    startTransition(async () => {
      if (editingId) {
        const result = await updateLocation(editingId, roasteryId, input)
        if (!result.success) {
          setError(result.error)
          return
        }
        const saved = result.data!
        setLocations((prev) => {
          const updated = prev.map((l) => {
            if (input.isPrimary && l.id !== editingId) return { ...l, isPrimary: false }
            if (l.id === editingId) return saved
            return l
          })
          return sortLocations(updated)
        })
        setEditingId(null)
      } else {
        const result = await createLocation(roasteryId, input)
        if (!result.success) {
          setError(result.error)
          return
        }
        const saved = result.data!
        setLocations((prev) => {
          const next = input.isPrimary
            ? [...prev.map((l) => ({ ...l, isPrimary: false })), saved]
            : [...prev, saved]
          return sortLocations(next)
        })
        setShowAddForm(false)
      }
      setForm(emptyForm())
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteLocation(id, roasteryId)
      if (!result.success) {
        setError(result.error)
        return
      }
      setLocations((prev) => prev.filter((l) => l.id !== id))
      if (editingId === id) setEditingId(null)
    })
  }

  function handleSetPrimary(id: string) {
    startTransition(async () => {
      const result = await setPrimaryLocation(id, roasteryId)
      if (!result.success) {
        setError(result.error)
        return
      }
      setLocations((prev) => sortLocations(prev.map((l) => ({ ...l, isPrimary: l.id === id }))))
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">지점 목록 ({locations.length})</h2>
        {!showAddForm && editingId === null && (
          <button
            onClick={handleAddNew}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            + 새 지점
          </button>
        )}
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {locations.length === 0 && !showAddForm ? (
        <p className="text-sm text-text-sub">등록된 지점이 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-sub">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-sub">주소</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">위도</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">경도</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">대표</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {locations.map((loc) =>
                editingId === loc.id ? (
                  <tr key={loc.id} className="bg-surface-sub/50">
                    <td colSpan={5} className="px-4 py-3">
                      <InlineForm
                        form={form}
                        onChange={setForm}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onGeocode={handleGeocode}
                        isPending={isPending}
                        isGeocoding={isGeocoding}
                        geocodeError={geocodeError}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={loc.id} className="hover:bg-surface-sub transition-colors">
                    <td className="px-4 py-3 text-text">{loc.address}</td>
                    <td className="px-4 py-3 text-text-sub">{loc.lat ?? '—'}</td>
                    <td className="px-4 py-3 text-text-sub">{loc.lng ?? '—'}</td>
                    <td className="px-4 py-3">
                      {loc.isPrimary ? (
                        <span className="rounded px-1.5 py-0.5 text-xs bg-primary/10 text-primary font-medium">
                          대표
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimary(loc.id)}
                          disabled={isPending}
                          className="text-xs text-text-sub hover:text-text transition-colors disabled:opacity-40"
                        >
                          대표 설정
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(loc)}
                          disabled={isPending}
                          className="text-xs text-text-sub hover:text-text transition-colors disabled:opacity-40"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id)}
                          disabled={isPending}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {showAddForm && (
                <tr className="bg-surface-sub/50">
                  <td colSpan={5} className="px-4 py-3">
                    <InlineForm
                      form={form}
                      onChange={setForm}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onGeocode={handleGeocode}
                      isPending={isPending}
                      isGeocoding={isGeocoding}
                      geocodeError={geocodeError}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && locations.length === 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="px-4 py-3">
            <InlineForm
              form={form}
              onChange={setForm}
              onSave={handleSave}
              onCancel={handleCancel}
              onGeocode={handleGeocode}
              isPending={isPending}
              isGeocoding={isGeocoding}
              geocodeError={geocodeError}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface InlineFormProps {
  form: FormState
  onChange: (f: FormState) => void
  onSave: () => void
  onCancel: () => void
  onGeocode: () => void
  isPending: boolean
  isGeocoding: boolean
  geocodeError: string | null
}

function InlineForm({
  form,
  onChange,
  onSave,
  onCancel,
  onGeocode,
  isPending,
  isGeocoding,
  geocodeError,
}: InlineFormProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-sub">주소</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.address}
            onChange={(e) => onChange({ ...form, address: e.target.value })}
            placeholder="서울 마포구 합정동 ..."
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={onGeocode}
            disabled={isGeocoding || !form.address.trim()}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs text-text-sub hover:text-text transition-colors disabled:opacity-40"
          >
            {isGeocoding ? '조회 중...' : '좌표 자동 입력'}
          </button>
        </div>
        {geocodeError && <p className="text-xs text-red-500">{geocodeError}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-text-sub">위도 (lat)</label>
          <input
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => onChange({ ...form, lat: e.target.value })}
            placeholder="37.5665"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-text-sub">경도 (lng)</label>
          <input
            type="number"
            step="any"
            value={form.lng}
            onChange={(e) => onChange({ ...form, lng: e.target.value })}
            placeholder="126.9780"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isPrimary}
          onChange={(e) => onChange({ ...form, isPrimary: e.target.checked })}
          className="rounded border-border accent-primary"
        />
        <span className="text-xs text-text-sub">대표 지점으로 설정</span>
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-xs text-text-sub hover:text-text transition-colors disabled:opacity-40"
        >
          취소
        </button>
      </div>
    </div>
  )
}

function sortLocations(locations: AdminLocation[]): AdminLocation[] {
  return [...locations].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.id.localeCompare(b.id)
  })
}

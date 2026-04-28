import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Paintbrush } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useColors, type ColorRecord } from '../../lib/api';
import { colorHexMap } from '../components/utils/colorMapping';

// ── Color conversion helpers (HSV ↔ HEX) ─────────────────────────────────

interface HSV { h: number; s: number; v: number; }

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hsvToRgb({ h, s, v }: HSV): { r: number; g: number; b: number } {
  const c = v * s;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh >= 0 && hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToHex(hsv: HSV): string {
  const { r, g, b } = hsvToRgb(hsv);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): HSV | null {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return rgbToHsv(r, g, b);
}

// ── Color Picker ──────────────────────────────────────────────────────────

function ColorPicker({
  hex,
  onChange,
}: {
  hex: string;
  onChange: (hex: string) => void;
}) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(hex) ?? { h: 0, s: 1, v: 1 });
  const [hexInput, setHexInput] = useState(hex);
  const fieldRef = useRef<HTMLDivElement>(null);
  const draggingField = useRef(false);

  // Sync internal HSV when parent hex changes (e.g. when opening modal)
  useEffect(() => {
    const parsed = hexToHsv(hex);
    if (parsed) {
      setHsv(parsed);
      setHexInput(hex.startsWith('#') ? hex : `#${hex}`);
    }
  }, [hex]);

  const emit = (next: HSV) => {
    setHsv(next);
    const newHex = hsvToHex(next);
    setHexInput(newHex);
    onChange(newHex);
  };

  // Pure hue color (s=1, v=1) used as the SV-square base
  const hueColor = useMemo(() => hsvToHex({ h: hsv.h, s: 1, v: 1 }), [hsv.h]);

  // ── SV square mouse handling ─────────────────────────────────────────
  const handleFieldPointer = (clientX: number, clientY: number) => {
    const el = fieldRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);
    const s = rect.width === 0 ? 0 : x / rect.width;
    const v = rect.height === 0 ? 0 : 1 - y / rect.height;
    emit({ ...hsv, s, v });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingField.current) handleFieldPointer(e.clientX, e.clientY);
    };
    const onUp = () => { draggingField.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hsv.h]);

  const handleHexBlur = () => {
    const parsed = hexToHsv(hexInput);
    if (parsed) {
      emit(parsed);
    } else {
      // revert
      setHexInput(hsvToHex(hsv));
      toast.error('Invalid hex code');
    }
  };

  // Cursor positions inside SV field (percentages)
  const cursorLeft = `${hsv.s * 100}%`;
  const cursorTop = `${(1 - hsv.v) * 100}%`;

  return (
    <div className="space-y-3">
      {/* SV Color Field */}
      <div
        ref={fieldRef}
        onMouseDown={(e) => {
          draggingField.current = true;
          handleFieldPointer(e.clientX, e.clientY);
        }}
        className="relative w-full h-44 rounded-lg overflow-hidden cursor-crosshair select-none border border-gray-200 dark:border-gray-700"
        style={{ backgroundColor: hueColor }}
      >
        {/* white→transparent (saturation) gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #ffffff, rgba(255,255,255,0))' }}
        />
        {/* transparent→black (value) gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #000000, rgba(0,0,0,0))' }}
        />
        {/* cursor */}
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow pointer-events-none"
          style={{
            left: cursorLeft,
            top: cursorTop,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
          }}
        />
      </div>

      {/* Hue slider */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
          Hue
        </label>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hsv.h)}
          onChange={(e) => emit({ ...hsv, h: Number(e.target.value) })}
          className="w-full h-3 appearance-none rounded-full cursor-pointer hue-slider"
          style={{
            background:
              'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
          }}
        />
        <style>{`
          .hue-slider::-webkit-slider-thumb {
            appearance: none; -webkit-appearance: none;
            width: 18px; height: 18px;
            border-radius: 50%;
            background: white;
            border: 2px solid #555;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            cursor: pointer;
          }
          .hue-slider::-moz-range-thumb {
            width: 18px; height: 18px;
            border-radius: 50%;
            background: white;
            border: 2px solid #555;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            cursor: pointer;
          }
        `}</style>
      </div>

      {/* Hex input + preview swatch */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0"
          style={{ backgroundColor: hsvToHex(hsv) }}
        />
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Hex Code
          </label>
          <Input
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={handleHexBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleHexBlur();
              }
            }}
            placeholder="#000000"
            className="font-mono uppercase text-sm"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

// ── Predefined Color Dropdown ─────────────────────────────────────────────────

function PredefinedColorDropdown({
  onSelect,
}: {
  onSelect: (name: string, hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropHeight = 260;

      if (spaceBelow >= dropHeight || spaceBelow >= spaceAbove) {
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 99999,
        });
      } else {
        setDropdownStyle({
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 99999,
        });
      }
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll (only parent, not dropdown)
  useEffect(() => {
    if (!open || !dropdownRef.current) return;
    const handler = (e: Event) => {
      if (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('scroll', handler, true);
    return () => document.removeEventListener('scroll', handler, true);
  }, [open]);

  const filtered = Object.entries(colorHexMap)
    .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
      >
        {open ? '-- Choose a vehicle color --' : '-- Choose a vehicle color --'}
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus
              className="w-full text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Search color…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No match</p>
            ) : (
              filtered.map(([name, hex]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onSelect(name, hex);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span
                    className="inline-block w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="truncate text-gray-900 dark:text-gray-100">{name}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────

function ColorFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial: ColorRecord | null;
  onClose: () => void;
  onSave: (name: string, hex: string) => Promise<void>;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [hex, setHex] = useState(initial?.hex ?? '#3b82f6');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a color name');
      return;
    }
    if (!/^#[0-9a-f]{6}$/i.test(hex)) {
      toast.error('Hex code must be in the format #RRGGBB');
      return;
    }
    setSaving(true);
    try {
      await onSave(name.trim(), hex.toLowerCase());
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save color');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Paintbrush className="size-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {isEdit ? 'Edit Color' : 'Add New Color'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="size-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Predefined Colors Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select from Predefined Colors <span className="text-gray-400">(optional)</span>
            </label>
            <PredefinedColorDropdown
              onSelect={(name, hex) => {
                setName(name);
                setHex(hex.toLowerCase());
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pearl Arctic White"
              autoFocus
            />
          </div>

          {/* Custom color picker */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pick a Color <span className="text-red-500">*</span>
            </label>
            <ColorPicker hex={hex} onChange={setHex} />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="size-4" />
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Color'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export function ColorsPage() {
  const navigate = useNavigate();
  const { colors, loading, addColor, updateColor, removeColor } = useColors();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ColorRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return colors;
    return colors.filter(
      (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q),
    );
  }, [colors, search]);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (c: ColorRecord) => { setEditing(c); setShowModal(true); };

  const handleSave = async (name: string, hex: string) => {
    if (editing) {
      await updateColor(editing.id, { name, hex });
      toast.success('Color updated');
    } else {
      await addColor({ name, hex });
      toast.success('Color added');
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await removeColor(deleteId);
      toast.success('Color deleted');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-950 p-2.5 rounded-lg">
                <Paintbrush className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  List of Colors
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage vehicle colors used across the inventory
                </p>
              </div>
            </div>
          </div>
          <Button onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="size-4" />
            Add Color
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-6">
        <div className="max-w-4xl mx-auto w-full space-y-4 flex flex-col flex-1 overflow-hidden">
          <Input
            placeholder="Search by name or hex code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[80px]">
                      Swatch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Hex Code
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[140px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading && colors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                        Loading…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                        {colors.length === 0
                          ? 'No colors yet. Click "Add Color" to create one.'
                          : 'No colors match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div
                            className="w-9 h-9 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                            title={c.hex}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs uppercase text-gray-700 dark:text-gray-300">
                          {c.hex}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(c)}
                              className="gap-1"
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(c.id)}
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ColorFormModal
          initial={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      {deleteId != null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Delete color?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              This will permanently remove "
              <span className="font-medium">{colors.find((c) => c.id === deleteId)?.name}</span>"
              from the list. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

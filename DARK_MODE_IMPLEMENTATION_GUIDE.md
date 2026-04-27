# Dark Mode Implementation Guide - Before/After Examples

## Quick Navigation
1. [DashboardPage.tsx](#1-dashboardpagetsx)
2. [Filters.tsx](#2-filterstsx)
3. [VehicleTable.tsx](#3-vehicletabletsx)
4. [HistoryPanel.tsx](#4-historypaneltsx)
5. [AddVehicleModal.tsx](#5-addvehiclemodaltsx)
6. [VehicleDetailsModal.tsx](#6-vehicledetailsmodaltsx)
7. [AddAvailableVehicleModal.tsx](#7-addavailablevehiclemodaltsx)
8. [AddInTransitModal.tsx](#8-addintransitmodaltsx)
9. [StatsCards.tsx](#9-statscardstsx)
10. [OverdueAlerts.tsx](#10-overduealetstsx)

---

## 1. DashboardPage.tsx

### Issue 1.1: Empty State Container
**Lines: 154-156**

BEFORE:
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
  <p className="text-gray-500">No vehicles found matching your filters.</p>
</div>
```

AFTER:
```tsx
<div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
  <p className="text-gray-500 dark:text-gray-400">No vehicles found matching your filters.</p>
</div>
```

---

## 2. Filters.tsx

### Issue 2.1: Main Container
**Lines: 43**

BEFORE:
```tsx
<div className="bg-white border-b border-gray-200">
```

AFTER:
```tsx
<div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-700">
```

### Issue 2.2-2.8: Category Tabs (7 instances)
**Lines: 85-145**

BEFORE:
```tsx
<button
  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
    selectedCategory === 'DEMO'
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`}
>
  Demo
</button>
```

AFTER:
```tsx
<button
  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
    selectedCategory === 'DEMO'
      ? 'bg-blue-600 text-white dark:bg-blue-700'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
  }`}
>
  Demo
</button>
```

### Issue 2.9: Search Input
**Line: 64**

BEFORE:
```tsx
<input
  type="text"
  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
  placeholder="Quick search..."
/>
```

AFTER:
```tsx
<input
  type="text"
  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 w-56"
  placeholder="Quick search..."
/>
```

---

## 3. VehicleTable.tsx

### Issue 3.1: Main Table Container
**Line: 296**

BEFORE:
```tsx
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
```

AFTER:
```tsx
<div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
```

### Issue 3.2: Table Header
**Line: 300**

BEFORE:
```tsx
<TableRow className="bg-gray-50">
```

AFTER:
```tsx
<TableRow className="bg-gray-50 dark:bg-slate-800">
```

### Issue 3.3: Overdue Row Styling
**Line: 418**

BEFORE:
```tsx
className={
  vehicle.overdue
    ? "bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
    : "cursor-pointer hover:bg-gray-50 transition-colors"
}
```

AFTER:
```tsx
className={
  vehicle.overdue
    ? "bg-red-50 dark:bg-red-950 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
}
```

### Issue 3.4: Status Badges (Example for Blue)
**Lines: 193-195**

BEFORE:
```tsx
"On Process": {
  className: "bg-blue-100 text-blue-700 border-blue-200",
},
```

AFTER:
```tsx
"On Process": {
  className: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
},
```

Apply this pattern to all 12 status types:
- Pending: yellow variants
- Completed: green variants  
- Overdue: red variants
- HELD: gray variants
- SOLD: green variants
- PAID WITH LTO: blue variants
- FOR LTO PROCESSING: orange variants
- ON HOLD: gray/teal variants
- ON TRACK: green variants
- IN TRANSIT: purple variants
- AVAILABLE: teal variants

---

## 4. HistoryPanel.tsx

### Issue 4.1: Panel Container
**Line: 63**

BEFORE:
```tsx
<div className="relative w-[480px] h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
```

AFTER:
```tsx
<div className="relative w-[480px] h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col">
```

### Issue 4.2: Header
**Lines: 66-73**

BEFORE:
```tsx
<div className="border-b border-gray-200 p-6">
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-gray-900">Service History</h2>
      <p className="text-sm text-gray-500 mt-1">Complete timeline and actions</p>
    </div>
```

AFTER:
```tsx
<div className="border-b border-gray-200 dark:border-gray-700 p-6">
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Service History</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete timeline and actions</p>
    </div>
```

### Issue 4.3: Vehicle Info Box
**Lines: 78-98**

BEFORE:
```tsx
<div className="bg-gray-50 rounded-lg p-4 space-y-2">
  <div className="flex items-center justify-between">
    <h3 className="font-medium text-gray-900">{vehicle.model}</h3>
```

AFTER:
```tsx
<div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
  <div className="flex items-center justify-between">
    <h3 className="font-medium text-gray-900 dark:text-gray-100">{vehicle.model}</h3>
```

### Issue 4.4: Timeline Card
**Line: 128**

BEFORE:
```tsx
<div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
  <div className="flex items-start justify-between mb-2">
    <div>
      <h4 className="font-medium text-gray-900">{entry.action}</h4>
      <p className="text-xs text-gray-500 mt-1">
```

AFTER:
```tsx
<div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
  <div className="flex items-start justify-between mb-2">
    <div>
      <h4 className="font-medium text-gray-900 dark:text-gray-100">{entry.action}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
```

### Issue 4.5: Timeline Line
**Line: 114**

BEFORE:
```tsx
<div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200" />
```

AFTER:
```tsx
<div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
```

---

## 5. AddVehicleModal.tsx

### Issue 5.1: Modal Header
**Line: 392**

BEFORE:
```tsx
<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
  <div>
    <h2 className="text-xl font-semibold text-gray-900">Add New Vehicle</h2>
    <p className="text-sm text-gray-600">Fill in the vehicle details</p>
```

AFTER:
```tsx
<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Vehicle</h2>
    <p className="text-sm text-gray-600 dark:text-gray-400">Fill in the vehicle details</p>
```

### Issue 5.2: Section Headers (8 instances)
**Example Line: 413**

BEFORE:
```tsx
<h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
  <div className="h-1 w-8 bg-blue-600 rounded" />
  Basic Information
</h3>
```

AFTER:
```tsx
<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
  <div className="h-1 w-8 bg-blue-600 dark:bg-blue-500 rounded" />
  Basic Information
</h3>
```

### Issue 5.3: Form Sections (8 instances)
**Example Line: 416**

BEFORE:
```tsx
<div className="bg-gray-50 rounded-lg p-4">
```

AFTER:
```tsx
<div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
```

### Issue 5.4: FormField Component
**Line: 300**

BEFORE:
```tsx
<div className="flex py-3 border-b border-gray-100 last:border-0">
  <div className="w-1/3 text-sm font-medium text-gray-700 flex items-center">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </div>
```

AFTER:
```tsx
<div className="flex py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
  <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </div>
```

---

## 6. VehicleDetailsModal.tsx

### Issue 6.1: Modal Header (Similar to AddVehicleModal)
**Lines: Similar structure**

Apply the same pattern as AddVehicleModal Issue 5.1-5.4

### Issue 6.2: Status Badge (Example)
**Line: 269**

BEFORE:
```tsx
"On Process": { className: "bg-blue-100 text-blue-700 border-blue-200" },
Pending: { className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
```

AFTER:
```tsx
"On Process": { className: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
Pending: { className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
```

### Issue 6.3: DetailRow Component
**Line: 337**

BEFORE:
```tsx
<div className="flex py-3 border-b border-gray-100 last:border-0">
  <div className="w-1/3 text-sm font-medium text-gray-700 flex items-center">
    {label}
  </div>
  <div className="w-2/3 text-sm text-gray-900">{renderValue()}</div>
</div>
```

AFTER:
```tsx
<div className="flex py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
  <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
    {label}
  </div>
  <div className="w-2/3 text-sm text-gray-900 dark:text-gray-100">{renderValue()}</div>
</div>
```

---

## 7. AddAvailableVehicleModal.tsx

### Issue 7.1: Color Select Button
**Line: 97**

BEFORE:
```tsx
<button
  className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
>
```

AFTER:
```tsx
<button
  className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors dark:text-gray-100"
>
```

### Issue 7.2: Dropdown Container
**Line: 122**

BEFORE:
```tsx
<div
  ref={dropdownRef}
  style={dropdownStyle}
  className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
>
```

AFTER:
```tsx
<div
  ref={dropdownRef}
  style={dropdownStyle}
  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
>
```

### Issue 7.3: Search Input in Dropdown
**Line: 127**

BEFORE:
```tsx
<input
  autoFocus
  className="w-full text-sm px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
  placeholder="Search color…"
/>
```

AFTER:
```tsx
<input
  autoFocus
  className="w-full text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
  placeholder="Search color…"
/>
```

### Issue 7.4: Dropdown Items
**Line: 153**

BEFORE:
```tsx
<button
  key={name}
  type="button"
  onClick={() => { onChange(name); setOpen(false); setSearch(''); }}
  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-teal-50 transition-colors ${value === name ? 'bg-teal-50 font-medium' : ''}`}
>
```

AFTER:
```tsx
<button
  key={name}
  type="button"
  onClick={() => { onChange(name); setOpen(false); setSearch(''); }}
  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors ${value === name ? 'bg-teal-50 dark:bg-teal-900/50 font-medium' : 'dark:text-gray-300'}`}
>
```

---

## 8. AddInTransitModal.tsx

Apply the same fixes as AddAvailableVehicleModal for the color dropdown (Issues 7.1-7.4).

Additional modal-level fixes similar to AddVehicleModal would be needed for the modal container itself.

---

## 9. StatsCards.tsx

### Issue 9.1: Card Border
**Line: 20**

BEFORE:
```tsx
<Card key={stat.label} className="border-gray-200">
```

AFTER:
```tsx
<Card key={stat.label} className="border-gray-200 dark:border-gray-700">
```

### Issue 9.2-9.3: Stat Labels and Values
**Lines: 24-25**

BEFORE:
```tsx
<p className="text-sm text-gray-600 mb-1">{stat.label}</p>
<p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
```

AFTER:
```tsx
<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
<p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
```

### Issue 9.4: Stats Data with Icon Backgrounds and Colors
**Lines: 9-24**

BEFORE:
```tsx
const stats = [
  {
    label: 'Total Vehicles',
    value: totalVehicles,
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  // ... more stats
];
```

AFTER:
```tsx
const stats = [
  {
    label: 'Total Vehicles',
    value: totalVehicles,
    icon: Car,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
  },
  {
    label: 'On Process',
    value: onProcess,
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
  },
  {
    label: 'Completed',
    value: completed,
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900',
  },
  {
    label: 'Overdue',
    value: overdue,
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900',
  },
];
```

---

## 10. OverdueAlerts.tsx

### Issue 10.1: Card Container
**Line: 15**

BEFORE:
```tsx
<Card className="border-red-200 bg-red-50">
```

AFTER:
```tsx
<Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
```

### Issue 10.2: Alert Title and Badge
**Lines: 19, 22**

BEFORE:
```tsx
<CardTitle className="text-lg flex items-center gap-2">
  <AlertCircle className="size-5 text-red-600" />
  Overdue Alerts
</CardTitle>
<Badge className="bg-red-600 text-white">
```

AFTER:
```tsx
<CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
  <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
  Overdue Alerts
</CardTitle>
<Badge className="bg-red-600 dark:bg-red-500 text-white">
```

### Issue 10.3: Empty State
**Line: 29**

BEFORE:
```tsx
<p className="text-sm text-gray-600 py-4 text-center">
  No overdue vehicles at the moment.
</p>
```

AFTER:
```tsx
<p className="text-sm text-gray-600 dark:text-gray-400 py-4 text-center">
  No overdue vehicles at the moment.
</p>
```

### Issue 10.4: Vehicle Item Container
**Line: 32**

BEFORE:
```tsx
<div
  key={vehicle.id}
  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-300 transition-colors"
>
```

AFTER:
```tsx
<div
  key={vehicle.id}
  className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-red-200 dark:border-red-900 hover:border-red-300 dark:hover:border-red-800 transition-colors"
>
```

### Issue 10.5: Vehicle Details
**Lines: 40-51**

BEFORE:
```tsx
<p className="font-medium text-gray-900">{vehicle.model}</p>
<Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
<div className="text-sm text-gray-600 space-y-1">
<div className="flex items-center gap-1 text-red-600">
```

AFTER:
```tsx
<p className="font-medium text-gray-900 dark:text-gray-100">{vehicle.model}</p>
<Badge variant="outline" className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">
<div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
<div className="flex items-center gap-1 text-red-600 dark:text-red-400">
```

---

## Next Steps

1. **Start with Phase 1**: Fix the UI component library (input, select, button, card)
2. **Move to Phase 2**: Apply fixes to VehicleTable and Filters
3. **Complete Phase 3**: Update all remaining components
4. **Test thoroughly**: Use both light and dark modes

For detailed line-by-line analysis, see [DARK_MODE_ANALYSIS.md](./DARK_MODE_ANALYSIS.md).
For implementation checklist, see [DARK_MODE_QUICK_REFERENCE.md](./DARK_MODE_QUICK_REFERENCE.md).

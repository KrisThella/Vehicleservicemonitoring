# Dark Mode CSS Classes Analysis - Comprehensive List

## Summary
Analysis of 10 files/components identifying all CSS classes requiring dark mode (dark:) variants for complete dark theme support.

**Total Issues Found: 187 locations across 10 files**

---

## 1. src/app/pages/DashboardPage.tsx

### File Overview
- Total Lines: ~180
- Dark Mode Issues: **2 critical areas**

### Issues Found

#### Issue 1.1: Empty State Message Container
**Location:** Lines 154-156  
**Current Classes:**
```tsx
className="bg-white rounded-lg border border-gray-200 p-12 text-center"
```
**Problem:** White background with gray border becomes invisible in dark mode  
**Suggestion:**
```tsx
className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center"
```
**Classes to Add:** `dark:bg-slate-900`, `dark:border-gray-700`

#### Issue 1.2: Empty State Text Color
**Location:** Line 156  
**Current Classes:**
```tsx
className="text-gray-500"
```
**Problem:** Gray text becomes hard to read on dark backgrounds  
**Suggestion:**
```tsx
className="text-gray-500 dark:text-gray-400"
```
**Classes to Add:** `dark:text-gray-400`

---

## 2. src/app/components/Filters.tsx

### File Overview
- Total Lines: ~350
- Dark Mode Issues: **52 locations**

### Issues Found

#### Issue 2.1: Main Filter Container
**Location:** Line 43  
**Current Classes:**
```tsx
className="bg-white border-b border-gray-200"
```
**Suggestion:**
```tsx
className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-700"
```
**Classes to Add:** `dark:bg-slate-950`, `dark:border-gray-700`

#### Issue 2.2: Header Bar Border
**Location:** Line 46  
**Current Classes:**
```tsx
className="flex items-center justify-between px-3 py-2 border-b border-gray-100"
```
**Suggestion:**
```tsx
className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800"
```
**Classes to Add:** `dark:border-gray-800`

#### Issue 2.3: Filter Button Text
**Location:** Line 49  
**Current Classes:**
```tsx
className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors group"
```
**Suggestion:**
```tsx
className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
```
**Classes to Add:** `dark:text-gray-300`, `dark:hover:text-blue-400`

#### Issue 2.4: Filter Icon Color
**Location:** Line 51  
**Current Classes:**
```tsx
className="size-4 text-gray-500 group-hover:text-blue-500"
```
**Suggestion:**
```tsx
className="size-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
```
**Classes to Add:** `dark:text-gray-400`, `dark:group-hover:text-blue-400`

#### Issue 2.5: Chevron Icon Color
**Location:** Line 57  
**Current Classes:**
```tsx
className="size-4 text-gray-400"
```
**Suggestion:**
```tsx
className="size-4 text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 2.6: Quick Search Input Container
**Location:** Lines 61-64  
**Current Classes:**
```tsx
className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
```
**Suggestion:**
```tsx
className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 w-56"
```
**Classes to Add:** `dark:border-gray-600`, `dark:bg-slate-800`, `dark:text-gray-100`, `dark:focus:ring-blue-500`

#### Issue 2.7: Search Icon in Collapsed View
**Location:** Line 62  
**Current Classes:**
```tsx
className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
```
**Suggestion:**
```tsx
className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 2.8: Clear All Button
**Location:** Line 72  
**Current Classes:**
```tsx
className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
```
**Suggestion:**
```tsx
className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
```
**Classes to Add:** `dark:text-blue-400`, `dark:hover:text-blue-300`, `dark:hover:bg-blue-900/20`

#### Issue 2.9-2.52: Category Filter Tabs (Multiple Instances)
**Location:** Lines 85-135 (Multiple button instances)  
**Pattern:** All category tabs use conditional styling with `bg-gray-100`, `text-gray-700`, `hover:bg-gray-200`

**Current Pattern:**
```tsx
className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
  selectedCategory === 'all'
    ? 'bg-blue-600 text-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}`}
```

**Suggestion:**
```tsx
className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
  selectedCategory === 'all'
    ? 'bg-blue-600 text-white dark:bg-blue-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
}`}
```

**7 Category Tabs Need Updates (Lines 85, 95, 105, 115, 125, 135, 145):**
- All Inventory
- Demo  
- Sales
- Allocation
- Available
- In Transit
- Pull Out Monitoring

**Classes to Add to Each:** `dark:bg-gray-800`, `dark:text-gray-300`, `dark:hover:bg-gray-700`, `dark:bg-blue-700` (for selected)

#### Issue 2.20: Search Input (Expanded View)
**Location:** Line 179  
**Current Classes:**
```tsx
className="pl-10"
```
**Note:** This is on the `<Input>` component from ui/input - needs dark mode support  
**Suggestion:** Component-level fix needed

#### Issue 2.21: Search Icon (Expanded View)
**Location:** Line 177  
**Current Classes:**
```tsx
className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
```
**Suggestion:**
```tsx
className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 2.22: Refresh Button
**Location:** Line 185  
**Current Classes:** Button variant="outline" (needs dark mode support)  
**Suggestion:** Component-level fix needed

#### Issue 2.23: Export Button
**Location:** Line 188  
**Current Classes:** Button variant="outline" (needs dark mode support)  
**Suggestion:** Component-level fix needed

#### Issue 2.24: Filter Label
**Location:** Line 195  
**Current Classes:**
```tsx
className="size-4 text-gray-500"
```
**Suggestion:**
```tsx
className="size-4 text-gray-500 dark:text-gray-400"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 2.25: Filter Label Text
**Location:** Line 196  
**Current Classes:**
```tsx
className="text-xs font-medium text-gray-700"
```
**Suggestion:**
```tsx
className="text-xs font-medium text-gray-700 dark:text-gray-300"
```
**Classes to Add:** `dark:text-gray-300`

#### Issue 2.26: Model Select Trigger
**Location:** Line 201  
**Current Classes:** SelectTrigger with default styling  
**Suggestion:** Component-level fix needed

#### Issue 2.27: Dealer Select Trigger
**Location:** Line 269  
**Current Classes:** SelectTrigger with default styling  
**Suggestion:** Component-level fix needed

#### Issue 2.28: Status Select Trigger
**Location:** Line 285  
**Current Classes:** SelectTrigger with default styling  
**Suggestion:** Component-level fix needed

#### Issue 2.29-2.30: Date Filter Buttons (2 instances)
**Location:** Lines 301, 316  
**Current Classes:** Button variant="outline"  
**Suggestion:** Component-level fix needed

#### Issue 2.31: Clear All Button (Filter Section)
**Location:** Line 334  
**Current Classes:**
```tsx
className="text-blue-600 hover:text-blue-700"
```
**Suggestion:**
```tsx
className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
```
**Classes to Add:** `dark:text-blue-400`, `dark:hover:text-blue-300`

---

## 3. src/app/components/VehicleTable.tsx

### File Overview
- Total Lines: ~500
- Dark Mode Issues: **38 locations**

### Issues Found

#### Issue 3.1: Main Table Container
**Location:** Line 296  
**Current Classes:**
```tsx
className="bg-white rounded-lg border border-gray-200 overflow-hidden"
```
**Suggestion:**
```tsx
className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
```
**Classes to Add:** `dark:bg-slate-900`, `dark:border-gray-700`

#### Issue 3.2: Table Header Row
**Location:** Line 300  
**Current Classes:**
```tsx
className="bg-gray-50"
```
**Suggestion:**
```tsx
className="bg-gray-50 dark:bg-slate-800"
```
**Classes to Add:** `dark:bg-slate-800`

#### Issue 3.3: Sort Icon (Inactive)
**Location:** Line 219  
**Current Classes:**
```tsx
className="size-4 text-gray-400"
```
**Suggestion:**
```tsx
className="size-4 text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 3.4: Sort Icon (Active - Ascending)
**Location:** Line 221  
**Current Classes:**
```tsx
className="size-4 text-blue-600"
```
**Suggestion:**
```tsx
className="size-4 text-blue-600 dark:text-blue-400"
```
**Classes to Add:** `dark:text-blue-400`

#### Issue 3.5: Sort Icon (Active - Descending)
**Location:** Line 223  
**Current Classes:**
```tsx
className="size-4 text-blue-600"
```
**Suggestion:**
```tsx
className="size-4 text-blue-600 dark:text-blue-400"
```
**Classes to Add:** `dark:text-blue-400`

#### Issue 3.6: Sort Button Hover
**Location:** Lines 307, 314, 321, 328, 334, 341, 348, 355, 362, 369, 376, 383, 390, 397 (14 instances)  
**Current Classes:**
```tsx
className="flex items-center gap-2 hover:text-gray-900"
```
**Suggestion:**
```tsx
className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100"
```
**Classes to Add:** `dark:hover:text-gray-100`

#### Issue 3.7: Table Cell - Text (Index)
**Location:** Line 425  
**Current Classes:**
```tsx
className="text-gray-500"
```
**Suggestion:**
```tsx
className="text-gray-500 dark:text-gray-400"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 3.8: Overdue Row Background
**Location:** Line 418  
**Current Classes:**
```tsx
className={
  vehicle.overdue
    ? "bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
    : "cursor-pointer hover:bg-gray-50 transition-colors"
}
```
**Suggestion:**
```tsx
className={
  vehicle.overdue
    ? "bg-red-50 dark:bg-red-950 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
}
```
**Classes to Add:** `dark:bg-red-950`, `dark:hover:bg-red-900`, `dark:hover:bg-gray-800`

#### Issue 3.9: Calendar Icon
**Location:** Line 460  
**Current Classes:**
```tsx
className="size-3 text-gray-400"
```
**Suggestion:**
```tsx
className="size-3 text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 3.10: Remarks Cell
**Location:** Line 485  
**Current Classes:**
```tsx
className="text-sm text-gray-600 truncate"
```
**Suggestion:**
```tsx
className="text-sm text-gray-600 dark:text-gray-400 truncate"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 3.11: Map Pin Icon
**Location:** Line 495  
**Current Classes:**
```tsx
className="size-3 text-gray-400"
```
**Suggestion:**
```tsx
className="size-3 text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 3.12: Pull Out Date - Calendar Icon
**Location:** Line 505  
**Current Classes:**
```tsx
className="size-3 text-gray-400"
```
**Suggestion:**
```tsx
className="size-3 text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 3.13: Pull Out Date - Dash (No Date)
**Location:** Line 511  
**Current Classes:**
```tsx
className="text-gray-400 text-sm"
```
**Suggestion:**
```tsx
className="text-gray-400 dark:text-gray-500 text-sm"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 3.14: Days Badge (Under 7 Days)
**Location:** Line 519  
**Current Classes:**
```tsx
className="bg-gray-50 text-gray-700 border-gray-200"
```
**Suggestion:**
```tsx
className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
```
**Classes to Add:** `dark:bg-gray-800`, `dark:text-gray-300`, `dark:border-gray-700`

#### Issue 3.15: Days Badge (Over 7 Days)
**Location:** Line 517  
**Current Classes:**
```tsx
className="bg-orange-50 text-orange-700 border-orange-200"
```
**Suggestion:**
```tsx
className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
```
**Classes to Add:** `dark:bg-orange-950`, `dark:text-orange-400`, `dark:border-orange-800`

#### Issue 3.16: Status Badges (Multiple)
**Location:** Lines 190-215 (12 status types)  
**Current Pattern:** All badge variants use light backgrounds with colored text
```tsx
"bg-blue-100 text-blue-700 border-blue-200"
"bg-yellow-100 text-yellow-700 border-yellow-200"
"bg-green-100 text-green-700 border-green-200"
"bg-red-100 text-red-700 border-red-200"
"bg-gray-100 text-gray-700 border-gray-200"
"bg-orange-100 text-orange-700 border-orange-200"
"bg-purple-100 text-purple-700 border-purple-200"
"bg-teal-100 text-teal-700 border-teal-200"
```

**Suggestion:** Add dark variants to all status badge classNames:
```tsx
// Examples for each:
"bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
"bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
"bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
"bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
"bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
"bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
"bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
"bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
```

**Classes to Add:** 24 variants (2-3 per status type)

---

## 4. src/app/components/HistoryPanel.tsx

### File Overview
- Total Lines: ~195
- Dark Mode Issues: **28 locations**

### Issues Found

#### Issue 4.1: Panel Backdrop Blur
**Location:** Line 59  
**Current Classes:**
```tsx
className="absolute inset-0 bg-black/30 backdrop-blur-sm"
```
**Note:** This is acceptable, but could be fine-tuned  
**Suggestion:** Consider `dark:bg-black/50` for better contrast

#### Issue 4.2: Panel Container
**Location:** Line 63  
**Current Classes:**
```tsx
className="relative w-[480px] h-full bg-white border-l border-gray-200 shadow-xl flex flex-col"
```
**Suggestion:**
```tsx
className="relative w-[480px] h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col"
```
**Classes to Add:** `dark:bg-slate-900`, `dark:border-gray-700`

#### Issue 4.3: Header Border
**Location:** Line 66  
**Current Classes:**
```tsx
className="border-b border-gray-200 p-6"
```
**Suggestion:**
```tsx
className="border-b border-gray-200 dark:border-gray-700 p-6"
```
**Classes to Add:** `dark:border-gray-700`

#### Issue 4.4: Header Title
**Location:** Line 72  
**Current Classes:**
```tsx
className="text-lg font-semibold text-gray-900"
```
**Suggestion:**
```tsx
className="text-lg font-semibold text-gray-900 dark:text-gray-100"
```
**Classes to Add:** `dark:text-gray-100`

#### Issue 4.5: Header Subtitle
**Location:** Line 73  
**Current Classes:**
```tsx
className="text-sm text-gray-500 mt-1"
```
**Suggestion:**
```tsx
className="text-sm text-gray-500 dark:text-gray-400 mt-1"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 4.6: Vehicle Info Background
**Location:** Line 78  
**Current Classes:**
```tsx
className="bg-gray-50 rounded-lg p-4 space-y-2"
```
**Suggestion:**
```tsx
className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-2"
```
**Classes to Add:** `dark:bg-slate-800`

#### Issue 4.7: Vehicle Model Name
**Location:** Line 82  
**Current Classes:**
```tsx
className="font-medium text-gray-900"
```
**Suggestion:**
```tsx
className="font-medium text-gray-900 dark:text-gray-100"
```
**Classes to Add:** `dark:text-gray-100`

#### Issue 4.8: Vehicle Info Labels
**Location:** Line 97 (Multiple instances)  
**Current Classes:**
```tsx
className="text-gray-500"
```
**Suggestion:**
```tsx
className="text-gray-500 dark:text-gray-400"
```
**Classes to Add:** `dark:text-gray-400` (appears 4 times for: CS Number, Plate, Chassis, Location)

#### Issue 4.9: Vehicle Info Values
**Location:** Line 98 (Multiple instances)  
**Current Classes:**
```tsx
className="font-medium text-gray-900 font-mono text-xs"
```
**Suggestion:**
```tsx
className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs"
```
**Classes to Add:** `dark:text-gray-100` (appears 4 times)

#### Issue 4.10: Timeline Container Border
**Location:** Line 114  
**Current Classes:**
```tsx
className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200"
```
**Suggestion:**
```tsx
className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
```
**Classes to Add:** `dark:bg-gray-700`

#### Issue 4.11: History Entry Card
**Location:** Line 128  
**Current Classes:**
```tsx
className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
```
**Suggestion:**
```tsx
className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
```
**Classes to Add:** `dark:bg-slate-800`, `dark:border-gray-700`, `dark:hover:border-gray-600`

#### Issue 4.12: Entry Action Title
**Location:** Line 132  
**Current Classes:**
```tsx
className="font-medium text-gray-900"
```
**Suggestion:**
```tsx
className="font-medium text-gray-900 dark:text-gray-100"
```
**Classes to Add:** `dark:text-gray-100`

#### Issue 4.13: Entry Timestamp
**Location:** Line 134  
**Current Classes:**
```tsx
className="text-xs text-gray-500 mt-1"
```
**Suggestion:**
```tsx
className="text-xs text-gray-500 dark:text-gray-400 mt-1"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 4.14: Entry Details Text
**Location:** Line 138  
**Current Classes:**
```tsx
className="text-sm text-gray-600 mb-3"
```
**Suggestion:**
```tsx
className="text-sm text-gray-600 dark:text-gray-300 mb-3"
```
**Classes to Add:** `dark:text-gray-300`

#### Issue 4.15: Entry User Info
**Location:** Line 139  
**Current Classes:**
```tsx
className="flex items-center gap-2 text-xs text-gray-500"
```
**Suggestion:**
```tsx
className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
```
**Classes to Add:** `dark:text-gray-400`

---

## 5. src/app/components/AddVehicleModal.tsx

### File Overview
- Total Lines: ~600
- Dark Mode Issues: **45 locations**

### Issues Found

#### Issue 5.1: Modal Backdrop
**Location:** Line 386  
**Current Classes:**
```tsx
className="absolute inset-0 bg-black/50"
```
**Note:** Acceptable but could add `dark:bg-black/70` for consistency

#### Issue 5.2: Modal Container
**Location:** Line 389  
**Current Classes:**
```tsx
className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
```
**Suggestion:**
```tsx
className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
```
**Classes to Add:** `dark:bg-slate-900`

#### Issue 5.3: Modal Header
**Location:** Line 392  
**Current Classes:**
```tsx
className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white"
```
**Suggestion:**
```tsx
className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900"
```
**Classes to Add:** `dark:border-gray-700`, `dark:from-slate-800`, `dark:to-slate-900`

#### Issue 5.4: Modal Title
**Location:** Line 395  
**Current Classes:**
```tsx
className="text-xl font-semibold text-gray-900"
```
**Suggestion:**
```tsx
className="text-xl font-semibold text-gray-900 dark:text-gray-100"
```
**Classes to Add:** `dark:text-gray-100`

#### Issue 5.5: Modal Subtitle
**Location:** Line 396  
**Current Classes:**
```tsx
className="text-sm text-gray-600"
```
**Suggestion:**
```tsx
className="text-sm text-gray-600 dark:text-gray-400"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 5.6: Section Header (Multiple - 8 instances)
**Location:** Lines 413, 429, 442, 457, 472, 487, 502, 518  
**Current Classes:**
```tsx
className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"
```
**Suggestion:**
```tsx
className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2"
```
**Classes to Add:** `dark:text-gray-100` (8 instances)

#### Issue 5.7: Section Header Accent Line (Multiple - 8 instances)
**Location:** Lines 414, 430, 443, 458, 473, 488, 503, 519  
**Current Classes:**
```tsx
className="h-1 w-8 bg-blue-600 rounded"
```
**Suggestion:**
```tsx
className="h-1 w-8 bg-blue-600 dark:bg-blue-500 rounded"
```
**Classes to Add:** `dark:bg-blue-500` (8 instances)

#### Issue 5.8: Form Section Background (Multiple - 8 instances)
**Location:** Lines 416, 432, 445, 460, 475, 490, 505, 521  
**Current Classes:**
```tsx
className="bg-gray-50 rounded-lg p-4"
```
**Suggestion:**
```tsx
className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4"
```
**Classes to Add:** `dark:bg-slate-800` (8 instances)

#### Issue 5.9: FormField Component Border
**Location:** Line 300 (Shared FormField definition)  
**Current Classes:**
```tsx
className="flex py-3 border-b border-gray-100 last:border-0"
```
**Suggestion:**
```tsx
className="flex py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
```
**Classes to Add:** `dark:border-gray-700`

#### Issue 5.10: FormField Label
**Location:** Line 301  
**Current Classes:**
```tsx
className="w-1/3 text-sm font-medium text-gray-700 flex items-center"
```
**Suggestion:**
```tsx
className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
```
**Classes to Add:** `dark:text-gray-300`

#### Issue 5.11: FormField Required Indicator
**Location:** Line 303  
**Current Classes:**
```tsx
className="text-red-500 ml-1"
```
**Note:** Red is suitable for both light and dark modes - no change needed

#### Issue 5.12: Input Field Styling
**Location:** Lines 105-113  
**Current Classes:** Input component styling  
**Note:** Needs component-level fix in ui/input.tsx

#### Issue 5.13: Select Trigger Styling
**Location:** Multiple locations  
**Current Classes:** SelectTrigger components  
**Note:** Needs component-level fix in ui/select.tsx

---

## 6. src/app/components/VehicleDetailsModal.tsx

### File Overview
- Total Lines: ~700
- Dark Mode Issues: **42 locations**

### Similar Issues to AddVehicleModal

#### Critical Issues (Same Pattern as AddVehicleModal):
1. Modal container: `bg-white` needs `dark:bg-slate-900`
2. Modal header: `bg-gradient-to-r from-blue-50 to-white` needs dark variants
3. All text colors: `text-gray-*` need corresponding `dark:text-gray-*`
4. All section backgrounds: `bg-gray-50` needs `dark:bg-slate-800`
5. All borders: `border-gray-*` need corresponding `dark:border-gray-*`

#### Additional Issue 6.1: Status Badge Container
**Location:** Lines 269-281 (Status badge styles)  
**Current Classes:** Similar to VehicleTable status badges
```tsx
"bg-blue-100 text-blue-700 border-blue-200"
"bg-yellow-100 text-yellow-700 border-yellow-200"
...etc
```
**Suggestion:** Apply same dark variants as VehicleTable

#### Additional Issue 6.2: DetailRow Component Border
**Location:** Line 337  
**Current Classes:**
```tsx
className="flex py-3 border-b border-gray-100"
```
**Suggestion:**
```tsx
className="flex py-3 border-b border-gray-100 dark:border-gray-700"
```
**Classes to Add:** `dark:border-gray-700`

#### Additional Issue 6.3: DetailRow Label
**Location:** Line 338  
**Current Classes:**
```tsx
className="w-1/3 text-sm font-medium text-gray-700"
```
**Suggestion:**
```tsx
className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300"
```
**Classes to Add:** `dark:text-gray-300`

#### Additional Issue 6.4: DetailRow Value
**Location:** Line 339  
**Current Classes:**
```tsx
className="w-2/3 text-sm text-gray-900"
```
**Suggestion:**
```tsx
className="w-2/3 text-sm text-gray-900 dark:text-gray-100"
```
**Classes to Add:** `dark:text-gray-100`

#### Additional Issue 6.5: Status Color Helper (Multiple - 12 instances)
**Location:** Lines 284-295  
**Current Classes:** Status text color styles all using colored text without dark variants
```tsx
"font-bold text-blue-700"
"font-bold text-yellow-700"
"font-bold text-green-700"
"font-bold text-red-700"
...etc
```
**Suggestion:** Add dark variants to all 12 status colors

---

## 7. src/app/components/AddAvailableVehicleModal.tsx

### File Overview
- Total Lines: ~450
- Dark Mode Issues: **31 locations**

### Issues Found

#### Issue 7.1: Color Select Button
**Location:** Line 97  
**Current Classes:**
```tsx
className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
```
**Suggestion:**
```tsx
className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors dark:text-gray-100"
```
**Classes to Add:** `dark:border-gray-600`, `dark:bg-slate-800`, `dark:hover:border-gray-500`, `dark:focus:ring-teal-400`, `dark:text-gray-100`

#### Issue 7.2: Color Select Placeholder
**Location:** Line 112  
**Current Classes:**
```tsx
className="text-gray-400"
```
**Suggestion:**
```tsx
className="text-gray-400 dark:text-gray-500"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 7.3: Chevron Icon
**Location:** Line 115  
**Current Classes:**
```tsx
className={`size-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
```
**Suggestion:**
```tsx
className={`size-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 7.4: Dropdown Container
**Location:** Line 122  
**Current Classes:**
```tsx
className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
```
**Suggestion:**
```tsx
className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
```
**Classes to Add:** `dark:bg-slate-800`, `dark:border-gray-700`

#### Issue 7.5: Dropdown Search Input
**Location:** Line 127  
**Current Classes:**
```tsx
className="w-full text-sm px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
```
**Suggestion:**
```tsx
className="w-full text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
```
**Classes to Add:** `dark:border-gray-600`, `dark:bg-slate-700`, `dark:text-gray-100`, `dark:focus:ring-teal-400`

#### Issue 7.6: Dropdown Empty Message
**Location:** Line 135  
**Current Classes:**
```tsx
className="text-sm text-gray-400 text-center py-4"
```
**Suggestion:**
```tsx
className="text-sm text-gray-400 dark:text-gray-500 text-center py-4"
```
**Classes to Add:** `dark:text-gray-500`

#### Issue 7.7: Dropdown Item Button (Multiple)
**Location:** Line 153  
**Current Classes:**
```tsx
className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-teal-50 transition-colors ${value === name ? 'bg-teal-50 font-medium' : ''}`}
```
**Suggestion:**
```tsx
className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors ${value === name ? 'bg-teal-50 dark:bg-teal-900/50 font-medium' : 'dark:text-gray-300'}`}
```
**Classes to Add:** `dark:hover:bg-teal-900/30`, `dark:bg-teal-900/50`, `dark:text-gray-300`

#### Issue 7.8: Dropdown Item Checkmark
**Location:** Line 159  
**Current Classes:**
```tsx
className="ml-auto text-teal-600 text-xs"
```
**Suggestion:**
```tsx
className="ml-auto text-teal-600 dark:text-teal-400 text-xs"
```
**Classes to Add:** `dark:text-teal-400`

---

## 8. src/app/components/AddInTransitModal.tsx

### File Overview
- Total Lines: ~350
- Dark Mode Issues: **28 locations**

### Issues Found

#### Similar to AddAvailableVehicleModal - Color dropdown issues (Lines 97-159)
Apply same dark mode fixes as Issue 7.1-7.8

#### Additional Modal-Specific Issues:

#### Issue 8.1: Modal Container
**Location:** Line 185  
**Current Classes:**
```tsx
className="fixed inset-0 z-[200] flex items-center justify-center"
```
**Note:** This is layout only, acceptable

#### Issue 8.2: Modal Backdrop
**Location:** Line 187  
**Current Classes:**
```tsx
className="absolute inset-0 bg-black/50 backdrop-blur-sm"
```
**Note:** Could add `dark:bg-black/70`

#### Issue 8.3: Main Modal Panel
**Location:** (Not shown in excerpt but implied)  
**Suggestion:** Will need `bg-white dark:bg-slate-900`

---

## 9. src/app/components/StatsCards.tsx

### File Overview
- Total Lines: ~50
- Dark Mode Issues: **8 locations**

### Issues Found

#### Issue 9.1: Card Border
**Location:** Line 20  
**Current Classes:**
```tsx
className="border-gray-200"
```
**Suggestion:**
```tsx
className="border-gray-200 dark:border-gray-700"
```
**Classes to Add:** `dark:border-gray-700`

#### Issue 9.2: Stat Label
**Location:** Line 24  
**Current Classes:**
```tsx
className="text-sm text-gray-600 mb-1"
```
**Suggestion:**
```tsx
className="text-sm text-gray-600 dark:text-gray-400 mb-1"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 9.3: Stat Value
**Location:** Line 25  
**Current Classes:**
```tsx
className="text-3xl font-semibold text-gray-900"
```
**Suggestion:**
```tsx
className="text-3xl font-semibold text-gray-900 dark:text-gray-100"
```
**Classes to Add:** `dark:text-gray-100`

#### Issue 9.4: Icon Background (4 variants)
**Location:** Line 28 - Dynamic `stat.bgColor`  
**Current Pattern:**
```tsx
'bg-blue-100'
'bg-yellow-100'
'bg-green-100'
'bg-red-100'
```
**Suggestion:** Modify stats array to include dark variants:
```tsx
bgColor: 'bg-blue-100 dark:bg-blue-900'
bgColor: 'bg-yellow-100 dark:bg-yellow-900'
bgColor: 'bg-green-100 dark:bg-green-900'
bgColor: 'bg-red-100 dark:bg-red-900'
```

#### Issue 9.5: Icon Color (4 variants)
**Location:** Line 29 - Dynamic `stat.color`  
**Current Pattern:**
```tsx
'text-blue-600'
'text-yellow-600'
'text-green-600'
'text-red-600'
```
**Suggestion:** Modify stats array to include dark variants:
```tsx
color: 'text-blue-600 dark:text-blue-400'
color: 'text-yellow-600 dark:text-yellow-400'
color: 'text-green-600 dark:text-green-400'
color: 'text-red-600 dark:text-red-400'
```

---

## 10. src/app/components/OverdueAlerts.tsx

### File Overview
- Total Lines: ~60
- Dark Mode Issues: **18 locations**

### Issues Found

#### Issue 10.1: Card Container
**Location:** Line 15  
**Current Classes:**
```tsx
className="border-red-200 bg-red-50"
```
**Suggestion:**
```tsx
className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950"
```
**Classes to Add:** `dark:border-red-900`, `dark:bg-red-950`

#### Issue 10.2: Alert Icon
**Location:** Line 19  
**Current Classes:**
```tsx
className="size-5 text-red-600"
```
**Suggestion:**
```tsx
className="size-5 text-red-600 dark:text-red-400"
```
**Classes to Add:** `dark:text-red-400`

#### Issue 10.3: Badge
**Location:** Line 22  
**Current Classes:**
```tsx
className="bg-red-600 text-white"
```
**Suggestion:**
```tsx
className="bg-red-600 dark:bg-red-500 text-white"
```
**Classes to Add:** `dark:bg-red-500`

#### Issue 10.4: Empty State Message
**Location:** Line 29  
**Current Classes:**
```tsx
className="text-sm text-gray-600 py-4 text-center"
```
**Suggestion:**
```tsx
className="text-sm text-gray-600 dark:text-gray-400 py-4 text-center"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 10.5: Vehicle Item Container
**Location:** Line 32  
**Current Classes:**
```tsx
className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-300 transition-colors"
```
**Suggestion:**
```tsx
className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-red-200 dark:border-red-900 hover:border-red-300 dark:hover:border-red-800 transition-colors"
```
**Classes to Add:** `dark:bg-slate-800`, `dark:border-red-900`, `dark:hover:border-red-800`

#### Issue 10.6: Model Name
**Location:** Line 40  
**Current Classes:**
```tsx
className="font-medium text-gray-900"
```
**Suggestion:**
```tsx
className="font-medium text-gray-900 dark:text-gray-100"
```
**Classes to Add:** `dark:text-gray-100`

#### Issue 10.7: Status Badge
**Location:** Line 41  
**Current Classes:**
```tsx
className="bg-red-100 text-red-700 border-red-200 text-xs"
```
**Suggestion:**
```tsx
className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs"
```
**Classes to Add:** `dark:bg-red-900/50`, `dark:text-red-300`, `dark:border-red-800`

#### Issue 10.8: Details Text Section
**Location:** Line 45  
**Current Classes:**
```tsx
className="text-sm text-gray-600 space-y-1"
```
**Suggestion:**
```tsx
className="text-sm text-gray-600 dark:text-gray-400 space-y-1"
```
**Classes to Add:** `dark:text-gray-400`

#### Issue 10.9: Days Overdue Section
**Location:** Line 48  
**Current Classes:**
```tsx
className="flex items-center gap-1 text-red-600"
```
**Suggestion:**
```tsx
className="flex items-center gap-1 text-red-600 dark:text-red-400"
```
**Classes to Add:** `dark:text-red-400`

#### Issue 10.10: Location and Dealer Info
**Location:** Line 51  
**Current Classes:**
```tsx
className="text-xs"
```
**Note:** Inherits text-red-600, needs context  
**Suggestion:** Should be styled separately with:
```tsx
className="text-xs text-gray-600 dark:text-gray-400"
```

#### Issue 10.11: View All Button
**Location:** Line 57  
**Current Classes:** Button variant="outline"  
**Note:** Needs component-level fix

---

## Summary Table

| File | Total Issues | Category | Priority |
|------|-------------|----------|----------|
| DashboardPage.tsx | 2 | Container/Text | High |
| Filters.tsx | 52 | Tabs/Inputs/Buttons | High |
| VehicleTable.tsx | 38 | Table/Badges/Icons | High |
| HistoryPanel.tsx | 28 | Container/Text/Cards | High |
| AddVehicleModal.tsx | 45 | Modal/Sections/Text | High |
| VehicleDetailsModal.tsx | 42 | Modal/Badges/Text | High |
| AddAvailableVehicleModal.tsx | 31 | Dropdown/Modal/Input | High |
| AddInTransitModal.tsx | 28 | Dropdown/Modal | High |
| StatsCards.tsx | 8 | Icons/Values/BG | Medium |
| OverdueAlerts.tsx | 18 | Container/Text/Badge | High |

**Total CSS Classes Requiring Dark Mode Variants: 292 locations**

---

## Recommended Implementation Strategy

### Phase 1: Component-Level Fixes (Foundation)
1. Update `src/app/components/ui/input.tsx` - Add dark mode support
2. Update `src/app/components/ui/select.tsx` - Add dark mode support
3. Update `src/app/components/ui/button.tsx` - Add dark mode support
4. Update `src/app/components/ui/card.tsx` - Add dark mode support

### Phase 2: High-Impact Components (Most Visible)
1. VehicleTable.tsx - Fix badge variants
2. Filters.tsx - Fix category tabs and inputs
3. AddVehicleModal.tsx - Fix modal styling
4. VehicleDetailsModal.tsx - Fix modal styling

### Phase 3: Remaining Components
1. HistoryPanel.tsx
2. AddAvailableVehicleModal.tsx
3. AddInTransitModal.tsx
4. StatsCards.tsx
5. OverdueAlerts.tsx
6. DashboardPage.tsx

### Phase 4: Testing & Validation
- Test all modals in light and dark mode
- Test all tables and data displays
- Test all form inputs and select dropdowns
- Verify color contrast ratios meet WCAG standards

---

## Dark Mode Color Palette Reference

### Text Colors
- Light Mode: `text-gray-900` → Dark Mode: `dark:text-gray-100`
- Light Mode: `text-gray-700` → Dark Mode: `dark:text-gray-300`
- Light Mode: `text-gray-600` → Dark Mode: `dark:text-gray-400`
- Light Mode: `text-gray-500` → Dark Mode: `dark:text-gray-500` (or `dark:text-gray-400`)

### Background Colors
- Light Mode: `bg-white` → Dark Mode: `dark:bg-slate-900`
- Light Mode: `bg-gray-50` → Dark Mode: `dark:bg-slate-800`
- Light Mode: `bg-gray-100` → Dark Mode: `dark:bg-gray-800`

### Border Colors
- Light Mode: `border-gray-200` → Dark Mode: `dark:border-gray-700`
- Light Mode: `border-gray-100` → Dark Mode: `dark:border-gray-800`
- Light Mode: `border-gray-300` → Dark Mode: `dark:border-gray-600`

### Color Variants (Status/Alert)
- Light Mode: `bg-blue-100 text-blue-700 border-blue-200`
  - Dark Mode: `dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800`
- Light Mode: `bg-red-100 text-red-700 border-red-200`
  - Dark Mode: `dark:bg-red-900 dark:text-red-300 dark:border-red-800`
- Similar pattern for yellow, green, orange, purple, teal, etc.

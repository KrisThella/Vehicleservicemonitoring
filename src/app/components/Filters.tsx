import { useState } from 'react';
import { Search, Filter, Calendar as CalendarIcon, Download, RefreshCw, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedModel: string;
  onModelChange: (value: string) => void;
  selectedDealer: string;
  onDealerChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  dateFrom: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  onDateToChange: (date: Date | undefined) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export function Filters({
  searchTerm,
  onSearchChange,
  selectedModel,
  onModelChange,
  selectedDealer,
  onDealerChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onRefresh,
  onExport,
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasActiveFilters = selectedModel !== 'all' || selectedDealer !== 'all' || selectedStatus !== 'all' || !!dateFrom || !!dateTo || !!searchTerm;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Collapsible Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          <SlidersHorizontal className="size-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500" />
          <span>Filters & Search</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center size-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {[selectedModel !== 'all', selectedDealer !== 'all', selectedStatus !== 'all', !!dateFrom, !!dateTo, !!searchTerm].filter(Boolean).length}
            </span>
          )}
          {isExpanded
            ? <ChevronUp className="size-4 text-gray-400 dark:text-gray-500" />
            : <ChevronDown className="size-4 text-gray-400 dark:text-gray-500" />}
        </button>

        {/* Always-visible compact search when collapsed */}
        {!isExpanded && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Quick search..."
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onSearchChange('');
                  onModelChange('all');
                  onDealerChange('all');
                  onStatusChange('all');
                  onDateFromChange(undefined);
                  onDateToChange(undefined);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-3 py-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Inventory
            </button>
            <button
              onClick={() => onCategoryChange('DEMO')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'DEMO'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => onCategoryChange('SALES')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'SALES'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Sales
            </button>
            
            <button
              onClick={() => onCategoryChange('AVAILABLE')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'AVAILABLE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => onCategoryChange('IN TRANSIT')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'IN TRANSIT'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => onCategoryChange('PULL OUT MONITORING')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'PULL OUT MONITORING'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Pull Out Monitoring
            </button>
          </div>

          {/* Search and Quick Actions */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by CS Number, Plate Number, Chassis, or Dealer..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            {/* Model Filter */}
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="APV 1.6 GA MT">APV 1.6 GA MT</SelectItem>
                <SelectItem value="APV 1.6 GLX MT">APV 1.6 GLX MT</SelectItem>
                <SelectItem value="CARRY CAB & CHASSIS">CARRY CAB & CHASSIS</SelectItem>
                <SelectItem value="CARRY CARGO VAN">CARRY CARGO VAN</SelectItem>
                <SelectItem value="CARRY DROPSIDE">CARRY DROPSIDE</SelectItem>
                <SelectItem value="CARRY LINEMAN'S VEHICLE">CARRY LINEMAN'S VEHICLE</SelectItem>
                <SelectItem value="CARRY UTILITY VAN">CARRY UTILITY VAN</SelectItem>
                <SelectItem value="CELERIO GL AGS">CELERIO GL AGS</SelectItem>
                <SelectItem value="DZIRE GL CVT - HYBRID">DZIRE GL CVT - HYBRID</SelectItem>
                <SelectItem value="DZIRE GLX CVT - HYBRID">DZIRE GLX CVT - HYBRID</SelectItem>
                <SelectItem value="ERTIGA 1.5 GA MT">ERTIGA 1.5 GA MT</SelectItem>
                <SelectItem value="ERTIGA 1.5 GA MT - HYBRID">ERTIGA 1.5 GA MT - HYBRID</SelectItem>
                <SelectItem value="ERTIGA 1.5 GL MT - HYBRID">ERTIGA 1.5 GL MT - HYBRID</SelectItem>
                <SelectItem value="ERTIGA 1.5 GL AT - HYBRID">ERTIGA 1.5 GL AT - HYBRID</SelectItem>
                <SelectItem value="ERTIGA 1.5 GLX AT - HYBRID">ERTIGA 1.5 GLX AT - HYBRID</SelectItem>
                <SelectItem value="JIMNY 1.5 GL MT SS">JIMNY 1.5 GL MT SS</SelectItem>
                <SelectItem value="JIMNY 1.5 GLX AT (MONOTONE) SS">JIMNY 1.5 GLX AT (MONOTONE) SS</SelectItem>
                <SelectItem value="JIMNY 1.5 GLX AT (TWO-TONE) SS">JIMNY 1.5 GLX AT (TWO-TONE) SS</SelectItem>
                <SelectItem value="JIMNY 1.5 5DR GL AT (MONOTONE)">JIMNY 1.5 5DR GL MT</SelectItem>
                <SelectItem value="JIMNY 1.5 5DR GLX AT (TWO-TONE)">JIMNY 1.5 5DR GLX AT (TWO-TONE)</SelectItem>
                <SelectItem value="JIMNY 3GLX AT R">JIMNY 3GLX AT R</SelectItem>
                <SelectItem value="JIMNY 5DR GLX AT R - (MONOTONE)">JIMNY 5DR GLX AT R - (MONOTONE) </SelectItem>
                <SelectItem value="JIMNY 5DR GLX AT R - (TWO-TONE)">JIMNY 5DR GLX AT R - (TWO-TONE)</SelectItem>       
                <SelectItem value="S-PRESSO 1.0 GL AGS">S-PRESSO 1.0 GL AGS</SelectItem>
                <SelectItem value="S-PRESSO 1.0 GL MT">S-PRESSO 1.0 GL MT</SelectItem>
                <SelectItem value="SWIFT 1.2 GL CVT">SWIFT 1.2 GL CVT</SelectItem>
                <SelectItem value="XL7 1.5 GLX AT - HYBRID (MONOTONE)">XL7 1.5 GLX AT - HYBRID (MONOTONE)</SelectItem>
                <SelectItem value="XL7 1.5 GLX AT - HYBRID (TWO-TONE)">XL7 1.5 GLX MT - HYBRID (TWO-TONE)</SelectItem>
                <SelectItem value="XL7 1.5 GLX AT - HYBRID BLACK EDITION">XL7 1.5 GLX AT - HYBRID BLACK EDITION</SelectItem>
                <SelectItem value="XL7 1.5 GLX AT - HYBRID (TWO-TONE) BLACK EDITION">XL7 1.5 GLX MT - HYBRID (TWO-TONE) BLACK EDITION</SelectItem>
              </SelectContent>
            </Select>

            {/* Dealer Filter */}
            <Select value={selectedDealer} onValueChange={onDealerChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Dealers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dealers</SelectItem>
                <SelectItem value="TEAM JM">TEAM JM</SelectItem>
                <SelectItem value="TEAM AARON">TEAM AARON</SelectItem>
                <SelectItem value="TEAM JAY-R">TEAM JAY-R</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="On Process">On Process</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="HELD">HELD</SelectItem>
                <SelectItem value="SOLD">SOLD</SelectItem>
                <SelectItem value="PAID WITH LTO">PAID WITH LTO</SelectItem>
                <SelectItem value="FOR LTO PROCESSING">FOR LTO PROCESSING</SelectItem>
                <SelectItem value="ON HOLD">ON HOLD</SelectItem>
                <SelectItem value="ON TRACK">ON TRACK</SelectItem>
                <SelectItem value="IN TRANSIT">IN TRANSIT</SelectItem>
                <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[130px] justify-start">
                  <CalendarIcon className="size-3 mr-2" />
                  {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'Date From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={onDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Date To Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[130px] justify-start">
                  <CalendarIcon className="size-3 mr-2" />
                  {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'Date To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={onDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(selectedModel !== 'all' || selectedDealer !== 'all' || selectedStatus !== 'all' || dateFrom || dateTo || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange('');
                  onModelChange('all');
                  onDealerChange('all');
                  onStatusChange('all');
                  onDateFromChange(undefined);
                  onDateToChange(undefined);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
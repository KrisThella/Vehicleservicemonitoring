import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { X, Edit2, Save, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { VehicleData } from "./VehicleTable";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { getColorHex, colorHexMap } from "./utils/colorMapping";
import { useAllocationTables, useColors, useModelColors, usePrices, type ColorRecord } from "../../lib/api";
import { toast } from "sonner";

interface VehicleDetailsModalProps {
  vehicle: VehicleData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedVehicle: VehicleData) => void;
}

// Model options
const MODEL_OPTIONS = [
  "APV 1.6 GA MT",
  "APV 1.6 GLX MT",
  "CARRY CAB & CHASSIS",
  "CARRY CARGO VAN",
  "CARRY DROPSIDE",
  "CARRY LINEMAN'S VEHICLE",
  "CARRY UTILITY VAN",
  "CELERIO 1.0 GL AGS",
  "DZIRE GL CVT - HYBRID",
  "DZIRE GLX CVT - HYBRID",
  "ERTIGA 1.5 GA MT - HYBRID",
  "ERTIGA 1.5 GL MT - HYBRID",
  "ERTIGA 1.5 GL AT - HYBRID",
  "ERTIGA 1.5 GLX AT - HYBRID",
  "JIMNY 1.5 GL MT SS",
  "JIMNY 1.5 GLX AT (MONOTONE) SS",
  "JIMNY 1.5 GLX AT (TWO-TONE) SS",
  "JIMNY 1.5 5DR GL MT",
  "JIMNY 1.5 5DR GLX AT (MONOTONE)",
  "JIMNY 1.5 5DR GLX AT (TWO-TONE)",
  "JIMNY 3GLX AT R",
  "JIMNY 5DR GLX AT R - (MONOTONE)",
  "S-PRESSO 1.0 GL MT",
  "S-PRESSO 1.0 GL AGS",
  "SWIFT 1.2 GL CVT",
  "XL7 1.5 GLX AT - HYBRID MONOTONE",
  "XL7 1.5 GLX AT - HYBRID (TWO-TONE)",
  "XL7 1.5 GLX AT - HYBRID BLACK EDITION",
  "XL7 1.5 GLX AT - HYBRID (TWO-TONE) BLACK EDITION",
];

const DEALER_OPTIONS = ["BIÑAN"];
const STATUS_OPTIONS: VehicleData["status"][] = [
  "On Process",
  "Pending",
  "Completed",
  "Overdue",
  "HELD",
  "SOLD",
  "PAID WITH LTO",
  "FOR LTO PROCESSING",
  "ON HOLD",
  "ON TRACK",
  "IN TRANSIT",
];
const LOCATION_OPTIONS = [
  "CLIENT DELIVERED",
  "IN TRANSIT",
  "HELD - ALLOCATION",
];
const SALES_CONSULTANT_OPTIONS = [
  "ABANTO, JENNIFER A.",
  "ALMACEN, MA.ISSAC ANNE",
  "ALMONTE, JAISTLE",
  "ALONTE, NERISSA",
  "ALBAN0, RHIAN IRISH",
  "CARAMAY, CARNATION",
  "BAJEN, JOHN LESTER LEGASTO",
  "CASAMINA, JUSTIN LORENZ C.",
  "CASTILLO, JAARON ALBERT D.",
  "CERVANTES, ELLA MARIE",
  "CORDERO, ANGELICA E.",
  "DUAT, MARLOU",
  "FONACIER, APRIL R.",
  "GALLANO, SHIRLY",
  "MALLARI, MARILYN",
  "MANZANO, ROCKY R.",
  "MARANAN, SALVE MAY CHRISTY J.",
  "MONDEJAR, JESSA MAE",
  "MONTAÑA, JERISHE",
  "PERA, REGINA O.",
  "PUNZALAN, ARNEL ADRIAN DIZON",
  "SARMIENTO, KAREN L.",
  "STA. MARIA, THELMA C.",
  "VIZCARRA, JELLY ANN L.",
];
const GENERAL_MANAGER_OPTIONS = [
  "MR. AARON QUIROGA",
  "MR. NESTOR MATEO SENARIO JR.",
  "MR. ROGELIO MENDOZA JR.",
];
const BANK_OPTIONS = [
  "BANK OF THE PHILIPPINE ISLANDS (BPI)",
  "EASTWEST BANK (EWB)",
  "MAYBANK (MBI)",
  "PHILIPPINE SAVINGS BANK (PSB)",
  "BANCO DE ORO UNIBANK, INC. (BDO)",
  "RIZAL COMMERCIAL BANKING CORPORATION (RCBC)",
  "CHINA BANK SAVINGS(CBS)",
  "UCPB LEASING AND MANAGEMENT SERVICES CORPORATION (ULMS)",
  "SECURITY BANK CORPORATION (SBC)",
  "LUZON DEVELOPMENT BANK (LDB)",
  "BANK OF COMMERCE (BOC)",
  "METRO BANK (MB)",
];

const STATUS_VARIANTS: Record<
  string,
  { badgeClassName: string; textClassName: string }
> = {
  "On Process": {
    badgeClassName: "bg-blue-100 text-blue-700 border-blue-200",
    textClassName: "font-bold text-blue-700",
  },
  Pending: {
    badgeClassName: "bg-yellow-100 text-yellow-700 border-yellow-200",
    textClassName: "font-bold text-yellow-700",
  },
  Completed: {
    badgeClassName: "bg-green-100 text-green-700 border-green-200",
    textClassName: "font-bold text-green-700",
  },
  Overdue: {
    badgeClassName: "bg-red-100 text-red-700 border-red-200",
    textClassName: "font-bold text-red-700",
  },
  HELD: {
    badgeClassName: "bg-gray-100 text-gray-700 border-gray-200",
    textClassName: "font-bold text-gray-700",
  },
  SOLD: {
    badgeClassName: "bg-green-100 text-green-700 border-green-200",
    textClassName: "font-bold text-green-700",
  },
  "PAID WITH LTO": {
    badgeClassName: "bg-blue-100 text-blue-700 border-blue-200",
    textClassName: "font-bold text-blue-700",
  },
  "FOR LTO PROCESSING": {
    badgeClassName: "bg-orange-100 text-orange-700 border-orange-200",
    textClassName: "font-bold text-orange-700",
  },
  "ON HOLD": {
    badgeClassName: "bg-gray-100 text-green-700 border-gray-200",
    textClassName: "font-bold text-yellow-700",
  },
  "ON TRACK": {
    badgeClassName: "bg-green-100 text-green-700 border-green-200",
    textClassName: "font-bold text-green-700",
  },
  "IN TRANSIT": {
    badgeClassName: "bg-purple-100 text-purple-700 border-purple-200",
    textClassName: "font-bold text-purple-700",
  },
};

// ─── DetailRow is defined OUTSIDE the parent component to prevent re-mounting on each render ───

interface DetailRowProps {
  label: string;
  value: string | number | Date | null | undefined | ReactNode;
  field?: keyof VehicleData;
  type?: "text" | "select" | "date" | "readonly" | "color" | "terms";
  isEditMode: boolean;
  currentVehicle: VehicleData;
  updateField: <K extends keyof VehicleData>(field: K, value: VehicleData[K]) => void;
  modelOptions?: string[];
  colorOptions?: ColorRecord[];
}

function DetailRow({
  label,
  value,
  field,
  type = "text",
  isEditMode,
  currentVehicle,
  updateField,
  modelOptions = [],
  colorOptions = [],
}: DetailRowProps) {
  const renderValue = (): ReactNode => {
    if (!isEditMode || type === "readonly") {
      if (value instanceof Date) {
        return format(value, "MMM dd, yyyy");
      }
      return value == null ? "-" : (value as ReactNode);
    }

    if (!field) return value == null ? "-" : (value as ReactNode);

    switch (type) {
      case "text":
        return (
          <Input
            value={(currentVehicle[field] as string) ?? ""}
            onChange={(e) => updateField(field, e.target.value as any)}
            className="h-8 text-sm"
          />
        );

      case "select": {
        let options: string[] = [];
        if (field === "model") options = modelOptions.length ? modelOptions : MODEL_OPTIONS;
        else if (field === "dealer") options = DEALER_OPTIONS;
        else if (field === "status") options = STATUS_OPTIONS;
        else if (field === "location") options = LOCATION_OPTIONS;
        else if (field === "salesConsultant") options = SALES_CONSULTANT_OPTIONS;
        else if (field === "generalManager") options = GENERAL_MANAGER_OPTIONS;
        else if (field === "bank") options = BANK_OPTIONS;

        return (
          <Select
            value={(currentVehicle[field] as string) || ""}
            onValueChange={(v) => updateField(field, v as any)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {options
                .slice()
                .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
                .map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "color": {
        const selectedColor = (currentVehicle[field] as string) || "";
        const availableColors = colorOptions.length
          ? colorOptions
          : Object.entries(colorHexMap).map(([name, hex], index) => ({ id: index + 1, name, hex, sort_order: index }));
        const resolvedColors =
          selectedColor && !availableColors.some((color) => color.name === selectedColor)
            ? ([{ id: -1, name: selectedColor, hex: getColorHex(selectedColor), sort_order: -1 } as ColorRecord, ...availableColors])
            : availableColors;

        return (
          <Select
            value={selectedColor}
            onValueChange={(v) => updateField(field, v as any)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: getColorHex(selectedColor) }}
                  />
                  {selectedColor}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {resolvedColors
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }))
                .map((color) => (
                <SelectItem key={color.id} value={color.name}>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "terms": {
        const currentValue = (currentVehicle[field] as string) || "";
        const isOther = currentValue !== "60 Months" && currentValue !== "36 Months";
        const otherMonths = isOther ? parseInt(currentValue.replace(/[^0-9]/g, ''), 10) || '' : '';

        return (
          <div className="space-y-2">
            <Select
              value={isOther ? "Others" : currentValue}
              onValueChange={(value) => {
                if (value === "Others") {
                  updateField(field!, "" as any);
                } else {
                  updateField(field!, value as any);
                }
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {[
                  "60 Months",
                  "36 Months",
                  "Others",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isOther && (
              <Input
                type="number"
                value={otherMonths}
                min={1}
                onChange={(e) => {
                  const months = Number(e.target.value);
                  updateField(field!, months > 0 ? `${months} Months` as any : "" as any);
                }}
                className="h-8 text-sm"
                placeholder="Enter months"
              />
            )}
          </div>
        );
      }

      case "date": {
        const dateValue = currentVehicle[field] as Date | null | undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-sm justify-start w-full"
              >
                <CalendarIcon className="size-3 mr-2" />
                {dateValue ? format(dateValue, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue || undefined}
                onSelect={(date) => updateField(field, date as any)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      }

      default:
        return value == null ? "-" : (value as ReactNode);
    }
  };

  return (
    <div className="flex py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        {label}
      </div>
      <div className="w-2/3 text-sm text-gray-900 dark:text-gray-100">{renderValue()}</div>
    </div>
  );
}

// ─── Main Modal Component ───────────────────────────────────────────────────

export function VehicleDetailsModal({
  vehicle,
  isOpen,
  onClose,
  onSave,
}: VehicleDetailsModalProps) {
  const { colors } = useColors();
  const { assignments } = useModelColors();
  const { prices } = usePrices();
  const { tables } = useAllocationTables();
  const modelOptions: string[] = Array.from(
    new Set(
      prices
        .map((p) => p.model)
        .filter((model): model is string => Boolean(model))
    )
  );
  const priceByModel = new Map(prices.map((p) => [p.model, p.srp]));
  const tableNameById = new Map<string, string>(tables.map((t) => [String(t.id), t.name]));
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<VehicleData | null>(null);
  const activeModel = (isEditMode && editedVehicle ? editedVehicle.model : vehicle?.model) || "";

  const modelColorOptions = useMemo(() => {
    const baseColors = colors.length
      ? colors
      : Object.entries(colorHexMap).map(([name, hex], index) => ({ id: index + 1, name, hex, sort_order: index }));

    if (!activeModel) return baseColors;

    const matchedPrice = prices.find((price) => price.model === activeModel);
    if (!matchedPrice) return baseColors;

    const assignedColorIds = new Set(
      assignments.filter((assignment) => assignment.price_id === matchedPrice.id).map((assignment) => assignment.color_id),
    );

    if (assignedColorIds.size === 0) return baseColors;

    return baseColors.filter((color) => assignedColorIds.has(color.id));
  }, [activeModel, assignments, colors, prices]);

  if (!isOpen || !vehicle) return null;

  const currentVehicle = isEditMode && editedVehicle ? editedVehicle : vehicle;

  const handleEditClick = () => {
    setEditedVehicle({
      ...vehicle,
      status: normalizeStatus(vehicle.status),
    });
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setEditedVehicle(null);
    setIsEditMode(false);
  };

  const handleSaveClick = async () => {
    if (editedVehicle && onSave) {
      try {
        await onSave(editedVehicle);
        setIsEditMode(false);
        setEditedVehicle(null);
      } catch (e: any) {
        toast.error(`Failed to save: ${e.message}`);
      }
    }
  };

  const updateField = <K extends keyof VehicleData>(
    field: K,
    value: VehicleData[K]
  ) => {
    setEditedVehicle((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  useEffect(() => {
    if (!isEditMode || !editedVehicle?.color) return;
    if (modelColorOptions.some((color) => color.name === editedVehicle.color)) return;
    updateField("color", (modelColorOptions[0]?.name ?? "") as any);
  }, [editedVehicle?.color, isEditMode, modelColorOptions]);

  const normalizeStatus = (status: VehicleData["status"]) =>
    status === "AVAILABLE" ? "ON TRACK" : status;

  const getEditableStatus = (status: VehicleData["status"]) => {
    const normalizedStatus = normalizeStatus(status);
    return STATUS_OPTIONS.includes(normalizedStatus)
      ? normalizedStatus
      : STATUS_OPTIONS[0];
  };

  const getStatusBadge = (status: VehicleData["status"]) => {
    const normalizedStatus = normalizeStatus(status);
    const variant = STATUS_VARIANTS[normalizedStatus] ?? STATUS_VARIANTS["ON TRACK"];
    return (
      <Badge
        variant="outline"
        className={variant.badgeClassName}
      >
        {normalizedStatus}
      </Badge>
    );
  };

  const setStatusColor = (status: VehicleData["status"]) => {
    const normalizedStatus = normalizeStatus(status);
    const variant = STATUS_VARIANTS[normalizedStatus] ?? STATUS_VARIANTS["ON TRACK"];
    return (
      <div className={variant.textClassName}>
        {normalizedStatus}
      </div>
    );
  };

  const renderEditableStatus = () => (
    <Select
      value={getEditableStatus(currentVehicle.status)}
      onValueChange={(value) => updateField("status", value as VehicleData["status"])}
    >
      <SelectTrigger className="h-8 w-full text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {STATUS_OPTIONS.slice()
          .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }))
          .map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );

  const calculateDays = () => differenceInDays(new Date(), currentVehicle.receivedDate);

  // Shared props passed down to every DetailRow
  const rowProps = { isEditMode, currentVehicle, updateField, modelOptions, colorOptions: modelColorOptions };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 dark:from-blue-950 to-white dark:to-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Vehicle Details</h2>
            <div className="flex flex-2 items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentVehicle.model} • {currentVehicle.plateNumber} •
              </div>
              <div className="min-w-[180px] px-1">
                {isEditMode ? renderEditableStatus() : setStatusColor(currentVehicle.status)}
              </div>
            </div>
            <div className="mt-2 w-72">
              {isEditMode ? (
                <Select
                  value={currentVehicle.allocationTable || ""}
                  onValueChange={(value) => updateField("allocationTable", value as any)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select allocation table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={String(table.id)}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Allocation Table: {tableNameById.get(String(currentVehicle.allocationTable || "")) ?? "Unassigned"}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelClick} className="gap-2">
                  <XCircle className="size-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveClick} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="size-4" />
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEditClick} className="gap-2">
                <Edit2 className="size-4" />
                Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">

          {/* Basic Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Basic Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <DetailRow label="MODEL" value={currentVehicle.model} field="model" type="select" {...rowProps} />
              <DetailRow label="CS NUMBER" value={currentVehicle.csNo} field="csNo" type="text" {...rowProps} />
              <DetailRow label="PLATE NUMBER" value={currentVehicle.plateNumber} field="plateNumber" type="text" {...rowProps} />
              <DetailRow
                label="COLOR"
                value={
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: getColorHex(currentVehicle.color) }}
                    />
                    {currentVehicle.color}
                  </div>
                }
                field="color"
                type="color"
                {...rowProps}
              />
              <DetailRow label="YEAR" value={currentVehicle.year} field="year" type="text" {...rowProps} />
              <DetailRow label="RECEIVED DATE" value={currentVehicle.receivedDate} field="receivedDate" type="date" {...rowProps} />
              <DetailRow label="PO NUMBER" value={currentVehicle.poNumber} field="poNumber" type="text" {...rowProps} />
              <DetailRow label="CHASSIS NUMBER" value={currentVehicle.chassisNo} field="chassisNo" type="text" {...rowProps} />
              <DetailRow label="ENGINE NUMBER" value={currentVehicle.engineNo} field="engineNo" type="text" {...rowProps} />
              <DetailRow label="VIN NUMBER" value={currentVehicle.vinNumber} field="vinNumber" type="text" {...rowProps} />
              <DetailRow
                label="ALLOCATION TABLE"
                value={tableNameById.get(String(currentVehicle.allocationTable || "")) ?? "Unassigned"}
                type="readonly"
                {...rowProps}
              />
              <DetailRow
                label="UNIT PRICE (SRP)"
                value={priceByModel.get(currentVehicle.model) ? `₱${priceByModel.get(currentVehicle.model)}` : "-"}
                type="readonly"
                {...rowProps}
              />
            </div>
          </div>

          {/* Dealer & Status Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Dealer & Status Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <DetailRow label="DEALER" value={currentVehicle.dealer} field="dealer" type="select" {...rowProps} />
              {isEditMode ? (
                <DetailRow label="STATUS" value={currentVehicle.status} field="status" type="select" {...rowProps} />
              ) : (
                <div className="flex py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">STATUS</div>
                  <div className="w-2/3 text-sm">{getStatusBadge(currentVehicle.status)}</div>
                </div>
              )}
              <DetailRow label="REMARKS" value={currentVehicle.remarks} field="remarks" type="text" {...rowProps} />
              <DetailRow label="LOCATION" value={currentVehicle.location} field="location" type="select" {...rowProps} />
              <DetailRow label="UNIT" value={currentVehicle.unit} field="unit" type="text" {...rowProps} />
            </div>
          </div>

          {/* Pull Out & Timeline Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Timeline Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <DetailRow label="PULL OUT" value={currentVehicle.pullOut} field="pullOut" type="date" {...rowProps} />
              <div className="flex py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">DAYS</div>
                <div className="w-2/3 text-sm">
                  <Badge
                    variant="outline"
                    className={
                      calculateDays() > 7
                        ? "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    }
                  >
                    {calculateDays()} days
                  </Badge>
                </div>
              </div>
              <DetailRow label="INVOICE DATE" value={currentVehicle.invoiceDate} field="invoiceDate" type="date" {...rowProps} />
              <DetailRow label="RELEASED DATE" value={currentVehicle.releaseDate} field="releaseDate" type="date" {...rowProps} />
            </div>
          </div>

          {/* Client & Sales Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Client & Sales Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <DetailRow label="NAME OF CLIENT" value={currentVehicle.nameOfClient} field="nameOfClient" type="text" {...rowProps} />
              <DetailRow label="INVOICE NUMBER" value={currentVehicle.invoiceNumber} field="invoiceNumber" type="text" {...rowProps} />
              <DetailRow label="SALES CONSULTANT" value={currentVehicle.salesConsultant} field="salesConsultant" type="select" {...rowProps} />
              <DetailRow label="GENERAL MANAGER" value={currentVehicle.generalManager} field="generalManager" type="select" {...rowProps} />
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Financial Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <DetailRow label="TERMS" value={currentVehicle.terms} field="terms" type="text" {...rowProps} />
              <DetailRow label="BANK" value={currentVehicle.bank} field="bank" type="select" {...rowProps} />
              <DetailRow label="INVOICE AMOUNT (₱)" value={currentVehicle.invoiceAmount} field="invoiceAmount" type="text" {...rowProps} />
              <DetailRow label="GROSS PROFIT" value={currentVehicle.grossProfit} field="grossProfit" type="text" {...rowProps} />
              <DetailRow label="DNP (₱)" value={currentVehicle.dnp} field="dnp" type="text" {...rowProps} />
              <DetailRow label="WS SUBSIDY (₱)" value={currentVehicle.wsSubsidy} field="wsSubsidy" type="text" {...rowProps} />
              <DetailRow label="DNP LESS WS SUBSIDY (₱)" value={currentVehicle.dnpLessWsSubsidy} field="dnpLessWsSubsidy" type="text" {...rowProps} />
              <DetailRow label="EWT (₱)" value={currentVehicle.ewt} field="ewt" type="text" {...rowProps} />
              <DetailRow label="PO AMOUNT (₱)" value={currentVehicle.poAmount} field="poAmount" type="text" {...rowProps} />
            </div>
          </div>

          {/* Allocation & On Track Information Section */}
          {(currentVehicle.category === "ALLOCATION" || currentVehicle.category === "AVAILABLE") && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <div className="h-1 w-8 bg-blue-600 rounded" />
                Allocation & On Track Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">                
                <DetailRow label="REMARKS" value={currentVehicle.remarks} field="remarks" type="text" {...rowProps} />
                <DetailRow label="DEALER" value={currentVehicle.dealer} field="dealer" type="select" {...rowProps} />
                <DetailRow label="TAGGING ACCOUNT" value={currentVehicle.taggingAccount} field="taggingAccount" type="text" {...rowProps} />
                <DetailRow label="ALLOCATION TEAM" value={currentVehicle.allocationTeam} field="allocationTeam" type="text" {...rowProps} />
                <DetailRow label="DATE TAGGED" value={currentVehicle.dateTagged} field="dateTagged" type="date" {...rowProps} />
                <DetailRow label="MONTH DECLARED" value={currentVehicle.monthDeclared} field="monthDeclared" type="text" {...rowProps} />
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Additional Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <DetailRow label="EXTENDED WARRANTY" value={currentVehicle.extendedWarranty} field="extendedWarranty" type="text" {...rowProps} />
              <DetailRow label="LTO DOCUMENTS TRANSMITTAL" value={currentVehicle.ltoDocumentsTransmittal} field="ltoDocumentsTransmittal" type="text" {...rowProps} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <Button variant="outline" onClick={onClose} className="min-w-[100px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
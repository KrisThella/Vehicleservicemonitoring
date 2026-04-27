import { useState } from "react";
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
import { toast } from "sonner";

interface VehicleDetailsModalProps {
  vehicle: VehicleData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedVehicle: VehicleData) => void;
}

// Pricing data for SRP lookup
const pricingData: Record<string, string> = {
  'APV 1.6 GA MT': '763,000.00',
  'APV 1.6 GLX MT': '975,000.00',
  'CELERIO 1.0 GL AGS': '754,000.00',
  'DZIRE GL CVT - HYBRID': '920,000.00',
  'DZIRE GLX CVT - HYBRID': '998,000.00',
  'ERTIGA 1.5 GA MT - HYBRID': '954,000.00',
  'ERTIGA 1.5 GL MT - HYBRID': '1,093,000.00',
  'ERTIGA 1.5 GL AT - HYBRID': '1,128,000.00',
  'ERTIGA 1.5 GLX AT - HYBRID': '1,213,000.00',
  'FRONX GL AT': '1,059,000.00',
  'FRONX GLX AT HYBRID': '1,219,000.00',
  'FRONX GLX AT - HYBRID (TWO-TONE)': '1,229,000.00',
  'FRONX SGX AT - HYBRID (TWO-TONE)': '1,299,000.00',
  'JIMNY 1.5 GL MT SS': '1,293,000.00',
  'JIMNY 1.5 GLX AT (MONOTONE) SS': '1,355,000.00',
  'JIMNY 1.5 GLX AT (TWO-TONE) SS': '1,365,000.00',
  'JIMNY 1.5 5DR GL MT': '1,558,000.00',
  'JIMNY 1.5 5DR GLX AT (MONOTONE)': '1,698,000.00',
  'JIMNY 1.5 5DR GLX AT (TWO-TONE)': '1,708,000.00',
  'JIMNY 3GLX AT R': '1,331,000.00',
  'JIMNY 5DR GLX AT R (MONOTONE)': '1,739,000.00',
  'JIMNY 5DR GLX AT R (TWO-TONE)': '1,749,000.00',
  'SWIFT 1.2 GL CVT': '989,000.00',
  'CARRY CAB & CHASSIS': '614,000.00',
  'CARRY DROPSIDE': '650,000.00',
  'CARRY CARGO VAN': '705,000.00',
  'CARRY UTILITY VAN': '754,000.00',
  "CARRY LINEMAN'S VEHICLE": '798,000.00',
  'S-PRESSO 1.0 GL MT': '634,000.00',
  'S-PRESSO 1.0 GL AGS': '674,000.00',
  'XL7 1.5 GLX AT - HYBRID MONOTONE': '1,252,000.00',
  'XL7 1.5 GLX AT - HYBRID (TWO-TONE)': '1,262,000.00',
  'XL7 1.5 GLX AT - HYBRID BLACK EDITION': '1,254,000.00',
  'XL7 1.5 GLX AT - HYBRID (TWO-TONE) BLACK EDITION': '1,269,000.00',
};

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

const COLOR_OPTIONS = Object.keys(colorHexMap);
const DEALER_OPTIONS = ["TEAM JM", "TEAM AARON", "TEAM JAY-R"];
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
  "AVAILABLE",
];
const LOCATION_OPTIONS = [
  "TEAM JM",
  "TEAM AARON",
  "TEAM JAY-R",
  "CLIENT DELIVERED",
  "IN TRANSIT",
  "HELD - ALLOCATION",
];
const SALES_CONSULTANT_OPTIONS = [
  "ABANTO, JENNIFER A.",
  "ALMACEN, MA.ISSAC ANNE",
  "ALMONTE, JAISTLE",
  "ALONTE, NERISSA",
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
  "MAYBANK",
  "PHILIPPINE SAVINGS BANK (PSB)",
  "BANCO DE ORO UNIBANK, INC. (BDO)",
  "RIZAL COMMERCIAL BANKING CORPORATION (RCBC)",
  "CHINA BANK SAVINGS(CBS)",
  "UCPB LEASING AND MANAGEMENT SERVICES CORPORATION (ULMS)",
  "SECURITY BANK CORPORATION (SBC)",
  "LUZON DEVELOPMENT BANK (LDB)",
  "BANK OF COMMERCE (BOC)",
];

// ─── DetailRow is defined OUTSIDE the parent component to prevent re-mounting on each render ───

interface DetailRowProps {
  label: string;
  value: string | number | Date | null | undefined | ReactNode;
  field?: keyof VehicleData;
  type?: "text" | "select" | "date" | "readonly" | "color";
  isEditMode: boolean;
  currentVehicle: VehicleData;
  updateField: <K extends keyof VehicleData>(field: K, value: VehicleData[K]) => void;
}

function DetailRow({
  label,
  value,
  field,
  type = "text",
  isEditMode,
  currentVehicle,
  updateField,
}: DetailRowProps) {
  const renderValue = () => {
    if (!isEditMode || type === "readonly") {
      if (value instanceof Date) {
        return format(value, "MMM dd, yyyy");
      }
      return value || "-";
    }

    if (!field) return value || "-";

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
        if (field === "model") options = MODEL_OPTIONS;
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
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "color":
        return (
          <Select
            value={(currentVehicle[field] as string) || ""}
            onValueChange={(v) => updateField(field, v as any)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded-full border border-gray-300"
                    style={{
                      backgroundColor: getColorHex(currentVehicle[field] as string),
                    }}
                  />
                  {currentVehicle[field] as string}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {COLOR_OPTIONS.map((color) => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    {color}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

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
        return value || "-";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<VehicleData | null>(null);

  if (!isOpen || !vehicle) return null;

  const currentVehicle = isEditMode && editedVehicle ? editedVehicle : vehicle;

  const handleEditClick = () => {
    setEditedVehicle({ ...vehicle });
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setEditedVehicle(null);
    setIsEditMode(false);
  };

  const handleSaveClick = () => {
    if (editedVehicle && onSave) {
      onSave(editedVehicle);
      toast.success("Vehicle details updated successfully!");
    }
    setIsEditMode(false);
    setEditedVehicle(null);
  };

  const updateField = <K extends keyof VehicleData>(
    field: K,
    value: VehicleData[K]
  ) => {
    setEditedVehicle((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getStatusBadge = (status: VehicleData["status"]) => {
    const variants: Record<VehicleData["status"], { className: string }> = {
      "On Process": { className: "bg-blue-100 text-blue-700 border-blue-200" },
      Pending: { className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      Completed: { className: "bg-green-100 text-green-700 border-green-200" },
      Overdue: { className: "bg-red-100 text-red-700 border-red-200" },
      HELD: { className: "bg-gray-100 text-gray-700 border-gray-200" },
      SOLD: { className: "bg-green-100 text-green-700 border-green-200" },
      "PAID WITH LTO": { className: "bg-blue-100 text-blue-700 border-blue-200" },
      "FOR LTO PROCESSING": { className: "bg-orange-100 text-orange-700 border-orange-200" },
      "ON HOLD": { className: "bg-gray-100 text-green-700 border-gray-200" },
      "ON TRACK": { className: "bg-green-100 text-green-700 border-green-200" },
      "IN TRANSIT": { className: "bg-purple-100 text-purple-700 border-purple-200" },
      AVAILABLE: { className: "bg-teal-100 text-teal-700 border-teal-200" },
    };
    return (
      <Badge variant="outline" className={variants[status].className}>
        {status}
      </Badge>
    );
  };

  const setStatusColor = (status: VehicleData["status"]) => {
    const variants: Record<VehicleData["status"], { className: string }> = {
      "On Process": { className: "font-bold text-blue-700" },
      Pending: { className: "font-bold text-yellow-700" },
      Completed: { className: "font-bold text-green-700" },
      Overdue: { className: "font-bold text-red-700" },
      HELD: { className: "font-bold text-gray-700" },
      SOLD: { className: "font-bold text-green-700" },
      "PAID WITH LTO": { className: "font-bold text-blue-700" },
      "FOR LTO PROCESSING": { className: "font-bold text-orange-700" },
      "ON HOLD": { className: "font-bold text-yellow-700" },
      "ON TRACK": { className: "font-bold text-green-700" },
      "IN TRANSIT": { className: "font-bold text-purple-700" },
      AVAILABLE: { className: "font-bold text-teal-700" },
    };
    return <div className={variants[status].className}>{status}</div>;
  };

  const calculateDays = () => differenceInDays(new Date(), currentVehicle.receivedDate);

  // Shared props passed down to every DetailRow
  const rowProps = { isEditMode, currentVehicle, updateField };

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
              <div className="text-sm px-1">{setStatusColor(currentVehicle.status)}</div>
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
              <DetailRow label="MODEL RECEIVED DATE" value={currentVehicle.receivedDate} field="receivedDate" type="date" {...rowProps} />
              <DetailRow label="PO NUMBER" value={currentVehicle.poNumber} field="poNumber" type="text" {...rowProps} />
              <DetailRow label="CHASSIS NUMBER" value={currentVehicle.chassisNo} field="chassisNo" type="text" {...rowProps} />
              <DetailRow
                label="UNIT PRICE (SRP)"
                value={pricingData[currentVehicle.model] ? `₱${pricingData[currentVehicle.model]}` : "-"}
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

          {/* Allocation & Available Information Section */}
          {(currentVehicle.category === "ALLOCATION" || currentVehicle.category === "AVAILABLE") && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <div className="h-1 w-8 bg-blue-600 rounded" />
                Allocation & Available Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <DetailRow label="ENGINE NUMBER" value={currentVehicle.engineNo} field="engineNo" type="text" {...rowProps} />
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
              <DetailRow label="VIN NUMBER" value={currentVehicle.vinNumber} field="vinNumber" type="text" {...rowProps} />
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
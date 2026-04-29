import { useState } from "react";
import { X, Save, Calendar as CalendarIcon } from "lucide-react";
import { VehicleData } from "./VehicleTable";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { getColorHex } from "./utils/colorMapping";
import { useColors, type ColorRecord } from "../../lib/api";

interface AddVehicleModalProps {
  onClose: () => void;
  onSave: (vehicle: VehicleData) => void;
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
  "XL7 1.5 GLX AT - HYBRID (MONOTONE)",
  "XL7 1.5 GLX AT - HYBRID (TWO-TONE)",
  "XL7 1.5 GLX AT - HYBRID BLACK EDITION",
  "XL7 1.5 GLX AT - HYBRID (TWO-TONE) BLACK EDITION",
];

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
const CATEGORY_OPTIONS = [
  "DEMO",
  "SALES",
  "ALLOCATION",
  "AVAILABLE",
  "IN TRANSIT",
  "PULL OUT MONITORING",
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
  "METRO BANK (MB)",
];

// ─── FormField is defined OUTSIDE the parent component to prevent re-mounting on each render ───

interface FormFieldProps {
  label: string;
  field: keyof VehicleData;
  type?: "text" | "select" | "date" | "color" | "number";
  required?: boolean;
  formData: Partial<VehicleData>;
  updateField: <K extends keyof VehicleData>(field: K, value: VehicleData[K]) => void;
  colors?: ColorRecord[];
}

function FormField({
  label,
  field,
  type = "text",
  required = false,
  formData,
  updateField,
  colors = [],
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case "text":
      case "number":
        return (
          <Input
            type={type}
            value={(formData[field] as string | number) ?? ""}
            onChange={(e) =>
              updateField(
                field,
                (type === "number" ? parseInt(e.target.value) : e.target.value) as any
              )
            }
            className="h-9 text-sm"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        );

      case "select": {
        let options: string[] = [];
        if (field === "model") options = MODEL_OPTIONS;
        else if (field === "dealer") options = DEALER_OPTIONS;
        else if (field === "status") options = STATUS_OPTIONS;
        else if (field === "location") options = LOCATION_OPTIONS;
        else if (field === "category") options = CATEGORY_OPTIONS;
        else if (field === "salesConsultant") options = SALES_CONSULTANT_OPTIONS;
        else if (field === "generalManager") options = GENERAL_MANAGER_OPTIONS;
        else if (field === "bank") options = BANK_OPTIONS;

        return (
          <Select
            value={(formData[field] as string) || ""}
            onValueChange={(value) => updateField(field, value as any)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
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

      case "color": {
        const selectedName = (formData[field] as string) || "";
        const selectedHex =
          colors.find((c) => c.name === selectedName)?.hex ?? getColorHex(selectedName);
        return (
          <Select
            value={selectedName}
            onValueChange={(value) => updateField(field, value as any)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select color">
                {selectedName && (
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: selectedHex }}
                    />
                    {selectedName}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {colors.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "date": {
        const dateValue = formData[field] as Date | null | undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-sm justify-start w-full"
              >
                <CalendarIcon className="size-3 mr-2" />
                {dateValue
                  ? format(dateValue, "MMM dd, yyyy")
                  : `Select ${label.toLowerCase()}`}
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
        return null;
    }
  };

  return (
    <div className="flex py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div className="w-2/3">{renderInput()}</div>
    </div>
  );
}

// ─── Main Modal Component ───────────────────────────────────────────────────

export function AddVehicleModal({ onClose, onSave }: AddVehicleModalProps) {
  const { colors } = useColors();
  const [formData, setFormData] = useState<Partial<VehicleData>>({
    model: "",
    csNo: "",
    plateNumber: "",
    color: "",
    year: new Date().getFullYear(),
    receivedDate: new Date(),
    poNumber: "",
    vinNumber: "",
    dealer: "",
    status: "On Process",
    remarks: "",
    location: "",
    unit: "",
    pullOut: undefined,
    overdue: false,
    category: "DEMO",
    chassisNo: "",
    engineNo: "",
  });

  const updateField = <K extends keyof VehicleData>(
    field: K,
    value: VehicleData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.model || !formData.csNo || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newVehicle: VehicleData = {
      id: `vehicle-${Date.now()}`,
      model: formData.model || "",
      csNo: formData.csNo || "",
      plateNumber: formData.plateNumber || "N/A",
      color: formData.color || "",
      year: formData.year || new Date().getFullYear(),
      receivedDate: formData.receivedDate || new Date(),
      poNumber: formData.poNumber || "",
      vinNumber: formData.vinNumber || "",
      dealer: formData.dealer || "",
      status: formData.status || "On Process",
      remarks: formData.remarks || "",
      location: formData.location || "",
      unit: formData.unit || "",
      pullOut: formData.pullOut || null,
      overdue: formData.overdue || false,
      category: formData.category || "DEMO",
      chassisNo: formData.chassisNo || "",
      engineNo: formData.engineNo || "",
      invoiceDate: formData.invoiceDate,
      nameOfClient: formData.nameOfClient,
      invoiceNumber: formData.invoiceNumber,
      releaseDate: formData.releaseDate,
      salesConsultant: formData.salesConsultant,
      generalManager: formData.generalManager,
      terms: formData.terms,
      bank: formData.bank,
      invoiceAmount: formData.invoiceAmount,
      grossProfit: formData.grossProfit,
      poAmount: formData.poAmount,
      dnp: formData.dnp,
      wsSubsidy: formData.wsSubsidy,
      dnpLessWsSubsidy: formData.dnpLessWsSubsidy,
      ewt: formData.ewt,
      extendedWarranty: formData.extendedWarranty,
      ltoDocumentsTransmittal: formData.ltoDocumentsTransmittal,
      taggingAccount: formData.taggingAccount,
      allocationTeam: formData.allocationTeam,
      dateTagged: formData.dateTagged,
      monthDeclared: formData.monthDeclared,
    };

    onSave(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 dark:from-blue-950 to-white dark:to-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Vehicle</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fill in the vehicle details</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="size-4" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
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
              <FormField label="CATEGORY" field="category" type="select" required formData={formData} updateField={updateField} />
              <FormField label="MODEL" field="model" type="select" required formData={formData} updateField={updateField} />
              <FormField label="CS NUMBER" field="csNo" type="text" required formData={formData} updateField={updateField} />
              <FormField label="PLATE NUMBER" field="plateNumber" type="text" formData={formData} updateField={updateField} />
              <FormField label="COLOR" field="color" type="color" formData={formData} updateField={updateField} colors={colors} />
              <FormField label="YEAR" field="year" type="number" formData={formData} updateField={updateField} />
              <FormField label="RECEIVED DATE" field="receivedDate" type="date" formData={formData} updateField={updateField} />
              <FormField label="PO NUMBER" field="poNumber" type="text" formData={formData} updateField={updateField} />
              <FormField label="CHASSIS NUMBER" field="chassisNo" type="text" formData={formData} updateField={updateField} />
              <FormField label="ENGINE NUMBER" field="engineNo" type="text" formData={formData} updateField={updateField} />
              <FormField label="VIN NUMBER" field="vinNumber" type="text" formData={formData} updateField={updateField} />
            </div>
          </div>

          {/* Dealer & Status Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Dealer & Status Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <FormField label="DEALER" field="dealer" type="select" formData={formData} updateField={updateField} />
              <FormField label="STATUS" field="status" type="select" formData={formData} updateField={updateField} />
              <FormField label="REMARKS" field="remarks" type="text" formData={formData} updateField={updateField} />
              <FormField label="LOCATION" field="location" type="select" formData={formData} updateField={updateField} />
              <FormField label="UNIT" field="unit" type="text" formData={formData} updateField={updateField} />
            </div>
          </div>

          {/* Timeline Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Timeline Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <FormField label="PULL OUT DATE" field="pullOut" type="date" formData={formData} updateField={updateField} />
              <FormField label="INVOICE DATE" field="invoiceDate" type="date" formData={formData} updateField={updateField} />
              <FormField label="RELEASED DATE" field="releaseDate" type="date" formData={formData} updateField={updateField} />
            </div>
          </div>

          {/* Client & Sales Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Client & Sales Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <FormField label="NAME OF CLIENT" field="nameOfClient" type="text" formData={formData} updateField={updateField} />
              <FormField label="INVOICE NUMBER" field="invoiceNumber" type="text" formData={formData} updateField={updateField} />
              <FormField label="SALES CONSULTANT" field="salesConsultant" type="select" formData={formData} updateField={updateField} />
              <FormField label="GENERAL MANAGER" field="generalManager" type="select" formData={formData} updateField={updateField} />
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Financial Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <FormField label="TERMS" field="terms" type="text" formData={formData} updateField={updateField} />
              <FormField label="BANK" field="bank" type="select" formData={formData} updateField={updateField} />
              <FormField label="INVOICE AMOUNT (₱)" field="invoiceAmount" type="text" formData={formData} updateField={updateField} />
              <FormField label="GROSS PROFIT" field="grossProfit" type="text" formData={formData} updateField={updateField} />
              <FormField label="DNP (₱)" field="dnp" type="text" formData={formData} updateField={updateField} />
              <FormField label="WS SUBSIDY (₱)" field="wsSubsidy" type="text" formData={formData} updateField={updateField} />
              <FormField label="DNP LESS WS SUBSIDY (₱)" field="dnpLessWsSubsidy" type="text" formData={formData} updateField={updateField} />
              <FormField label="EWT (₱)" field="ewt" type="text" formData={formData} updateField={updateField} />
              <FormField label="PO AMOUNT (₱)" field="poAmount" type="text" formData={formData} updateField={updateField} />
            </div>
          </div>

          {/* Allocation Information (if category is ALLOCATION or AVAILABLE) */}
          {(formData.category === "ALLOCATION" || formData.category === "AVAILABLE") && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <div className="h-1 w-8 bg-blue-600 rounded" />
                Allocation Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <FormField label="TAGGING ACCOUNT" field="taggingAccount" type="text" formData={formData} updateField={updateField} />
                <FormField label="ALLOCATION TEAM" field="allocationTeam" type="text" formData={formData} updateField={updateField} />
                <FormField label="DATE TAGGED" field="dateTagged" type="date" formData={formData} updateField={updateField} />
                <FormField label="MONTH DECLARED" field="monthDeclared" type="text" formData={formData} updateField={updateField} />
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded" />
              Additional Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <FormField label="EXTENDED WARRANTY" field="extendedWarranty" type="text" formData={formData} updateField={updateField} />
              <FormField label="LTO DOCUMENTS TRANSMITTAL" field="ltoDocumentsTransmittal" type="text" formData={formData} updateField={updateField} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

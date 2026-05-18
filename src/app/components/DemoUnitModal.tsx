import { useEffect, useMemo, useState } from "react";
import { X, Save, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { toast } from "sonner";
import { getColorHex } from "./utils/colorMapping";
import { useColors } from "../../lib/api";
import { VehicleData } from "./VehicleTable";

interface DemoUnitModalProps {
  onClose: () => void;
  onSave: (vehicle: Partial<VehicleData>) => void;
  initialVehicle?: Partial<VehicleData>;
}

const MODEL_OPTIONS = [
  "APV 1.6 GA MT",
  "APV 1.6 GLX MT",
  "CARRY CAB & CHASSIS",
  "CARRY CARGO VAN",
  "CARRY DROPSIDE",
  "CARRY LINEMAN'S VEHICLE",
  "CARRY UTILITY VAN",
  "CELERIO 1.0 GL",
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

interface FormFieldProps {
  label: string;
  field: keyof VehicleData;
  type?: "text" | "select" | "date" | "number";
  required?: boolean;
  formData: Partial<VehicleData>;
  updateField: <K extends keyof VehicleData>(field: K, value: VehicleData[K]) => void;
  modelOptions?: string[];
  colors?: string[];
}

function FormField({
  label,
  field,
  type = "text",
  required = false,
  formData,
  updateField,
  modelOptions = [],
  colors = [],
}: FormFieldProps) {
  const renderInput = () => {
    if (type === "select") {
      const options =
        field === "model"
          ? modelOptions
          : field === "status"
          ? STATUS_OPTIONS
          : field === "color"
          ? colors
          : [];

      return (
        <Select
          value={(formData[field] as string) || ""}
          onValueChange={(value) => updateField(field, value as any)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="max-h-[280px]">
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {field === "color" ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: getColorHex(option) }}
                    />
                    {option}
                  </div>
                ) : (
                  option
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === "date") {
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
              {dateValue ? dateValue.toLocaleDateString() : `Select ${label.toLowerCase()}`}
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

    return (
      <Input
        type={type}
        value={(formData[field] as string | number) ?? ""}
        onChange={(e) =>
          updateField(
            field,
            (type === "number" ? parseInt(e.target.value) : e.target.value) as any,
          )
        }
        className="h-9 text-sm"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    );
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

export function DemoUnitModal({ onClose, onSave, initialVehicle }: DemoUnitModalProps) {
  const { colors } = useColors();
  const colorNames = useMemo(
    () => colors.map((color) => color.name).sort((a, b) => a.localeCompare(b)),
    [colors],
  );

  const [formData, setFormData] = useState<Partial<VehicleData>>({
    model: "",
    csNo: "",
    plateNumber: "",
    color: "",
    year: new Date().getFullYear(),
    receivedDate: new Date(),
    poNumber: "",
    vinNumber: "",
    dealer: "BIÑAN",
    status: "On Process",
    remarks: "",
    category: "DEMO",
  });

  useEffect(() => {
    if (initialVehicle) {
      setFormData((prev) => ({
        ...prev,
        ...initialVehicle,
        year: initialVehicle.year ?? prev.year,
        receivedDate: initialVehicle.receivedDate ?? prev.receivedDate,
        dealer: initialVehicle.dealer ?? prev.dealer,
        status: initialVehicle.status ?? prev.status,
        category: initialVehicle.category ?? prev.category,
      }));
    }
  }, [initialVehicle]);

  const updateField = <K extends keyof VehicleData>(field: K, value: VehicleData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.model || !formData.csNo) {
      toast.error("Please fill required fields: Model and CS Number");
      return;
    }

    onSave({
      ...formData,
      category: formData.category ?? "DEMO",
      status: formData.status ?? "On Process",
      dealer: formData.dealer || "BIÑAN",
    });
    onClose();
  };

  const title = initialVehicle ? "Edit DEMO Unit" : "Add DEMO Unit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-white dark:to-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create or update a demo unit entry.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Save className="size-4" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="size-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
          <FormField
            label="MODEL"
            field="model"
            type="select"
            required
            formData={formData}
            updateField={updateField}
            modelOptions={MODEL_OPTIONS}
          />
          <FormField
            label="CS NUMBER"
            field="csNo"
            type="text"
            required
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="PLATE NUM"
            field="plateNumber"
            type="text"
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="COLOR"
            field="color"
            type="select"
            formData={formData}
            updateField={updateField}
            colors={colorNames}
          />
          <FormField
            label="MODEL YEAR"
            field="year"
            type="number"
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="RECEIVED DATE"
            field="receivedDate"
            type="date"
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="PO NUM"
            field="poNumber"
            type="text"
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="VIN NUM"
            field="vinNumber"
            type="text"
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="DEALER"
            field="dealer"
            type="text"
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="STATUS"
            field="status"
            type="select"
            formData={formData}
            updateField={updateField}
          />
          <FormField
            label="REMARKS"
            field="remarks"
            type="text"
            formData={formData}
            updateField={updateField}
          />
        </div>
      </div>
    </div>
  );
}

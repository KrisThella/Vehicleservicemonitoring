import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  MoreVertical,
  Calendar as CalendarIcon,
  History as HistoryIcon,
  MapPin,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { format, differenceInDays, isValid } from "date-fns";
import { getColorHex } from "./utils/colorMapping";

export interface VehicleData {
  id: string;
  model: string;
  plateNumber: string;
  color: string;
  year: number;
  receivedDate: Date;
  poNumber: string;
  vinNumber: string;
  dealer: string;
  status:
    | "On Process"
    | "Pending"
    | "Completed"
    | "Overdue"
    | "HELD"
    | "SOLD"
    | "PAID WITH LTO"
    | "FOR LTO PROCESSING"
    | "ON HOLD"
    | "ON TRACK"
    | "IN TRANSIT"
    | "AVAILABLE";
  remarks: string;
  location: string;
  unit: string;
  pullOut: Date | null;
  overdue: boolean;
  category?:
    | "DEMO"
    | "SALES"
    | "ALLOCATION"
    | "AVAILABLE"
    | "IN TRANSIT"
    | "PULL OUT MONITORING";
  //
  serdis?: string;
  atOrUnit?: string;

  // Extended fields for comprehensive tracking
  chassisNo?: string;
  engineNo?: string;
  pullOutDate?: Date | null;
  csNo?: string;
  bodyType?: string;
  bodorCsnStatus?: string;
  dateOfDelivery?: Date | null;
  allocation?: string;
  pnNumber?: string;
  poAmount?: string;
  plateNoAtReceipt?: string;
  madeBySent?: string;
  invoiceDate?: Date | null;
  invoiceNumber?: string;
  releaseDate?: Date | null;
  jc?: string;

  // Financial tracking
  rc?: string;
  bank?: string;
  arm?: string;
  terms?: string;
  sp?: string; // Selling Price
  invoiceAmount?: string;
  up?: string;
  statementGuaranty?: string;
  statementDeposit?: Date | null;
  ltoBankTransmittal?: Date | null;

  // Client information
  nameOfClient?: string;

  // Status tracking
  statusOfClient?: string;
  colorCode?: string;
  declinedUnits?: string;

  // Additional tracking
  plAmount?: string;
  niAccount?: string;
  dealerAtNo?: string;

  // New fields for detailed view
  salesConsultant?: string;
  generalManager?: string;
  grossProfit?: string;
  extendedWarranty?: string;
  ltoDocumentsTransmittal?: string;
  
  // Pricing breakdown fields
  dnp?: string;
  wsSubsidy?: string;
  dnpLessWsSubsidy?: string;
  ewt?: string;

  // Allocation & On Track specific fields
  taggingAccount?: string;
  allocationTeam?: string;
  dateTagged?: Date | null;
  monthDeclared?: string;
}

interface VehicleTableProps {
  data: VehicleData[];
  onViewHistory: (vehicle: VehicleData) => void;
  onViewDetails: (vehicle: VehicleData) => void;
}

type SortField = keyof VehicleData;
type SortDirection = "asc" | "desc" | null;

export function VehicleTable({
  data,
  onViewHistory,
  onViewDetails,
}: VehicleTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(
    null,
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData[]>(data);

  // Sync vehicleData with data prop changes
  useEffect(() => {
    setVehicleData(data);
  }, [data]);

  const handleViewDetails = (vehicle: VehicleData) => {
    onViewDetails(vehicle);
  };



  // Use vehicleData instead of data for sorting
  const dataToSort = vehicleData.length > 0 ? vehicleData : data;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = [...dataToSort].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    if (
      typeof aValue === "string" &&
      typeof bValue === "string"
    ) {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (
      typeof aValue === "number" &&
      typeof bValue === "number"
    ) {
      return sortDirection === "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  const normalizeStatus = (status: VehicleData["status"]) =>
    status === "AVAILABLE" ? "ON TRACK" : status;

  const getStatusBadge = (status: VehicleData["status"]) => {
    const normalizedStatus = normalizeStatus(status);
    const variants: Record<string, { className: string }> = {
      "On Process": {
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      Pending: {
        className:
          "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      Completed: {
        className:
          "bg-green-100 text-green-700 border-green-200",
      },
      Overdue: {
        className: "bg-red-100 text-red-700 border-red-200",
      },
      HELD: {
        className: "bg-gray-100 text-gray-700 border-gray-200",
      },
      SOLD: {
        className: "bg-green-100 text-green-700 border-green-200",
      },
      "PAID WITH LTO": {
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      "FOR LTO PROCESSING": {
        className: "bg-orange-100 text-orange-700 border-orange-200",
      },
      "ON HOLD": {
        className: "bg-gray-100 text-teal-700 border-grey-200",
      },
      "ON TRACK": {
        className: "bg-green-100 text-green-700 border-green-200",
      },
      "IN TRANSIT": {
        className: "bg-purple-100 text-purple-700 border-purlpe-200",
      },
    };

    const badgeConfig = variants[normalizedStatus] || {
      className: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <Badge
        variant="outline"
        className={badgeConfig.className}
      >
        {normalizedStatus}
      </Badge>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="size-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="size-4 text-blue-600" />
    ) : (
      <ArrowDown className="size-4 text-blue-600" />
    );
  };

  const toValidDate = (
    value: Date | string | number | null | undefined
  ) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return isValid(date) ? date : null;
  };

  const formatDate = (value: Date | string | number | null | undefined) => {
    const date = toValidDate(value);
    return date ? format(date, "MMM dd, yyyy") : null;
  };

  const getDaysInService = (
    receivedDate: Date | string | null | undefined
  ) => {
    const date = toValidDate(receivedDate);
    if (!date) return null;
    return differenceInDays(new Date(), date);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 hover:text-gray-900"
                  onClick={() => handleSort("model")}
                >
                  Model
                  <SortIcon field="model" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 hover:text-gray-900"
                  onClick={() => handleSort("csNo")}
                >
                  CS Number
                  <SortIcon field="csNo" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 hover:text-gray-900"
                  onClick={() => handleSort("plateNumber")}
                >
                  Plate Number
                  <SortIcon field="plateNumber" />
                </button>
              </TableHead>
              <TableHead className="px-8">Color</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 hover:text-gray-900"
                  onClick={() => handleSort("year")}
                >
                  Year Model
                  <SortIcon field="year" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 hover:text-gray-900"
                  onClick={() => handleSort("receivedDate")}
                >
                  Received Date
                  <SortIcon field="receivedDate" />
                </button>
              </TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Chassis Number</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 hover:text-gray-900"
                  onClick={() => handleSort("dealer")}
                >
                  Dealer
                  <SortIcon field="dealer" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 hover:text-gray-900"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Pull Out</TableHead>
              <TableHead>Days</TableHead>
              <TableHead className="w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((vehicle, index) => (
              <TableRow
                key={vehicle.id}
                className={
                  vehicle.overdue
                    ? "bg-red-50 dark:bg-red-950/40 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                }
                onClick={() => handleViewDetails(vehicle)}
              >
                <TableCell className="text-gray-500 dark:text-gray-400">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {vehicle.model}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {vehicle.csNo}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {vehicle.plateNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full border border-gray-300"
                      style={{
                        backgroundColor: getColorHex(
                          vehicle.color,
                        ),
                      }}
                    />
                    {vehicle.color}
                  </div>
                </TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>
                  {formatDate(vehicle.receivedDate) ? (
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="size-3 text-gray-400" />
                      {formatDate(vehicle.receivedDate)}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {vehicle.poNumber}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {vehicle.chassisNo}
                </TableCell>
                <TableCell className="text-sm">
                  {vehicle.dealer}
                </TableCell>
                <TableCell>
                  {getStatusBadge(vehicle.status)}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div
                    className="text-sm text-gray-600 truncate"
                    title={vehicle.remarks}
                  >
                    {vehicle.remarks}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="size-3 text-gray-400" />
                    {vehicle.location}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {vehicle.unit}
                </TableCell>
                <TableCell>
                  {formatDate(vehicle.pullOut) ? (
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="size-3 text-gray-400" />
                      {formatDate(vehicle.pullOut)}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    const daysInService = getDaysInService(
                      vehicle.receivedDate
                    );
                    const badgeClassName =
                      daysInService !== null && daysInService > 7
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-gray-50 text-gray-700 border-gray-200";
                    return (
                  <Badge
                    variant="outline"
                    className={
                      badgeClassName
                    }
                  >
                    {daysInService !== null ? `${daysInService}d` : "-"}
                  </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(vehicle);
                        }}
                      >
                        <Eye className="size-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                     
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewHistory(vehicle);
                        }}
                      >
                        <HistoryIcon className="size-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
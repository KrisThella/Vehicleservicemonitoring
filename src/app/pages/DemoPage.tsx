import { useMemo, useState } from "react";
import { Plus, Search, Edit3, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { DemoUnitModal } from "../components/DemoUnitModal";
import { useVehicles } from "../../lib/api";
import { format, differenceInDays } from "date-fns";
import { VehicleData } from "../components/VehicleTable";

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

export function DemoPage() {
  const navigate = useNavigate();
  const { vehicles, addVehicle, updateVehicle, removeVehicle } = useVehicles();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Partial<VehicleData> | null>(null);

  const demoVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.category === "DEMO"),
    [vehicles],
  );

  const modelOptions = useMemo(
    () => Array.from(new Set(demoVehicles.map((vehicle) => vehicle.model).filter(Boolean))).sort(),
    [demoVehicles],
  );

  const filteredVehicles = useMemo(() => {
    return demoVehicles.filter((vehicle) => {
      const search = searchTerm.trim().toLowerCase();
      if (search) {
        const matchesSearch =
          vehicle.model.toLowerCase().includes(search) ||
          (vehicle.csNo ?? "").toLowerCase().includes(search) ||
          vehicle.plateNumber.toLowerCase().includes(search) ||
          vehicle.vinNumber.toLowerCase().includes(search) ||
          vehicle.dealer.toLowerCase().includes(search) ||
          vehicle.remarks.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (selectedModel !== "all" && vehicle.model !== selectedModel) return false;
      if (selectedStatus !== "all" && vehicle.status !== selectedStatus) return false;
      return true;
    });
  }, [demoVehicles, searchTerm, selectedModel, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle: VehicleData) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleSave = async (vehicle: Partial<VehicleData>) => {
    if (vehicle.id) {
      await updateVehicle(vehicle.id, { ...vehicle } as VehicleData);
    } else {
      await addVehicle({ ...vehicle, category: "DEMO" } as VehicleData);
    }
    setShowModal(false);
  };

  const handleDelete = async (vehicle: VehicleData) => {
    if (!window.confirm(`Delete DEMO unit ${vehicle.csNo || vehicle.model}?`)) return;
    await removeVehicle(vehicle.id);
  };

  const handleSetAsSale = async (vehicle: VehicleData) => {
    if (!window.confirm("Set this demo unit as sale and continue in Dashboard?")) return;
    await removeVehicle(vehicle.id);
    navigate("/", {
      state: {
        prefillVehicle: {
          ...vehicle,
          category: "SALES",
          status: "On Process",
        },
      },
    });
  };

  return (
    <>
      <Header />
      <main className="flex-1 overflow-auto px-6 py-6 space-y-6 bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">DEMO Units</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track demo units and move selected entries into sales.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-4" onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" />
            Add DEMO Unit
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] items-end">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-gray-500" />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search demo units..."
              className="w-full"
            />
          </div>
          <div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {modelOptions.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Demo units</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{demoVehicles.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Showing</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{filteredVehicles.length}</p>
          </div>          
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">DEMO Inventory</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage demo units before sending them to sales.</p>
            </div>
            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200">
              {filteredVehicles.length} records
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-full" containerClassName="overflow-auto">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  {[
                    "#",
                    "MODEL",
                    "CS NUMBER",
                    "PLATE NUM",
                    "COLOR",
                    "MODEL YEAR",
                    "RECEIVED DATE",
                    "PO NUM",
                    "VIN NUM",
                    "DEALER",
                    "STATUS",
                    "DAYS",
                    "REMARKS",
                    "ACTIONS",
                  ].map((label) => (
                    <TableHead key={label} className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-4 py-3">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{index + 1}</TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.model}</TableCell>
                    <TableCell className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{vehicle.csNo}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.plateNumber}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.color}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.year}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.receivedDate ? format(vehicle.receivedDate, "MMM dd, yyyy") : "-"}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.poNumber}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.vinNumber}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.dealer}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.status}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{vehicle.receivedDate ? differenceInDays(new Date(), vehicle.receivedDate) : "-"}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{vehicle.remarks}</TableCell>
                    <TableCell className="px-4 py-3 text-sm space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}>
                        <Edit3 className="size-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleDelete(vehicle)}>
                        <Trash2 className="size-4" />
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSetAsSale(vehicle)}>
                        <ShoppingBag className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={14} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No demo units found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
      {showModal && (
        <DemoUnitModal
          initialVehicle={editingVehicle ?? undefined}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

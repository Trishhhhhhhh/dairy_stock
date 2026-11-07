import { useState, useMemo } from "react";
import {
  Menu,
  X,
  Milk,
  Warehouse,
  Settings,
  FileBarChart,
  Sunrise,
  Sunset,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Upload,
} from "lucide-react";
import UploadImage from "./UploadImage";

const ITEMS = [
  { key: "buffaloMilk", label: "Buffalo Milk", unit: "kg", rate: 80 },
  { key: "cowMilk", label: "Cow Milk", unit: "kg", rate: 70 },
  { key: "dahi", label: "Dahi", unit: "kg", rate: 100 },
  { key: "paneer", label: "Paneer", unit: "kg", rate: 400 },
  { key: "desiGhee", label: "Desi Ghee", unit: "kg", rate: 760 },
  { key: "makhan", label: "Makhan", unit: "kg", rate: 600 },
  { key: "lassi", label: "Lassi", unit: "kg", rate: 30 },
  { key: "cream", label: "Cream", unit: "kg", rate: 440 },
  { key: "khoya", label: "Khoya", unit: "kg", rate: 580 },
  { key: "bread", label: "Bread", unit: "kg", rate: 1 },
  { key: "fan", label: "Fan", unit: "pc", rate: 50 },
  { key: "rusk", label: "Rusk", unit: "pc", rate: 55 },
  { key: "other", label: "Other", unit: "kg", rate: 1 },
  { key: "boondi", label: "Boondi", unit: "pc", rate: 10 },
  { key: "lifafa", label: "Lifafa", unit: "kg", rate: 190 },
  { key: "rubber", label: "Rubber", unit: "kg", rate: 300 },
];


const BASANT_EXCLUDED = ["buffaloMilk", "cowMilk", "lifafa", "rubber"];

const DAIRIES = [
  { key: "guruNanak", label: "Guru Nanak Dairy" },
  { key: "basant", label: "Basant Dairy" },
];

const SESSIONS = ["morning", "evening"];
const TYPES = ["inward", "return"];

function itemByKey(key) {
  return ITEMS.find((i) => i.key === key);
}

let rowIdCounter = 1;
function newRowId() {
  return `row_${rowIdCounter++}`;
}

function emptyRows() {
  const r = {};
  DAIRIES.forEach(({ key: d }) => {
    r[d] = {};
    SESSIONS.forEach((s) => {
      r[d][s] = {};
      TYPES.forEach((t) => {
        r[d][s][t] = [];
      });
    });
  });
  return r;
}

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function DairyStockApp() {
  const [rates, setRates] = useState(
    Object.fromEntries(ITEMS.map((i) => [i.key, i.rate]))
  );
  const [rows, setRows] = useState(emptyRows());
  const [active, setActive] = useState("guruNanak");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addRow = (dairy, session, type, itemKey) => {
    if (!itemKey) return;
    setRows((prev) => ({
      ...prev,
      [dairy]: {
        ...prev[dairy],
        [session]: {
          ...prev[dairy][session],
          [type]: [
            ...prev[dairy][session][type],
            { id: newRowId(), key: itemKey, qty: "" },
          ],
        },
      },
    }));
  };

  const setRowQty = (dairy, session, type, rowId, value) => {
    setRows((prev) => ({
      ...prev,
      [dairy]: {
        ...prev[dairy],
        [session]: {
          ...prev[dairy][session],
          [type]: prev[dairy][session][type].map((r) =>
            r.id === rowId ? { ...r, qty: value } : r
          ),
        },
      },
    }));
  };

  const removeRow = (dairy, session, type, rowId) => {
    setRows((prev) => ({
      ...prev,
      [dairy]: {
        ...prev[dairy],
        [session]: {
          ...prev[dairy][session],
          [type]: prev[dairy][session][type].filter((r) => r.id !== rowId),
        },
      },
    }));
  };

  const setRate = (item, value) => {
    setRates((prev) => ({ ...prev, [item]: value }));
  };

  const rowAmount = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(rates[row.key]) || 0;
    return qty * rate;
  };

  const sectionTotal = (dairy, session, type, excludeKeys = []) =>
    rows[dairy][session][type]
      .filter((r) => !excludeKeys.includes(r.key))
      .reduce((sum, r) => sum + rowAmount(r), 0);

  const dairyTypeTotal = (dairy, type, excludeKeys = []) =>
    SESSIONS.reduce(
      (sum, s) => sum + sectionTotal(dairy, s, type, excludeKeys),
      0
    );

  const dairyInward = (dairy) => dairyTypeTotal(dairy, "inward");
  const dairyReturn = (dairy) => dairyTypeTotal(dairy, "return");
  const dairyNet = (dairy) => dairyInward(dairy) - dairyReturn(dairy);

  const basantExcludedInward = useMemo(
    () => dairyTypeTotal("basant", "inward", BASANT_EXCLUDED),
    [rows, rates]
  );
  const guruNanakNet = dairyNet("guruNanak");
  const finalAmount = guruNanakNet - basantExcludedInward;

  const NAV = [
    { key: "guruNanak", label: "Guru Nanak Dairy", icon: Milk },
    { key: "basant", label: "Basant Dairy", icon: Warehouse },
    { key: "rates", label: "Rates", icon: Settings },
    { key: "summary", label: "Summary", icon: FileBarChart },
    { key: "uploadImage", label: "Upload Image", icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-slate-900 text-slate-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <span className="text-lg font-bold text-white">Dairy Stock</span>
          <button className="lg:hidden text-slate-300" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActive(key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active === key
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-3 px-4 sticky top-0 z-20">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {NAV.find((n) => n.key === active)?.label}
          </h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {active === "rates" && <RatesPanel rates={rates} setRate={setRate} />}

          {(active === "guruNanak" || active === "basant") && (
            <DairyPanel
              dairyKey={active}
              dairyLabel={NAV.find((n) => n.key === active)?.label}
              rows={rows}
              addRow={addRow}
              setRowQty={setRowQty}
              removeRow={removeRow}
              rates={rates}
              rowAmount={rowAmount}
              sectionTotal={sectionTotal}
              dairyInward={dairyInward}
              dairyReturn={dairyReturn}
              dairyNet={dairyNet}
            />
          )}

          {active === "summary" && (
            <SummaryPanel
              guruNanakInward={dairyInward("guruNanak")}
              guruNanakReturn={dairyReturn("guruNanak")}
              guruNanakNet={guruNanakNet}
              basantInward={dairyInward("basant")}
              basantReturn={dairyReturn("basant")}
              basantNet={dairyNet("basant")}
              basantExcludedInward={basantExcludedInward}
              finalAmount={finalAmount}
            />
          )}
          {active === "uploadImage" && (
           <UploadImage/>
          )}
        </main>
      </div>
    </div>
  );
}

function RatesPanel({ rates, setRate }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Item Rates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-700">
              {item.label} <span className="text-gray-400">/{item.unit}</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={rates[item.key]}
                onChange={(e) => setRate(item.key, e.target.value)}
                className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DairyPanel({
  dairyKey,
  dairyLabel,
  rows,
  addRow,
  setRowQty,
  removeRow,
  rates,
  rowAmount,
  sectionTotal,
  dairyInward,
  dairyReturn,
  dairyNet,
}) {
  return (
    <div className="space-y-6">
      {SESSIONS.map((session) => (
        <div key={session} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            {session === "morning" ? (
              <Sunrise size={20} className="text-amber-500" />
            ) : (
              <Sunset size={20} className="text-orange-600" />
            )}
            <h2 className="text-lg font-semibold capitalize">{session}</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {TYPES.map((type) => (
              <StockTable
                key={type}
                type={type}
                dairyKey={dairyKey}
                session={session}
                rowList={rows[dairyKey][session][type]}
                addRow={addRow}
                setRowQty={setRowQty}
                removeRow={removeRow}
                rates={rates}
                rowAmount={rowAmount}
                total={sectionTotal(dairyKey, session, type)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">{dairyLabel} — Totals (Morning + Evening)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TotalCard label="Total Inward" value={dairyInward(dairyKey)} color="text-emerald-600" />
          <TotalCard label="Total Return" value={dairyReturn(dairyKey)} color="text-red-600" />
          <TotalCard label="Net (Inward − Return)" value={dairyNet(dairyKey)} color="text-indigo-600" bold />
        </div>
      </div>
    </div>
  );
}

function StockTable({
  type,
  dairyKey,
  session,
  rowList,
  addRow,
  setRowQty,
  removeRow,
  rates,
  rowAmount,
  total,
}) {
  const isInward = type === "inward";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium ${isInward ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
      >
        <span className="flex items-center gap-2">
          {isInward ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
          {isInward ? "Inward (Stock Incoming)" : "Return (Stock Returned)"}
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <Plus size={16} className="text-gray-400" />
        <select
          value=""
          onChange={(e) => {
            addRow(dairyKey, session, type, e.target.value);
            e.target.value = "";
          }}
          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>
            + Add Item
          </option>
          {ITEMS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label} ({fmt(rates[item.key] || 0)}/{item.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="text-left font-medium px-3 py-2">Item</th>
              <th className="text-right font-medium px-3 py-2">Rate</th>
              <th className="text-right font-medium px-3 py-2 w-24">Qty</th>
              <th className="text-right font-medium px-3 py-2">Amount</th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rowList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-gray-400 text-sm">
                  No items added yet — use "Add Item" above.
                </td>
              </tr>
            )}
            {rowList.map((row) => {
              const item = itemByKey(row.key);
              return (
                <tr key={row.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-1.5 text-gray-700">
                    {item.label} <span className="text-gray-400 text-xs">/{item.unit}</span>
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-500">{fmt(rates[row.key] || 0)}</td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      min="0"
                      autoFocus
                      value={row.qty}
                      onChange={(e) => setRowQty(dairyKey, session, type, row.id, e.target.value)}
                      className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-700">
                    {fmt(rowAmount(row))}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => removeRow(dairyKey, session, type, row.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Remove row"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {rowList.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-3 py-2 text-right">
                  Subtotal
                </td>
                <td className="px-3 py-2 text-right">{fmt(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function TotalCard({ label, value, color, bold }) {
  return (
    <div className="border border-gray-200 rounded-lg px-4 py-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-xl ${bold ? "font-bold" : "font-semibold"} ${color}`}>{fmt(value)}</div>
    </div>
  );
}

function SummaryPanel({
  guruNanakInward,
  guruNanakReturn,
  guruNanakNet,
  basantInward,
  basantReturn,
  basantNet,
  basantExcludedInward,
  finalAmount,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Guru Nanak Dairy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TotalCard label="Total Inward" value={guruNanakInward} color="text-emerald-600" />
          <TotalCard label="Total Return" value={guruNanakReturn} color="text-red-600" />
          <TotalCard label="Net (Inward − Return)" value={guruNanakNet} color="text-indigo-600" bold />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Basant Dairy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TotalCard label="Total Inward" value={basantInward} color="text-emerald-600" />
          <TotalCard label="Total Return" value={basantReturn} color="text-red-600" />
          <TotalCard label="Net (Inward − Return)" value={basantNet} color="text-indigo-600" bold />
        </div>
        <div className="mt-4">
          <TotalCard
            label="Inward total excluding Buffalo Milk, Cow Milk, Lifafa & Rubber"
            value={basantExcludedInward}
            color="text-orange-600"
          />
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-2">Final Amount</h2>
        <p className="text-slate-300 text-sm mb-4">
          Guru Nanak Dairy Net (Inward − Return) minus Basant Dairy's Inward total
          (excluding Buffalo Milk, Cow Milk, Lifafa & Rubber)
        </p>
        <div className="text-sm text-slate-300 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Guru Nanak Net</span>
            <span>{fmt(guruNanakNet)}</span>
          </div>
          <div className="flex justify-between">
            <span>− Basant Excluded Inward</span>
            <span>{fmt(basantExcludedInward)}</span>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
          <span className="font-medium">Final Amount</span>
          <span className="text-2xl font-bold text-emerald-400">{fmt(finalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

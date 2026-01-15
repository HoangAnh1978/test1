"use client";

import { useState, useCallback } from "react";
import { RouteAddress, RouteAttribute } from "../types/ticket";

interface RouteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteAddress[];
  onSave: (route: RouteAddress[]) => void;
}

const attributeOptions: { value: RouteAttribute; label: string }[] = [
  { value: "rong", label: "Rong" },
  { value: "giao", label: "Giao" },
  { value: "nhan", label: "Nhan" },
  { value: "giao-nhan", label: "Giao/Nhan" },
  { value: "ve-bai", label: "Ve bai" },
];

const attributeColors: Record<string, string> = {
  rong: "bg-gray-100 border-l-gray-400 dark:bg-gray-800/40",
  giao: "bg-emerald-100 border-l-emerald-500 dark:bg-emerald-900/40",
  nhan: "bg-sky-100 border-l-sky-500 dark:bg-sky-900/40",
  "giao-nhan": "bg-violet-100 border-l-violet-500 dark:bg-violet-900/40",
  "ve-bai": "bg-amber-100 border-l-amber-500 dark:bg-amber-900/40",
};

const attributeBadgeColors: Record<string, string> = {
  rong: "bg-gray-400 text-white",
  giao: "bg-emerald-500 text-white",
  nhan: "bg-sky-500 text-white",
  "giao-nhan": "bg-violet-500 text-white",
  "ve-bai": "bg-amber-500 text-white",
};

const attributeRingColors: Record<string, string> = {
  rong: "ring-gray-400",
  giao: "ring-emerald-500",
  nhan: "ring-sky-500",
  "giao-nhan": "ring-violet-500",
  "ve-bai": "ring-amber-500",
};

const attributeTextColors: Record<string, string> = {
  rong: "text-gray-600 dark:text-gray-400",
  giao: "text-emerald-700 dark:text-emerald-300",
  nhan: "text-sky-700 dark:text-sky-300",
  "giao-nhan": "text-violet-700 dark:text-violet-300",
  "ve-bai": "text-amber-700 dark:text-amber-300",
};

const attributeNumberColors: Record<string, string> = {
  rong: "bg-gray-400",
  giao: "bg-emerald-500",
  nhan: "bg-sky-500",
  "giao-nhan": "bg-violet-500",
  "ve-bai": "bg-amber-500",
};

export const getAttributeLabel = (attr: RouteAttribute): string => {
  const option = attributeOptions.find((o) => o.value === attr);
  return option?.label || attr;
};

export const getRouteSummary = (route: RouteAddress[]): string => {
  if (!route || route.length === 0) return "";
  return route
    .map((r) => r.address + " (" + getAttributeLabel(r.attribute) + ")")
    .join(", ");
};

export const getAttributeBadgeColor = (attr: RouteAttribute): string => {
  return attributeBadgeColors[attr] || attributeBadgeColors["giao"];
};

export default function RouteEditModal({
  isOpen,
  onClose,
  route,
  onSave,
}: RouteEditModalProps) {
  const generateId = useCallback(() => {
    return "route-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  }, []);

  const [addresses, setAddresses] = useState<RouteAddress[]>(() => 
    route?.length > 0 ? [...route] : []
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  if (isOpen && !hasInitialized) {
    let newAddresses: RouteAddress[];
    if (route?.length > 0) {
      newAddresses = [...route];
    } else {
      newAddresses = [{ id: "route-" + Date.now() + "-init", address: "", attribute: "rong" }];
    }
    if (JSON.stringify(newAddresses) !== JSON.stringify(addresses)) {
      setAddresses(newAddresses);
    }
    setHasInitialized(true);
  }

  if (!isOpen && hasInitialized) {
    setHasInitialized(false);
  }

  const addAddress = () => {
    setAddresses([
      ...addresses,
      { id: generateId(), address: "", attribute: "rong" },
    ]);
  };

  const updateAddress = (
    id: string,
    field: "address" | "attribute",
    value: string,
    isLastItem: boolean = false
  ) => {
    setAddresses((prev) => {
      const updated = prev.map((addr) =>
        addr.id === id ? { ...addr, [field]: value } : addr
      );
      
      if (field === "address" && isLastItem && value.trim() !== "") {
        const lastAddr = updated[updated.length - 1];
        if (lastAddr && lastAddr.id === id) {
          return [
            ...updated,
            { id: generateId(), address: "", attribute: "rong" as RouteAttribute },
          ];
        }
      }
      
      return updated;
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSave = () => {
    const validAddresses = addresses.filter((addr) => addr.address.trim());
    onSave(validAddresses);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chi tiet Tuyen duong
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {addresses.map((addr, index) => {
              const isLastItem = index === addresses.length - 1;
              const bgColor = attributeColors[addr.attribute] || attributeColors["giao"];
              const numColor = attributeNumberColors[addr.attribute] || attributeNumberColors["giao"];
              
              return (
                <div
                  key={addr.id}
                  className={"flex items-start gap-3 p-4 rounded-xl border-l-4 transition-all shadow-sm hover:shadow-md " + bgColor}
                >
                  <div className={"flex-shrink-0 w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-md " + numColor}>
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={addr.address}
                      onChange={(e) => updateAddress(addr.id, "address", e.target.value, isLastItem)}
                      placeholder={isLastItem && addr.address === "" ? "Nhap dia chi de them moi..." : "Nhap dia chi..."}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white bg-white"
                      autoFocus={index === 0 && !addr.address}
                    />
                    
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-2">
                        {attributeOptions.map((opt) => {
                          const isSelected = addr.attribute === opt.value;
                          const selectedClass = attributeBadgeColors[opt.value] + " " + attributeRingColors[opt.value] + " px-3 py-1.5 text-xs font-semibold rounded-full transition-all shadow-lg ring-2 ring-offset-2";
                          const normalClass = "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 px-3 py-1.5 text-xs font-medium rounded-full transition-all hover:shadow";
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateAddress(addr.id, "attribute", opt.value)}
                              className={isSelected ? selectedClass : normalClass}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="flex-shrink-0 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Xoa dia chi"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Nut them dia chi moi */}
            <button
              onClick={addAddress}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">
                {addresses.length === 0 ? "Them dia chi dau tien" : "Them dia chi moi"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {addresses.filter(a => a.address.trim()).length} dia chi
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Huy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Luu thay doi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

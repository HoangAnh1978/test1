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
  { value: "giao", label: "Giao" },
  { value: "nhan", label: "Nhan" },
  { value: "giao-nhan", label: "Giao/Nhan" },
  { value: "ve-bai", label: "Ve bai" },
  { value: "khong-chon", label: "Khong chon" },
];

const attributeColors: Record<RouteAttribute, string> = {
  giao: "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
  nhan: "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
  "giao-nhan": "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700",
  "ve-bai": "bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700",
  "khong-chon": "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
};

const attributeBadgeColors: Record<RouteAttribute, string> = {
  giao: "bg-green-500 text-white",
  nhan: "bg-blue-500 text-white",
  "giao-nhan": "bg-purple-500 text-white",
  "ve-bai": "bg-orange-500 text-white",
  "khong-chon": "bg-gray-500 text-white",
};

export const getAttributeLabel = (attr: RouteAttribute): string => {
  const option = attributeOptions.find((o) => o.value === attr);
  return option?.label || attr;
};

export const getRouteSummary = (route: RouteAddress[]): string => {
  if (!route || route.length === 0) return "";
  return route
    .map((r) => `${r.address} (${getAttributeLabel(r.attribute)})`)
    .join(", ");
};

export const getAttributeBadgeColor = (attr: RouteAttribute): string => {
  return attributeBadgeColors[attr] || attributeBadgeColors["khong-chon"];
};

export default function RouteEditModal({
  isOpen,
  onClose,
  route,
  onSave,
}: RouteEditModalProps) {
  const [addresses, setAddresses] = useState<RouteAddress[]>(() => 
    route?.length > 0 ? [...route] : []
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  if (isOpen && !hasInitialized) {
    const newAddresses = route?.length > 0 ? [...route] : [];
    if (JSON.stringify(newAddresses) !== JSON.stringify(addresses)) {
      setAddresses(newAddresses);
    }
    setHasInitialized(true);
  }

  if (!isOpen && hasInitialized) {
    setHasInitialized(false);
  }

  const generateId = useCallback(() => {
    return `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addAddress = () => {
    setAddresses([
      ...addresses,
      { id: generateId(), address: "", attribute: "khong-chon" },
    ]);
  };

  const updateAddress = (
    id: string,
    field: "address" | "attribute",
    value: string
  ) => {
    setAddresses(
      addresses.map((addr) =>
        addr.id === id ? { ...addr, [field]: value } : addr
      )
    );
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chi tiet Tuyen duong
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Chua co dia chi nao trong tuyen duong
              </p>
              <button
                onClick={addAddress}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Them dia chi dau tien
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, index) => (
                <div
                  key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                    attributeColors[addr.attribute]
                  }`}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-500 text-white text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={addr.address}
                      onChange={(e) =>
                        updateAddress(addr.id, "address", e.target.value)
                      }
                      placeholder="Nhap dia chi..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex-shrink-0 w-36">
                    <select
                      value={addr.attribute}
                      onChange={(e) =>
                        updateAddress(
                          addr.id,
                          "attribute",
                          e.target.value as RouteAttribute
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {attributeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="flex-shrink-0 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Xoa dia chi"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            onClick={addAddress}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Them dia chi
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Huy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Luu thay doi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

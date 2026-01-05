"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, User } from "../types/ticket";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "in-progress":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const typeColors: Record<string, string> = {
  bug: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  feature: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  task: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  improvement: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const statusOptions: Ticket["status"][] = ["open", "in-progress", "resolved", "closed"];
const priorityOptions: Ticket["priority"][] = ["low", "medium", "high", "critical"];
const typeOptions: Ticket["type"][] = ["bug", "feature", "task", "improvement"];
const pageSizeOptions = [10, 20, 50, 100];

type SortField = "id" | "title" | "status" | "priority" | "type" | "assignee" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";
type DateFilterPreset = "today" | "yesterday" | "this-week" | "this-month" | "custom" | "all";

interface NewTicketForm {
  title: string;
  description: string;
  type: Ticket["type"];
  status: Ticket["status"];
  priority: Ticket["priority"];
  assigneeId: string;
  customer: string;
}

const defaultNewTicket: NewTicketForm = {
  title: "",
  description: "",
  type: "task",
  status: "open",
  priority: "medium",
  assigneeId: "",
  customer: "",
};

// Helper to get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};
const getStartOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [customerValue, setCustomerValue] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  
  // Date filter states
  const [dateFilterPreset, setDateFilterPreset] = useState<DateFilterPreset>("today");
  const [dateFrom, setDateFrom] = useState<string>(getToday());
  const [dateTo, setDateTo] = useState<string>(getToday());
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Add new row states
  const [showAddRow, setShowAddRow] = useState(false);
  const [newTicket, setNewTicket] = useState<NewTicketForm>(defaultNewTicket);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilterPreset, dateFrom, dateTo, sortField, sortDirection]);

  // Apply date preset
  const applyDatePreset = (preset: DateFilterPreset) => {
    setDateFilterPreset(preset);
    const today = getToday();
    
    switch (preset) {
      case "today":
        setDateFrom(today);
        setDateTo(today);
        break;
      case "yesterday":
        const yesterday = getYesterday();
        setDateFrom(yesterday);
        setDateTo(yesterday);
        break;
      case "this-week":
        setDateFrom(getStartOfWeek());
        setDateTo(today);
        break;
      case "this-month":
        setDateFrom(getStartOfMonth());
        setDateTo(today);
        break;
      case "all":
        setDateFrom("");
        setDateTo("");
        break;
      case "custom":
        // Keep current values for custom
        break;
    }
    if (preset !== "custom") {
      setShowDateFilter(false);
    }
  };

  // Filter tickets by date
  const filterByDate = (ticket: Ticket) => {
    if (dateFilterPreset === "all" || (!dateFrom && !dateTo)) return true;
    
    const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
    
    if (dateFrom && dateTo) {
      return ticketDate >= dateFrom && ticketDate <= dateTo;
    } else if (dateFrom) {
      return ticketDate >= dateFrom;
    } else if (dateTo) {
      return ticketDate <= dateTo;
    }
    return true;
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    // Date filter
    if (!filterByDate(ticket)) return false;
    
    // Search filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ticket.title.toLowerCase().includes(q) ||
      ticket.description.toLowerCase().includes(q) ||
      ticket.id.toLowerCase().includes(q) ||
      ticket.details?.customer?.toLowerCase().includes(q) ||
      ticket.reporter.name.toLowerCase().includes(q) ||
      ticket.assignee?.name.toLowerCase().includes(q)
    );
  });

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "id":
        comparison = parseInt(a.id) - parseInt(b.id);
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "status":
        comparison = statusOptions.indexOf(a.status) - statusOptions.indexOf(b.status);
        break;
      case "priority":
        comparison = priorityOptions.indexOf(a.priority) - priorityOptions.indexOf(b.priority);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "assignee":
        comparison = (a.assignee?.name || "").localeCompare(b.assignee?.name || "");
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedTickets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTickets = sortedTickets.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      setTickets(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setAllUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicket = async (ticketId: string, body: object) => {
    setUpdating(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setTickets(tickets.map((t) => (t.id === ticketId ? updated : t)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const createTicket = async () => {
    if (!newTicket.title.trim()) {
      alert("Vui long nhap tieu de ticket");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTicket.title,
          description: newTicket.description,
          type: newTicket.type,
          status: newTicket.status,
          priority: newTicket.priority,
          assigneeId: newTicket.assigneeId || undefined,
          reporterId: "1", // Default reporter
          details: {
            content: newTicket.description,
            customer: newTicket.customer,
            startDate: getToday(),
            endDate: getToday(),
            cost: 0,
            additionalCost: 0,
          },
        }),
      });
      
      if (!res.ok) throw new Error("Failed to create ticket");
      
      const created = await res.json();
      setTickets([created, ...tickets]);
      setNewTicket(defaultNewTicket);
      setShowAddRow(false);
      
      // Go to first page to see the new ticket
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  const cancelAddRow = () => {
    setShowAddRow(false);
    setNewTicket(defaultNewTicket);
  };

  const handleStatusChange = (e: React.MouseEvent, id: string, status: Ticket["status"]) => {
    e.preventDefault();
    e.stopPropagation();
    updateTicket(id, { status });
    setEditingStatus(null);
  };

  const handlePriorityChange = (e: React.MouseEvent, id: string, priority: Ticket["priority"]) => {
    e.preventDefault();
    e.stopPropagation();
    updateTicket(id, { priority });
    setEditingPriority(null);
  };

  const handleAssigneeChange = (e: React.MouseEvent, id: string, assigneeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateTicket(id, { assigneeId: assigneeId || null });
    setEditingAssignee(null);
  };

  const handleCustomerEdit = (ticket: Ticket) => {
    setEditingCustomer(ticket.id);
    setCustomerValue(ticket.details?.customer || "");
    setEditingStatus(null);
    setEditingPriority(null);
    setEditingAssignee(null);
  };

  const handleCustomerSave = async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      await updateTicket(ticketId, {
        details: {
          ...ticket.details,
          customer: customerValue,
        }
      });
    }
    setEditingCustomer(null);
    setCustomerValue("");
  };

  const handleCustomerKeyDown = (e: React.KeyboardEvent, ticketId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomerSave(ticketId);
    } else if (e.key === "Escape") {
      setEditingCustomer(null);
      setCustomerValue("");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedTickets.size === paginatedTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(paginatedTickets.map((t) => t.id)));
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");
  const stopProp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const getDateFilterLabel = () => {
    switch (dateFilterPreset) {
      case "today": return "Hom nay";
      case "yesterday": return "Hom qua";
      case "this-week": return "Tuan nay";
      case "this-month": return "Thang nay";
      case "all": return "Tat ca";
      case "custom": return `${dateFrom} - ${dateTo}`;
    }
  };

  // Export to Excel (CSV format)
  const handleExportExcel = () => {
    const headers = ["ID", "Tieu de", "Mo ta", "Loai", "Trang thai", "Do uu tien", "Nguoi thuc hien", "Khach hang", "Ngay tao"];
    const csvContent = [
      headers.join(","),
      ...sortedTickets.map((ticket) =>
        [
          ticket.id,
          `"${ticket.title.replace(/"/g, '""')}"`,
          `"${ticket.description.replace(/"/g, '""')}"`,
          ticket.type,
          ticket.status,
          ticket.priority,
          `"${ticket.assignee?.name || ""}"`,
          `"${ticket.details?.customer || ""}"`,
          fmtDate(ticket.createdAt),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tickets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import from Excel (CSV format)
  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert("File khong co du lieu hop le");
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      let importedCount = 0;
      let errorCount = 0;

      for (const line of dataLines) {
        try {
          // Parse CSV line (handle quoted values)
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          // Skip if not enough values or empty title
          if (values.length < 2 || !values[1]) continue;

          const ticketData = {
            title: values[1] || "Imported Ticket",
            description: values[2] || "",
            type: (typeOptions.includes(values[3] as Ticket["type"]) ? values[3] : "task") as Ticket["type"],
            status: (statusOptions.includes(values[4] as Ticket["status"]) ? values[4] : "open") as Ticket["status"],
            priority: (priorityOptions.includes(values[5] as Ticket["priority"]) ? values[5] : "medium") as Ticket["priority"],
            reporterId: "1",
            details: {
              customer: values[7] || "",
              content: values[2] || "",
              startDate: getToday(),
              endDate: getToday(),
              cost: 0,
              additionalCost: 0,
            },
          };

          const res = await fetch("/api/tickets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketData),
          });

          if (res.ok) {
            importedCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      // Refresh tickets list
      await fetchTickets();
      alert(`Import hoan tat!\nThanh cong: ${importedCount}\nLoi: ${errorCount}`);
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // Print function
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Danh sach Tickets</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 10px; }
            .info { text-align: center; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
            .status-open { background: #dbeafe; color: #1e40af; }
            .status-in-progress { background: #fef3c7; color: #92400e; }
            .status-resolved { background: #d1fae5; color: #065f46; }
            .status-closed { background: #e5e7eb; color: #374151; }
            .priority-low { background: #f3f4f6; color: #4b5563; }
            .priority-medium { background: #dbeafe; color: #1d4ed8; }
            .priority-high { background: #fed7aa; color: #c2410c; }
            .priority-critical { background: #fecaca; color: #b91c1c; }
            .type-bug { background: #fecaca; color: #b91c1c; }
            .type-feature { background: #e9d5ff; color: #7c3aed; }
            .type-task { background: #dbeafe; color: #1d4ed8; }
            .type-improvement { background: #d1fae5; color: #065f46; }
            .total-row { font-weight: bold; background-color: #e8f5e9; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>Danh sach Tickets</h1>
          <p class="info">Ngay in: ${new Date().toLocaleDateString("vi-VN")} | Bo loc: ${getDateFilterLabel()} | Tong: ${sortedTickets.length} ticket</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tieu de</th>
                <th>Loai</th>
                <th>Trang thai</th>
                <th>Do uu tien</th>
                <th>Nguoi thuc hien</th>
                <th>Khach hang</th>
                <th>Ngay tao</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTickets.map((ticket) => `
                <tr>
                  <td>#${ticket.id}</td>
                  <td>${ticket.title}</td>
                  <td><span class="badge type-${ticket.type}">${ticket.type}</span></td>
                  <td><span class="badge status-${ticket.status}">${ticket.status.replace("-", " ")}</span></td>
                  <td><span class="badge priority-${ticket.priority}">${ticket.priority}</span></td>
                  <td>${ticket.assignee?.name || "-"}</td>
                  <td>${ticket.details?.customer || "-"}</td>
                  <td>${fmtDate(ticket.createdAt)}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="8" style="text-align: right;">TONG CONG: ${sortedTickets.length} ticket</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-700">Error: {error}</p>
        <button onClick={() => { setError(null); fetchTickets(); }} className="mt-2 text-sm text-red-600 underline">
          Thu lai
        </button>
      </div>
    );

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh sach Tickets</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quan ly tickets trong he thong
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Date Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">{getDateFilterLabel()}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDateFilter && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-30 min-w-[280px]">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { value: "today", label: "Hom nay" },
                      { value: "yesterday", label: "Hom qua" },
                      { value: "this-week", label: "Tuan nay" },
                      { value: "this-month", label: "Thang nay" },
                      { value: "all", label: "Tat ca" },
                      { value: "custom", label: "Tuy chon" },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => applyDatePreset(preset.value as DateFilterPreset)}
                        className={`px-2 py-1.5 text-xs rounded ${
                          dateFilterPreset === preset.value
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                {dateFilterPreset === "custom" && (
                  <div className="p-3 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tu ngay</label>
                      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Den ngay</label>
                      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    </div>
                    <button onClick={() => setShowDateFilter(false)} className="w-full py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Ap dung</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[300px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tim kiem theo tieu de, mo ta, khach hang..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Clear Filters */}
          {(dateFilterPreset !== "today" || searchQuery) && (
            <button
              onClick={() => { applyDatePreset("today"); setSearchQuery(""); }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xoa bo loc
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddRow(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              title="Them ticket moi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tao moi
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              title="Xuat Excel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors cursor-pointer" title="Nhap tu Excel">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
              <input
                type="file"
                accept=".csv"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              title="In danh sach"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In
            </button>
          </div>
        </div>
      </div>

      {/* Table Container with Fixed Header and Scrollable Body */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-h-0">
        {/* Scrollable Container for both Header and Body */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[1200px]">
            {/* Sticky Table Header */}
            <div className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
              <div className="flex">
                {/* Frozen Left Columns Header */}
                <div className="flex flex-shrink-0 sticky left-0 z-30 bg-gray-100 dark:bg-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="w-10 px-3 py-3 flex items-center justify-center border-r border-gray-300 dark:border-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedTickets.size === paginatedTickets.length && paginatedTickets.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-16 px-3 py-3 border-r border-gray-300 dark:border-gray-600">
                    <button onClick={() => handleSort("id")} className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase hover:text-gray-900">
                      ID <SortIcon field="id" />
                    </button>
                  </div>
                  <div className="w-64 px-3 py-3 border-r border-gray-300 dark:border-gray-600">
                    <button onClick={() => handleSort("title")} className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase hover:text-gray-900">
                      Tieu de <SortIcon field="title" />
                    </button>
                  </div>
                </div>
                {/* Scrollable Columns Header */}
                <div className="flex flex-1">
                  <div className="w-24 px-3 py-3">
                    <button onClick={() => handleSort("type")} className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase hover:text-gray-900">
                      Loai <SortIcon field="type" />
                    </button>
                  </div>
                  <div className="w-28 px-3 py-3">
                    <button onClick={() => handleSort("status")} className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase hover:text-gray-900">
                      Trang thai <SortIcon field="status" />
                    </button>
                  </div>
                  <div className="w-28 px-3 py-3">
                    <button onClick={() => handleSort("priority")} className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase hover:text-gray-900">
                      Uu tien <SortIcon field="priority" />
                    </button>
                  </div>
                  <div className="w-40 px-3 py-3">
                    <button onClick={() => handleSort("assignee")} className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase hover:text-gray-900">
                      Nguoi thuc hien <SortIcon field="assignee" />
                    </button>
                  </div>
                  <div className="w-36 px-3 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                    Khach hang
                  </div>
                  <div className="w-28 px-3 py-3">
                    <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase hover:text-gray-900">
                      Ngay tao <SortIcon field="createdAt" />
                    </button>
                  </div>
                  <div className="w-24 px-3 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase text-center">
                    Hanh dong
                  </div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            {paginatedTickets.length === 0 && !showAddRow ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || dateFilterPreset !== "all" ? "Khong tim thay ticket phu hop." : "Chua co ticket nao."}
                </p>
                <button 
                  onClick={() => setShowAddRow(true)}
                  className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tao ticket dau tien
                </button>
              </div>
            ) : (
              <>
                {paginatedTickets.map((ticket) => (
                  <div key={ticket.id} className={`flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedTickets.has(ticket.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                    {/* Frozen Left Columns */}
                    <div className={`flex flex-shrink-0 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${selectedTickets.has(ticket.id) ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`}>
                      <div className="w-10 px-3 py-2 flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedTickets.has(ticket.id)}
                          onChange={() => handleSelectTicket(ticket.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-16 px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                        <Link href={`/tickets/${ticket.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                          #{ticket.id}
                        </Link>
                      </div>
                      <div className="w-64 px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                        <Link href={`/tickets/${ticket.id}`} className="block">
                          <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 truncate">
                            {ticket.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {ticket.description}
                          </div>
                        </Link>
                      </div>
                    </div>
                    {/* Scrollable Columns */}
                    <div className="flex flex-1">
                      <div className="w-24 px-3 py-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[ticket.type]}`}>
                          {ticket.type}
                        </span>
                      </div>
                      <div className="w-28 px-3 py-2 relative">
                        <button
                          onClick={(e) => { stopProp(e); setEditingStatus(editingStatus === ticket.id ? null : ticket.id); setEditingPriority(null); setEditingAssignee(null); setEditingCustomer(null); }}
                          disabled={updating === ticket.id}
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[ticket.status]} hover:ring-2 hover:ring-blue-400 transition-all ${updating === ticket.id ? "opacity-50" : ""}`}
                        >
                          {ticket.status.replace("-", " ")}
                        </button>
                        {editingStatus === ticket.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-30 min-w-[140px]">
                            {statusOptions.map((s) => (
                              <button key={s} onClick={(e) => handleStatusChange(e, ticket.id, s)} className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${ticket.status === s ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""}`}>
                                <span className={`inline-block px-2 py-0.5 rounded-full ${statusColors[s]}`}>{s.replace("-", " ")}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-28 px-3 py-2 relative">
                        <button
                          onClick={(e) => { stopProp(e); setEditingPriority(editingPriority === ticket.id ? null : ticket.id); setEditingStatus(null); setEditingAssignee(null); setEditingCustomer(null); }}
                          disabled={updating === ticket.id}
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[ticket.priority]} hover:ring-2 hover:ring-blue-400 transition-all ${updating === ticket.id ? "opacity-50" : ""}`}
                        >
                          {ticket.priority}
                        </button>
                        {editingPriority === ticket.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-30 min-w-[120px]">
                            {priorityOptions.map((p) => (
                              <button key={p} onClick={(e) => handlePriorityChange(e, ticket.id, p)} className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${ticket.priority === p ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""}`}>
                                <span className={`inline-block px-2 py-0.5 rounded-full ${priorityColors[p]}`}>{p}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-40 px-3 py-2 relative">
                        <button
                          onClick={(e) => { stopProp(e); setEditingAssignee(editingAssignee === ticket.id ? null : ticket.id); setEditingStatus(null); setEditingPriority(null); setEditingCustomer(null); }}
                          disabled={updating === ticket.id}
                          className={`flex items-center gap-2 px-2 py-0.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:ring-2 hover:ring-blue-400 transition-all ${updating === ticket.id ? "opacity-50" : ""}`}
                        >
                          {ticket.assignee ? (
                            <>
                              {ticket.assignee.avatar && <img src={ticket.assignee.avatar} alt="" className="w-4 h-4 rounded-full" />}
                              <span className="text-gray-900 dark:text-white truncate">{ticket.assignee.name}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Chua chon</span>
                          )}
                          <svg className="w-3 h-3 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {editingAssignee === ticket.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-30 min-w-[180px] max-h-[200px] overflow-y-auto">
                            <button 
                              onClick={(e) => handleAssigneeChange(e, ticket.id, "")} 
                              className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg ${!ticket.assignee ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""}`}
                            >
                              <span className="text-gray-400 italic">Khong chon</span>
                            </button>
                            {allUsers.map((user) => (
                              <button 
                                key={user.id} 
                                onClick={(e) => handleAssigneeChange(e, ticket.id, user.id)} 
                                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg flex items-center gap-2 ${ticket.assignee?.id === user.id ? "bg-gray-100 dark:bg-gray-700 font-semibold" : ""}`}
                              >
                                {user.avatar && <img src={user.avatar} alt="" className="w-5 h-5 rounded-full" />}
                                <span>{user.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-36 px-3 py-2 relative">
                        {editingCustomer === ticket.id ? (
                          <input
                            type="text"
                            value={customerValue}
                            onChange={(e) => setCustomerValue(e.target.value)}
                            onBlur={() => handleCustomerSave(ticket.id)}
                            onKeyDown={(e) => handleCustomerKeyDown(e, ticket.id)}
                            className="w-full px-2 py-1 text-xs border-2 border-blue-500 rounded focus:outline-none dark:bg-gray-700 dark:text-white"
                            autoFocus
                            placeholder="Nhap khach hang..."
                          />
                        ) : (
                          <button
                            onClick={(e) => { stopProp(e); handleCustomerEdit(ticket); }}
                            disabled={updating === ticket.id}
                            className={`w-full text-left px-2 py-0.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:ring-2 hover:ring-blue-400 transition-all truncate ${updating === ticket.id ? "opacity-50" : ""}`}
                          >
                            <span className={ticket.details?.customer ? "text-gray-600 dark:text-gray-300" : "text-gray-400 italic"}>
                              {ticket.details?.customer || "Click de nhap"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Row */}
                {showAddRow && (
                  <div className="flex border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                    {/* Frozen Left Columns */}
                    <div className="flex flex-shrink-0 sticky left-0 z-10 bg-green-50 dark:bg-green-900/20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="w-10 px-3 py-2 flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
                        <span className="text-green-600 text-lg">+</span>
                      </div>
                      <div className="w-16 px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-400 italic">Moi</span>
                      </div>
                      <div className="w-64 px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                        <input
                          type="text"
                          value={newTicket.title}
                          onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                          placeholder="Nhap tieu de..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                          placeholder="Mo ta ngan..."
                          className="w-full px-2 py-1 mt-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    {/* Scrollable Columns */}
                    <div className="flex flex-1">
                      <div className="w-24 px-3 py-2">
                        <select
                          value={newTicket.type}
                          onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value as Ticket["type"] })}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        >
                          {typeOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-28 px-3 py-2">
                        <select
                          value={newTicket.status}
                          onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value as Ticket["status"] })}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s.replace("-", " ")}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-28 px-3 py-2">
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as Ticket["priority"] })}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        >
                          {priorityOptions.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-40 px-3 py-2">
                        <select
                          value={newTicket.assigneeId}
                          onChange={(e) => setNewTicket({ ...newTicket, assigneeId: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Chua chon</option>
                          {allUsers.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-36 px-3 py-2">
                        <input
                          type="text"
                          value={newTicket.customer}
                          onChange={(e) => setNewTicket({ ...newTicket, customer: e.target.value })}
                          placeholder="Khach hang..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="w-28 px-3 py-2">
                        <span className="text-sm text-gray-400">{fmtDate(new Date().toISOString())}</span>
                      </div>
                      <div className="w-24 px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={createTicket}
                            disabled={creating}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors disabled:opacity-50"
                            title="Luu"
                          >
                            {creating ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={cancelAddRow}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Huy"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fixed Footer - Pagination */}
        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-600 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Total and Page Size */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tong: {sortedTickets.length} ticket</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Hien thi:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>{size} dong</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Center: Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {getPageNumbers().map((page, idx) => (
                  typeof page === 'number' ? (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 px-2 text-sm rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={idx} className="px-1 text-gray-400">...</span>
                  )
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Right: Page info */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Trang {currentPage} / {totalPages || 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
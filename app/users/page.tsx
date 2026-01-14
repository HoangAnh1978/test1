"use client";

import { useState, useRef } from "react";

interface SalaryDetail {
  tongLuong: number;
  bhxh: number;
  bhtn: number;
  thueTNCN: number;
  thucThu: number;
}

interface User {
  stt: number;
  ten: string;
  tuoi: number;
  ngaySinh: string;
  diaChi: string;
  soDienThoai: string;
  ghiChu: string;
  luong: SalaryDetail;
}

interface NewUserForm {
  ten: string;
  ngaySinh: string;
  diaChi: string;
  soDienThoai: string;
  ghiChu: string;
  tongLuong: number;
  bhxh: number;
  bhtn: number;
  thueTNCN: number;
}

const defaultNewUser: NewUserForm = {
  ten: "",
  ngaySinh: "",
  diaChi: "",
  soDienThoai: "",
  ghiChu: "",
  tongLuong: 0,
  bhxh: 0,
  bhtn: 0,
  thueTNCN: 0,
};

// Du lieu 20 nguoi dung de test scroll
const initialUsers: User[] = [
  { stt: 1, ten: "Nguyen Van An", tuoi: 28, ngaySinh: "1996-05-15", diaChi: "123 Nguyen Hue, Quan 1, TP.HCM", soDienThoai: "0901234567", ghiChu: "Nhan vien IT", luong: { tongLuong: 25000000, bhxh: 2000000, bhtn: 250000, thueTNCN: 1500000, thucThu: 21250000 } },
  { stt: 2, ten: "Tran Thi Binh", tuoi: 32, ngaySinh: "1992-08-22", diaChi: "456 Le Loi, Quan 3, TP.HCM", soDienThoai: "0912345678", ghiChu: "Quan ly du an", luong: { tongLuong: 35000000, bhxh: 2800000, bhtn: 350000, thueTNCN: 3200000, thucThu: 28650000 } },
  { stt: 3, ten: "Le Hoang Cuong", tuoi: 25, ngaySinh: "1999-03-10", diaChi: "789 Hai Ba Trung, Quan 1, TP.HCM", soDienThoai: "0923456789", ghiChu: "Lap trinh vien", luong: { tongLuong: 20000000, bhxh: 1600000, bhtn: 200000, thueTNCN: 800000, thucThu: 17400000 } },
  { stt: 4, ten: "Pham Minh Duong", tuoi: 35, ngaySinh: "1989-12-01", diaChi: "321 Dien Bien Phu, Quan Binh Thanh, TP.HCM", soDienThoai: "0934567890", ghiChu: "Giam doc ky thuat", luong: { tongLuong: 50000000, bhxh: 4000000, bhtn: 500000, thueTNCN: 6500000, thucThu: 39000000 } },
  { stt: 5, ten: "Hoang Thi Em", tuoi: 27, ngaySinh: "1997-07-18", diaChi: "654 Cach Mang Thang 8, Quan 10, TP.HCM", soDienThoai: "0945678901", ghiChu: "Thiet ke UI/UX", luong: { tongLuong: 22000000, bhxh: 1760000, bhtn: 220000, thueTNCN: 1100000, thucThu: 18920000 } },
  { stt: 6, ten: "Vo Van Phuc", tuoi: 30, ngaySinh: "1994-02-28", diaChi: "111 Ly Tu Trong, Quan 1, TP.HCM", soDienThoai: "0956789012", ghiChu: "Backend Developer", luong: { tongLuong: 28000000, bhxh: 2240000, bhtn: 280000, thueTNCN: 1800000, thucThu: 23680000 } },
  { stt: 7, ten: "Dang Thi Giang", tuoi: 29, ngaySinh: "1995-06-05", diaChi: "222 Nguyen Thi Minh Khai, Quan 3, TP.HCM", soDienThoai: "0967890123", ghiChu: "Frontend Developer", luong: { tongLuong: 26000000, bhxh: 2080000, bhtn: 260000, thueTNCN: 1600000, thucThu: 22060000 } },
  { stt: 8, ten: "Bui Quoc Hung", tuoi: 33, ngaySinh: "1991-09-12", diaChi: "333 Vo Van Tan, Quan 3, TP.HCM", soDienThoai: "0978901234", ghiChu: "DevOps Engineer", luong: { tongLuong: 32000000, bhxh: 2560000, bhtn: 320000, thueTNCN: 2800000, thucThu: 26320000 } },
  { stt: 9, ten: "Nguyen Thi Lan", tuoi: 26, ngaySinh: "1998-11-20", diaChi: "444 Tran Hung Dao, Quan 5, TP.HCM", soDienThoai: "0989012345", ghiChu: "QA Engineer", luong: { tongLuong: 18000000, bhxh: 1440000, bhtn: 180000, thueTNCN: 600000, thucThu: 15780000 } },
  { stt: 10, ten: "Tran Van Khanh", tuoi: 31, ngaySinh: "1993-04-15", diaChi: "555 Le Van Sy, Quan Phu Nhuan, TP.HCM", soDienThoai: "0990123456", ghiChu: "Mobile Developer", luong: { tongLuong: 30000000, bhxh: 2400000, bhtn: 300000, thueTNCN: 2400000, thucThu: 24900000 } },
  { stt: 11, ten: "Le Thi Mai", tuoi: 24, ngaySinh: "2000-01-08", diaChi: "666 Phan Xich Long, Quan Phu Nhuan, TP.HCM", soDienThoai: "0901234568", ghiChu: "Junior Developer", luong: { tongLuong: 15000000, bhxh: 1200000, bhtn: 150000, thueTNCN: 400000, thucThu: 13250000 } },
  { stt: 12, ten: "Pham Van Nam", tuoi: 38, ngaySinh: "1986-07-25", diaChi: "777 Nguyen Van Cu, Quan 5, TP.HCM", soDienThoai: "0912345679", ghiChu: "Technical Lead", luong: { tongLuong: 45000000, bhxh: 3600000, bhtn: 450000, thueTNCN: 5500000, thucThu: 35450000 } },
  { stt: 13, ten: "Hoang Van Phong", tuoi: 34, ngaySinh: "1990-03-18", diaChi: "888 Ba Thang Hai, Quan 10, TP.HCM", soDienThoai: "0923456790", ghiChu: "Product Manager", luong: { tongLuong: 40000000, bhxh: 3200000, bhtn: 400000, thueTNCN: 4800000, thucThu: 31600000 } },
  { stt: 14, ten: "Nguyen Thi Oanh", tuoi: 28, ngaySinh: "1996-10-30", diaChi: "999 Truong Chinh, Quan Tan Binh, TP.HCM", soDienThoai: "0934567891", ghiChu: "Business Analyst", luong: { tongLuong: 27000000, bhxh: 2160000, bhtn: 270000, thueTNCN: 1700000, thucThu: 22870000 } },
  { stt: 15, ten: "Tran Quoc Quan", tuoi: 29, ngaySinh: "1995-12-12", diaChi: "101 Cong Hoa, Quan Tan Binh, TP.HCM", soDienThoai: "0945678902", ghiChu: "Data Engineer", luong: { tongLuong: 33000000, bhxh: 2640000, bhtn: 330000, thueTNCN: 3000000, thucThu: 27030000 } },
  { stt: 16, ten: "Le Van Son", tuoi: 27, ngaySinh: "1997-08-08", diaChi: "202 Hoang Van Thu, Quan Phu Nhuan, TP.HCM", soDienThoai: "0956789013", ghiChu: "Cloud Engineer", luong: { tongLuong: 35000000, bhxh: 2800000, bhtn: 350000, thueTNCN: 3200000, thucThu: 28650000 } },
  { stt: 17, ten: "Pham Thi Thao", tuoi: 26, ngaySinh: "1998-05-22", diaChi: "303 Nguyen Dinh Chieu, Quan 3, TP.HCM", soDienThoai: "0967890124", ghiChu: "HR Manager", luong: { tongLuong: 24000000, bhxh: 1920000, bhtn: 240000, thueTNCN: 1400000, thucThu: 20440000 } },
  { stt: 18, ten: "Vo Thi Uyen", tuoi: 31, ngaySinh: "1993-09-05", diaChi: "404 Nam Ky Khoi Nghia, Quan 3, TP.HCM", soDienThoai: "0978901235", ghiChu: "Finance Manager", luong: { tongLuong: 38000000, bhxh: 3040000, bhtn: 380000, thueTNCN: 4200000, thucThu: 30380000 } },
  { stt: 19, ten: "Dang Van Vinh", tuoi: 36, ngaySinh: "1988-02-14", diaChi: "505 Pasteur, Quan 1, TP.HCM", soDienThoai: "0989012346", ghiChu: "Solution Architect", luong: { tongLuong: 55000000, bhxh: 4400000, bhtn: 550000, thueTNCN: 7500000, thucThu: 42550000 } },
  { stt: 20, ten: "Bui Thi Xuan", tuoi: 25, ngaySinh: "1999-11-11", diaChi: "606 Le Duan, Quan 1, TP.HCM", soDienThoai: "0990123457", ghiChu: "Marketing Executive", luong: { tongLuong: 19000000, bhxh: 1520000, bhtn: 190000, thueTNCN: 700000, thucThu: 16590000 } },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [editingLuong, setEditingLuong] = useState<SalaryDetail | null>(null);
  const [editingInlineIndex, setEditingInlineIndex] = useState<number | null>(null);
  const [inlineValue, setInlineValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const tableRef = useRef<HTMLDivElement>(null);

  // Add new user states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>(defaultNewUser);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const calculateThucThu = (luong: SalaryDetail | NewUserForm) => {
    return luong.tongLuong - luong.bhxh - luong.bhtn - luong.thueTNCN;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Filter users based on single search query (search in ten, diaChi, soDienThoai, ghiChu)
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.ten.toLowerCase().includes(q) ||
      user.diaChi.toLowerCase().includes(q) ||
      user.soDienThoai.includes(q) ||
      user.ghiChu.toLowerCase().includes(q)
    );
  });

  // Calculate total thuc thu
  const totalThucThu = filteredUsers.reduce((sum, user) => sum + user.luong.thucThu, 0);

  // Validate new user form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newUser.ten.trim()) {
      errors.ten = "Ten khong duoc de trong";
    }
    if (!newUser.ngaySinh) {
      errors.ngaySinh = "Ngay sinh khong duoc de trong";
    }
    if (!newUser.soDienThoai.trim()) {
      errors.soDienThoai = "So dien thoai khong duoc de trong";
    } else if (!/^[0-9]{10,11}$/.test(newUser.soDienThoai)) {
      errors.soDienThoai = "So dien thoai khong hop le (10-11 so)";
    }
    if (!newUser.diaChi.trim()) {
      errors.diaChi = "Dia chi khong duoc de trong";
    }
    if (newUser.tongLuong <= 0) {
      errors.tongLuong = "Tong luong phai lon hon 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add new user
  const handleAddUser = () => {
    if (!validateForm()) return;

    const maxStt = users.length > 0 ? Math.max(...users.map(u => u.stt)) : 0;
    const thucThu = calculateThucThu(newUser);
    
    const newUserData: User = {
      stt: maxStt + 1,
      ten: newUser.ten.trim(),
      tuoi: calculateAge(newUser.ngaySinh),
      ngaySinh: newUser.ngaySinh,
      diaChi: newUser.diaChi.trim(),
      soDienThoai: newUser.soDienThoai.trim(),
      ghiChu: newUser.ghiChu.trim(),
      luong: {
        tongLuong: newUser.tongLuong,
        bhxh: newUser.bhxh,
        bhtn: newUser.bhtn,
        thueTNCN: newUser.thueTNCN,
        thucThu: thucThu,
      },
    };

    setUsers([...users, newUserData]);
    setShowAddModal(false);
    setNewUser(defaultNewUser);
    setFormErrors({});
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewUser(defaultNewUser);
    setFormErrors({});
  };

  const handleNewUserChange = (field: keyof NewUserForm, value: string | number) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNewUserNumberChange = (field: keyof NewUserForm, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
    handleNewUserChange(field, numValue);
  };

  // Export to Excel (CSV format)
  const handleExportExcel = () => {
    const headers = ["STT", "Ten", "Tuoi", "Ngay sinh", "Dia chi", "So dien thoai", "Thuc thu", "Ghi chu"];
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.stt,
          `"${user.ten}"`,
          user.tuoi,
          new Date(user.ngaySinh).toLocaleDateString("vi-VN"),
          `"${user.diaChi}"`,
          user.soDienThoai,
          user.luong.thucThu,
          `"${user.ghiChu}"`,
        ].join(",")
      ),
      ["", "", "", "", "", "TONG CONG:", totalThucThu, ""].join(","),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "danh_sach_nguoi_dung.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print function
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Danh sach nguoi dung</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; background-color: #e8f5e9; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>Danh sach nguoi dung</h1>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Ten</th>
                <th>Tuoi</th>
                <th>Ngay sinh</th>
                <th>Dia chi</th>
                <th>So dien thoai</th>
                <th>Thuc thu</th>
                <th>Ghi chu</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map((user) => `
                <tr>
                  <td>${user.stt}</td>
                  <td>${user.ten}</td>
                  <td>${user.tuoi}</td>
                  <td>${new Date(user.ngaySinh).toLocaleDateString("vi-VN")}</td>
                  <td>${user.diaChi}</td>
                  <td>${user.soDienThoai}</td>
                  <td class="text-right">${user.luong.thucThu.toLocaleString("vi-VN")} VND</td>
                  <td>${user.ghiChu}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="6" style="text-align: right;">TONG CONG:</td>
                <td class="text-right">${totalThucThu.toLocaleString("vi-VN")} VND</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 20px;">Tong cong: ${filteredUsers.length} nguoi dung</p>
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

  const handleOpenModal = (index: number) => {
    const user = filteredUsers[index];
    const originalIndex = users.findIndex((u) => u.stt === user.stt);
    setSelectedUserIndex(originalIndex);
    setEditingLuong({ ...users[originalIndex].luong });
  };

  const handleCloseModal = () => {
    setSelectedUserIndex(null);
    setEditingLuong(null);
  };

  const handleSave = () => {
    if (selectedUserIndex !== null && editingLuong) {
      const updatedUsers = [...users];
      const updatedLuong = {
        ...editingLuong,
        thucThu: calculateThucThu(editingLuong),
      };
      updatedUsers[selectedUserIndex].luong = updatedLuong;
      setUsers(updatedUsers);
      handleCloseModal();
    }
  };

  const handleInputChange = (field: keyof SalaryDetail, value: string) => {
    if (editingLuong) {
      const numValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
      const newLuong = {
        ...editingLuong,
        [field]: numValue,
      };
      if (field !== "thucThu") {
        newLuong.thucThu = calculateThucThu(newLuong);
      }
      setEditingLuong(newLuong);
    }
  };

  // Handle inline editing
  const handleInlineClick = (index: number) => {
    const user = filteredUsers[index];
    const originalIndex = users.findIndex((u) => u.stt === user.stt);
    setEditingInlineIndex(originalIndex);
    setInlineValue(users[originalIndex].luong.thucThu.toString());
  };

  const handleInlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInlineValue(value);
  };

  const handleInlineSave = (originalIndex: number) => {
    const numValue = parseFloat(inlineValue) || 0;
    const updatedUsers = [...users];
    updatedUsers[originalIndex].luong = {
      tongLuong: 0,
      bhxh: 0,
      bhtn: 0,
      thueTNCN: 0,
      thucThu: numValue,
    };
    setUsers(updatedUsers);
    setEditingInlineIndex(null);
    setInlineValue("");
  };

  const handleInlineBlur = (originalIndex: number) => {
    handleInlineSave(originalIndex);
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent, originalIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInlineSave(originalIndex);
    } else if (e.key === "Escape") {
      setEditingInlineIndex(null);
      setInlineValue("");
    }
  };

  const selectedUser = selectedUserIndex !== null ? users[selectedUserIndex] : null;

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Danh sach nguoi dung
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quan ly thong tin nguoi dung trong he thong
        </p>
      </div>

      {/* Search and Action Bar - Co dinh */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Single Search Input */}
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
              placeholder="Tim kiem theo ten, dia chi, so dien thoai, ghi chu..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              title="Them nguoi dung moi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Them moi
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              title="Export Excel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              title="In"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In
            </button>
          </div>
        </div>
      </div>

      {/* Table Container with Fixed Header, Footer and Frozen Columns */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-h-0">
        {/* Scrollable Container for Header, Body and Footer */}
        <div ref={tableRef} className="flex-1 overflow-auto">
          <div className="min-w-max flex flex-col min-h-full">
            {/* Sticky Table Header */}
            <div className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
              <div className="flex">
                {/* Frozen columns header */}
                <div className="flex flex-shrink-0 sticky left-0 z-30 bg-gray-100 dark:bg-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="w-16 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">STT</div>
                  <div className="w-48 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Ten</div>
                </div>
                {/* Scrollable columns header */}
                <div className="flex flex-1 min-w-0">
                  <div className="w-16 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Tuoi</div>
                  <div className="w-28 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Ngay sinh</div>
                  <div className="w-64 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Dia chi</div>
                  <div className="w-32 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">So DT</div>
                  <div className="w-44 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Thuc thu</div>
                  <div className="w-48 px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">Ghi chu</div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1">
              {filteredUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Khong tim thay nguoi dung nao
                </div>
              ) : (
                filteredUsers.map((user, index) => {
                  const originalIndex = users.findIndex((u) => u.stt === user.stt);
                  return (
                    <div 
                      key={user.stt} 
                      className="flex border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {/* Frozen columns */}
                      <div className="flex flex-shrink-0 sticky left-0 z-10 bg-white dark:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="w-16 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">{user.stt}</div>
                        <div className="w-48 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">{user.ten}</div>
                      </div>
                      {/* Scrollable columns */}
                      <div className="flex flex-1 min-w-0">
                        <div className="w-16 px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{user.tuoi}</div>
                        <div className="w-28 px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{new Date(user.ngaySinh).toLocaleDateString("vi-VN")}</div>
                        <div className="w-64 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 truncate">{user.diaChi}</div>
                        <div className="w-32 px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{user.soDienThoai}</div>
                        <div className="w-44 px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {editingInlineIndex === originalIndex ? (
                              <input
                                type="text"
                                value={inlineValue}
                                onChange={handleInlineChange}
                                onBlur={() => handleInlineBlur(originalIndex)}
                                onKeyDown={(e) => handleInlineKeyDown(e, originalIndex)}
                                className="w-32 px-2 py-1 border-2 border-blue-500 rounded focus:outline-none dark:bg-gray-700 dark:text-white text-right"
                                autoFocus
                              />
                            ) : (
                              <span
                                onClick={() => handleInlineClick(index)}
                                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 px-2 py-1 rounded border border-transparent hover:border-blue-300 text-blue-600 dark:text-blue-400 font-medium"
                                title="Click de sua"
                              >
                                {formatCurrency(user.luong.thucThu)}
                              </span>
                            )}
                            <button
                              onClick={() => handleOpenModal(index)}
                              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                              title="Chi tiet"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="w-48 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{user.ghiChu}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky Footer - Dong tong */}
            <div className="sticky bottom-0 z-20 bg-green-100 dark:bg-green-900/40 border-t-2 border-green-500 dark:border-green-600">
              <div className="flex font-bold">
                {/* Frozen columns footer */}
                <div className="flex flex-shrink-0 sticky left-0 z-30 bg-green-100 dark:bg-green-900/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="w-16 px-4 py-3 border-r border-green-300 dark:border-green-700"></div>
                  <div className="w-48 px-4 py-3 border-r border-green-300 dark:border-green-700"></div>
                </div>
                {/* Scrollable columns footer */}
                <div className="flex flex-1 min-w-0">
                  <div className="w-16 px-4 py-3"></div>
                  <div className="w-28 px-4 py-3"></div>
                  <div className="w-64 px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                    TONG CONG ({filteredUsers.length} nguoi):
                  </div>
                  <div className="w-32 px-4 py-3"></div>
                  <div className="w-44 px-4 py-3 text-lg text-green-700 dark:text-green-400">
                    {formatCurrency(totalThucThu)}
                  </div>
                  <div className="w-48 px-4 py-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-shrink-0 mt-2 text-sm text-gray-500 dark:text-gray-400">
        Click vao cot luong de sua truc tiep
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Them nguoi dung moi</h2>
                <button onClick={handleCloseAddModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ten <span className="text-red-500">*</span></label>
                  <input type="text" value={newUser.ten} onChange={(e) => handleNewUserChange("ten", e.target.value)} placeholder="Nhap ho ten..." className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${formErrors.ten ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                  {formErrors.ten && <p className="text-red-500 text-xs mt-1">{formErrors.ten}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngay sinh <span className="text-red-500">*</span></label>
                  <input type="date" value={newUser.ngaySinh} onChange={(e) => handleNewUserChange("ngaySinh", e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${formErrors.ngaySinh ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                  {formErrors.ngaySinh && <p className="text-red-500 text-xs mt-1">{formErrors.ngaySinh}</p>}
                  {newUser.ngaySinh && <p className="text-gray-500 text-xs mt-1">Tuoi: {calculateAge(newUser.ngaySinh)}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">So dien thoai <span className="text-red-500">*</span></label>
                  <input type="text" value={newUser.soDienThoai} onChange={(e) => handleNewUserChange("soDienThoai", e.target.value.replace(/[^0-9]/g, ""))} placeholder="0901234567" maxLength={11} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${formErrors.soDienThoai ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                  {formErrors.soDienThoai && <p className="text-red-500 text-xs mt-1">{formErrors.soDienThoai}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chu / Chuc vu</label>
                  <input type="text" value={newUser.ghiChu} onChange={(e) => handleNewUserChange("ghiChu", e.target.value)} placeholder="VD: Nhan vien IT" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dia chi <span className="text-red-500">*</span></label>
                  <input type="text" value={newUser.diaChi} onChange={(e) => handleNewUserChange("diaChi", e.target.value)} placeholder="Nhap dia chi..." className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${formErrors.diaChi ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                  {formErrors.diaChi && <p className="text-red-500 text-xs mt-1">{formErrors.diaChi}</p>}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thong tin luong</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tong luong <span className="text-red-500">*</span></label>
                    <input type="text" value={newUser.tongLuong > 0 ? newUser.tongLuong.toLocaleString("vi-VN") : ""} onChange={(e) => handleNewUserNumberChange("tongLuong", e.target.value)} placeholder="0" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${formErrors.tongLuong ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`} />
                    {formErrors.tongLuong && <p className="text-red-500 text-xs mt-1">{formErrors.tongLuong}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BHXH</label>
                    <input type="text" value={newUser.bhxh > 0 ? newUser.bhxh.toLocaleString("vi-VN") : ""} onChange={(e) => handleNewUserNumberChange("bhxh", e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BHTN</label>
                    <input type="text" value={newUser.bhtn > 0 ? newUser.bhtn.toLocaleString("vi-VN") : ""} onChange={(e) => handleNewUserNumberChange("bhtn", e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thue TNCN</label>
                    <input type="text" value={newUser.thueTNCN > 0 ? newUser.thueTNCN.toLocaleString("vi-VN") : ""} onChange={(e) => handleNewUserNumberChange("thueTNCN", e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Thuc thu (tinh tu dong):</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(calculateThucThu(newUser))}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={handleCloseAddModal} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors">Huy</button>
                <button onClick={handleAddUser} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Them nguoi dung
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Detail Modal */}
      {selectedUser && editingLuong && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiet luong</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedUser.ten}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.ghiChu}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tong luong</label>
                  <input type="text" value={editingLuong.tongLuong.toLocaleString("vi-VN")} onChange={(e) => handleInputChange("tongLuong", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BHXH</label>
                  <input type="text" value={editingLuong.bhxh.toLocaleString("vi-VN")} onChange={(e) => handleInputChange("bhxh", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BHTN</label>
                  <input type="text" value={editingLuong.bhtn.toLocaleString("vi-VN")} onChange={(e) => handleInputChange("bhtn", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thue TNCN</label>
                  <input type="text" value={editingLuong.thueTNCN.toLocaleString("vi-VN")} onChange={(e) => handleInputChange("thueTNCN", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Thuc thu:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(calculateThucThu(editingLuong))}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={handleCloseModal} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors">Huy</button>
                <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">Luu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

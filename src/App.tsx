/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, ChangeEvent, useMemo, useCallback, memo } from 'react';
import { ChevronDown, Lock, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun, BorderStyle } from 'docx';

const INITIAL_SUBJECT_DATA: any = {
  "Khối 6,7,8,9": {
    "Toán": ["Số học", "Đại số", "Hình học", "Ôn thi vào 10"],
    "KHTN": ["Vật Lý", "Hóa học", "Sinh học"],
    "Ngữ Văn": ["Ngữ Văn"]
  },
  "Khối 10,11,12": {
    "Toán": ["Số học", "Đại số", "Hình học", "Ôn thi THPT"],
    "Lý": ["Lý"],
    "Hóa": ["Hóa"],
    "Sinh": ["Sinh"],
    "Sử": ["Sử"],
    "Địa": ["Địa"]
  }
};

const CLASSES = ["6", "7", "8", "9", "10", "11", "12"];

const getSessionLabel = (index: number, isWeekend: boolean) => {
  if (isWeekend) {
    const times = ['7h-9h', '9h30-11h30', '14h-16h', '17h-19h', '19h30-21h30', '21h30-23h30'];
    return `Ca ${index + 1}${times[index] ? ` (${times[index]})` : ''}`;
  } else {
    const times = ['17h-19h', '19h30-21h30'];
    return `Ca ${index + 1}${times[index] ? ` (${times[index]})` : ''}`;
  }
};

const LessonPlanRow = memo(({ row, dayLabel, displayDate, numSessions, sessionIndex, isWeekend, subjects, selectedGradeGroup, handleInputChange }: any) => {
  const sessionLabel = getSessionLabel(sessionIndex, isWeekend);

  return (
    <tr className="even:bg-gray-50 hover:bg-gray-100 transition-colors">
      {sessionIndex === 0 && (
        <td rowSpan={numSessions} className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
          <div className="font-bold">{dayLabel}</div>
          <div className="text-xs text-gray-500">{displayDate || "..............."}</div>
        </td>
      )}
      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
        {sessionLabel}
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300 relative">
        <select 
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 appearance-none" 
          value={row.class}
          onChange={(e) => handleInputChange(row.id, 'class', e.target.value)}
        >
          <option value="">Lớp</option>
          {CLASSES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 pointer-events-none"><ChevronDown size={16} /></button>
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300 relative">
        <select 
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 appearance-none" 
          value={row.subject}
          onChange={(e) => handleInputChange(row.id, 'subject', e.target.value)}
        >
          <option value="">Chọn môn</option>
          {subjects[selectedGradeGroup] && Object.keys(subjects[selectedGradeGroup]).map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 pointer-events-none"><ChevronDown size={16} /></button>
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300 relative">
        <select 
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 appearance-none" 
          value={row.subSubject}
          onChange={(e) => handleInputChange(row.id, 'subSubject', e.target.value)}
        >
          <option value="">Chọn phân môn</option>
          {row.subject && subjects[selectedGradeGroup][row.subject]?.map((ss: string) => (
            <option key={ss} value={ss}>{ss}</option>
          ))}
        </select>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 pointer-events-none"><ChevronDown size={16} /></button>
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300 relative">
        <input 
          type="text" 
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0" 
          value={row.ppct}
          onChange={(e) => handleInputChange(row.id, 'ppct', e.target.value)}
        />
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300 relative">
        <input 
          type="text" 
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0" 
          value={row.lessonName}
          onChange={(e) => handleInputChange(row.id, 'lessonName', e.target.value)}
        />
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500 relative">
        <input 
          type="text" 
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0" 
          value={row.note}
          onChange={(e) => handleInputChange(row.id, 'note', e.target.value)}
        />
      </td>
      <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500 relative">
        <input type="text" className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0" />
        <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><ChevronDown size={16} /></button>
      </td>
    </tr>
  );
});

const GradeBookRow = memo(({ row, index, handleGradeBookChange }: any) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-2 py-4 text-sm text-center font-medium text-black border-r border-black">
        <div>{row.day}</div>
        <div className="text-xs text-gray-500">{row.date}</div>
      </td>
      <td className="px-2 py-4 text-sm text-center text-black border-r border-black">{row.session}</td>
      <td className="px-2 py-4 text-sm text-center text-black border-r border-black">{row.subject}</td>
      <td className="px-2 py-4 text-sm text-center text-black border-r border-black">{row.subSubject}</td>
      <td className="px-2 py-4 text-sm text-center text-black border-r border-black">{row.lessonPlanPeriod}</td>
      <td className="px-2 py-4 text-sm text-black border-r border-black">{row.lessonName}</td>
      <td className="px-2 py-2 text-sm text-black border-r border-black">
        <input 
          type="text" 
          className="w-full bg-transparent border-none focus:ring-0 text-center" 
          value={row.studentAttendance}
          onChange={(e) => handleGradeBookChange(index, 'studentAttendance', e.target.value)}
        />
      </td>
      <td className="px-2 py-2 text-sm text-black border-r border-black">
        <textarea 
          className="w-full bg-transparent border-none focus:ring-0 resize-none" 
          rows={2}
          value={row.teacherComment}
          onChange={(e) => handleGradeBookChange(index, 'teacherComment', e.target.value)}
        />
      </td>
      <td className="px-2 py-4 text-sm text-center text-black">{row.teacherName}</td>
    </tr>
  );
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Bypass credential check as requested
    setIsLoggedIn(true);
    setLoginError("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginUsername("");
    setLoginPassword("");
  };

  const [activeSection, setActiveSection] = useState('lessonPlan');
  const [subjects, setSubjects] = useState<any>(INITIAL_SUBJECT_DATA);
  const [curriculumData, setCurriculumData] = useState<any[]>([]);
  const [lessonPlanData, setLessonPlanData] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [syncedGradeBookData, setSyncedGradeBookData] = useState<any[]>([]);
  const [selectedGradeGroup, setSelectedGradeGroup] = useState<string>("Khối 6,7,8,9");
  const [businessName, setBusinessName] = useState<string>("");
  const [businessOwner, setBusinessOwner] = useState<string>("");
  const [businessAddress, setBusinessAddress] = useState<string>("");
  const [teacherName, setTeacherName] = useState<string>("");
  const [week, setWeek] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Subject Management Logic
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubSubjectName, setNewSubSubjectName] = useState("");
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  const addSubject = (gradeGroup: string) => {
    if (!newSubjectName.trim()) return;
    setSubjects((prev: any) => ({
      ...prev,
      [gradeGroup]: {
        ...prev[gradeGroup],
        [newSubjectName.trim()]: []
      }
    }));
    setNewSubjectName("");
  };

  const deleteSubject = (gradeGroup: string, subjectName: string) => {
    setSubjects((prev: any) => {
      const updatedGradeGroup = { ...prev[gradeGroup] };
      delete updatedGradeGroup[subjectName];
      return { ...prev, [gradeGroup]: updatedGradeGroup };
    });
  };

  const addSubSubject = (gradeGroup: string, subjectName: string) => {
    if (!newSubSubjectName.trim()) return;
    setSubjects((prev: any) => ({
      ...prev,
      [gradeGroup]: {
        ...prev[gradeGroup],
        [subjectName]: [...prev[gradeGroup][subjectName], newSubSubjectName.trim()]
      }
    }));
    setNewSubSubjectName("");
  };

  const deleteSubSubject = (gradeGroup: string, subjectName: string, subIndex: number) => {
    setSubjects((prev: any) => ({
      ...prev,
      [gradeGroup]: {
        ...prev[gradeGroup],
        [subjectName]: prev[gradeGroup][subjectName].filter((_: any, i: number) => i !== subIndex)
      }
    }));
  };

  // Initialize editable lesson plan state
  const initialRows = [...Array(7)].flatMap((_, dayIndex) => {
    const isWeekend = dayIndex === 5 || dayIndex === 6;
    const numSessions = isWeekend ? 6 : 2;
    const dayLabel = dayIndex < 6 ? `Thứ ${dayIndex + 2}` : 'Chủ nhật';
    
    return [...Array(numSessions)].map((_, sessionIndex) => ({
      id: `${dayIndex}-${sessionIndex}`,
      day: dayLabel,
      session: isWeekend ? `Ca ${sessionIndex + 1}` : `Ca ${sessionIndex + 1}`,
      time: isWeekend ? 
        (sessionIndex === 0 ? '7h-9h' : sessionIndex === 1 ? '9h30-11h30' : sessionIndex === 2 ? '14h-16h' : sessionIndex === 3 ? '17h-19h' : sessionIndex === 4 ? '19h30-21h30' : '21h30-23h30') :
        (sessionIndex === 0 ? '17h-19h' : '19h30-21h30'),
      class: '',
      subject: '',
      ppct: '',
      subSubject: '',
      lessonName: '',
      studentCount: '',
      teacherName: '',
      note: '',
      status: ''
    }));
  });

  const [editableLessonPlan, setEditableLessonPlan] = useState<any[]>(initialRows);

  const handleInputChange = useCallback((id: string, field: string, value: string) => {
    setEditableLessonPlan(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  }, []);

  const handleSaveLessonPlan = () => {
    setLessonPlanData(editableLessonPlan);
    setUploadStatus({ message: 'Đã lưu kế hoạch dạy học thành công.', type: 'success' });
    setTimeout(() => setUploadStatus({ message: '', type: '' }), 3000);
  };

  const syncToGradeBook = () => {
    const transformedData = editableLessonPlan.filter(row => row.lessonName.trim() !== '' || row.subject !== '').map(item => {
      const [dayIdxStr, sessionIdxStr] = item.id.split('-');
      const dayIndex = parseInt(dayIdxStr);
      const sessionIndex = parseInt(sessionIdxStr);
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      
      let displayDate = "";
      if (fromDate) {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + dayIndex);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        displayDate = `${dd}/${mm}/${d.getFullYear()}`;
      }
      
      return {
        day: item.day,
        date: displayDate,
        session: getSessionLabel(sessionIndex, isWeekend),
        subject: item.subject,
        subSubject: item.subSubject,
        lessonPlanPeriod: item.ppct,
        lessonName: item.lessonName,
        studentAttendance: '',
        teacherComment: '', 
        teacherName: teacherName,
      };
    });
    
    if (transformedData.length === 0) {
      setUploadStatus({ message: 'Vui lòng nhập nội dung bài dạy trước khi đồng bộ.', type: 'error' });
      return;
    }

    setSyncedGradeBookData(transformedData);
    setActiveSection('gradeBook');
    setUploadStatus({ message: 'Đã đồng bộ sang sổ đầu bài.', type: 'success' });
    setTimeout(() => setUploadStatus({ message: '', type: '' }), 3000);
  };

  const handleAddSession = (dayIndex: number) => {
    setEditableLessonPlan(prev => {
      const dayRows = prev.filter(row => row.id.startsWith(`${dayIndex}-`));
      const nextSessionIndex = dayRows.length;
      const dayLabel = dayIndex < 6 ? `Thứ ${dayIndex + 2}` : 'Chủ nhật';
      
      const newRow = {
        id: `${dayIndex}-${nextSessionIndex}`,
        day: dayLabel,
        session: `Ca ${nextSessionIndex + 1}`,
        class: '',
        subject: '',
        subSubject: '',
        ppct: '',
        lessonName: '',
        note: ''
      };
      
      // Find the last index of the current day to insert after it
      const lastIndex = prev.map(r => r.id.split('-')[0]).lastIndexOf(dayIndex.toString());
      const newPlan = [...prev];
      newPlan.splice(lastIndex + 1, 0, newRow);
      return newPlan;
    });
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>, section: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (section === 'curriculum') {
          setCurriculumData(json);
          setUploadStatus({ message: 'Đã nhận dữ liệu Phân phối chương trình.', type: 'success' });
        } else if (section === 'lessonPlan') {
          setLessonPlanData(json);
          setUploadStatus({ message: 'Đã nhận dữ liệu Kế hoạch dạy học.', type: 'success' });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus({ message: 'Không tìm thấy file để tải lên.', type: 'error' });
    }
  };


  const handleDownloadCurriculumTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([["Lớp", "Môn", "Phân môn", "Tiết", "Nội dung bài học", "Ghi chú"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Phân phối chương trình");
    XLSX.writeFile(wb, "Phan_phoi_chuong_trinh_mau.xlsx");
  };

  const handleDownloadLessonPlanTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([["Thứ, ngày", "Buổi", "Môn học", "Lớp", "Tiết PPCT", "Phân môn", "Tên bài dạy", "Ghi chú", "Trạng thái"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kế hoạch dạy học");
    XLSX.writeFile(wb, "Ke_hoach_day_hoc_mau.xlsx");
  };

  const handleGradeBookChange = useCallback((index: number, field: string, value: string) => {
    setSyncedGradeBookData(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  }, []);

  const handleExportLessonPlanExcel = () => {
    const headerInfo = [
      [`Hộ kinh doanh: ${businessName || '....................'}`],
      [`Địa chỉ: ${businessAddress || '....................'}`],
      [],
      ["KẾ HOẠCH DẠY HỌC CỦA GIÁO VIÊN"],
      [`Họ tên giáo viên dạy: ${teacherName || '....................'}`],
      [`Tuần: ${week || '....'} - Từ ngày: ${formatDate(fromDate)} - Đến ngày: ${formatDate(toDate)}`],
      []
    ];

    const tableHeader = [
      "Thứ, ngày", "Buổi", "Lớp", "Môn học", "Phân môn", "Tiết PPCT", "Tên bài dạy", "Ghi chú"
    ];

    const tableData = editableLessonPlan.filter(row => row.lessonName.trim() !== '' || row.subject !== '').map(row => {
      const [dayIdxStr, sessionIdxStr] = row.id.split('-');
      const dayIndex = parseInt(dayIdxStr);
      const sessionIndex = parseInt(sessionIdxStr);
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      
      let rowDate = "";
      if (fromDate) {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + dayIndex);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        rowDate = ` (${dd}/${mm}/${yyyy})`;
      }
      return [
        `${row.day}${rowDate}`, getSessionLabel(sessionIndex, isWeekend), row.class, row.subject, row.subSubject, row.ppct, row.lessonName, row.note
      ];
    });

    const footerInfo = [
      [],
      ["Người lập", "", "", "", "Duyệt kế hoạch"],
      [`Ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`, "", "", "", `Ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`],
      ["(Ký, ghi rõ họ tên)", "", "", "", "(Ký, ghi rõ họ tên)"],
      [],
      [],
      [teacherName || "....................", "", "", "", businessOwner || "...................."]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([...headerInfo, tableHeader, ...tableData, ...footerInfo]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kế hoạch dạy học");
    XLSX.writeFile(wb, "ke_hoach_day_hoc.xlsx");
  };

  const handleExportExcel = () => {
    const headerInfo = [
      [`Hộ kinh doanh: ${businessName || '....................'}`],
      [`Địa chỉ: ${businessAddress || '....................'}`],
      [],
      ["SỔ ĐẦU BÀI"],
      [`Tuần: ${week || '....'} - Từ ngày: ${formatDate(fromDate)} - Đến ngày: ${formatDate(toDate)}`],
      []
    ];

    const tableHeader = [
      "Thứ ngày tháng", "Buổi", "Môn học", "Phân môn", 
      "Tiết theo KHDH", "Tên bài, nội dung công việc", "Sĩ số", 
      "Nhận xét của giáo viên", "Giáo viên dạy/ký tên"
    ];

    const tableData = syncedGradeBookData.map(row => [
      `${row.day} (${row.date})`, row.session, row.subject, row.subSubject,
      row.lessonPlanPeriod, row.lessonName, row.studentAttendance,
      row.teacherComment, row.teacherName
    ]);

    const footerInfo = [
      [],
      ["Người lập", "", "", "", "", "", "", "", "Duyệt kế hoạch"],
      [`Ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`, "", "", "", "", "", "", "", `Ngày ${String(new Date().getDate()).padStart(2, '0')} tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} năm ${new Date().getFullYear()}`],
      ["(Ký, ghi rõ họ tên)", "", "", "", "", "", "", "", "(Ký, ghi rõ họ tên)"],
      [],
      [],
      [teacherName || "....................", "", "", "", "", "", "", "", businessOwner || "...................."]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([...headerInfo, tableHeader, ...tableData, ...footerInfo]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sổ đầu bài");
    XLSX.writeFile(wb, "so_dau_bai.xlsx");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '....';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleExportLessonPlanWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Hộ kinh doanh: ${businessName || '....................'}`, font: "Times New Roman", size: 28 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Địa chỉ: ${businessAddress || '....................'}`, font: "Times New Roman", size: 28 }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "KẾ HOẠCH DẠY HỌC CỦA GIÁO VIÊN",
                  bold: true,
                  size: 28, // 14pt
                  font: "Times New Roman",
                }),
              ],
              spacing: { before: 200, after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Họ tên giáo viên dạy: ${teacherName || '....................'}`, font: "Times New Roman", size: 28 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Tuần: ${week || '....'} - Từ ngày: ${formatDate(fromDate)} - Đến ngày: ${formatDate(toDate)}`, font: "Times New Roman", size: 28 }),
              ],
              spacing: { after: 400 },
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    "Thứ, ngày", "Buổi", "Lớp", "Môn học", "Phân môn", "Tiết PPCT", "Tên bài dạy", "Ghi chú"
                  ].map(text => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Times New Roman", size: 28 })], alignment: AlignmentType.CENTER })],
                    shading: { fill: "F3F4F6" },
                  })),
                }),
                ...editableLessonPlan.filter(row => row.lessonName.trim() !== '' || row.subject !== '').map(row => {
                  const [dayIdxStr, sessionIdxStr] = row.id.split('-');
                  const dayIndex = parseInt(dayIdxStr);
                  const sessionIndex = parseInt(sessionIdxStr);
                  const isWeekend = dayIndex === 5 || dayIndex === 6;
                  
                  let rowDate = "";
                  if (fromDate) {
                    const d = new Date(fromDate);
                    d.setDate(d.getDate() + dayIndex);
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const yyyy = d.getFullYear();
                    rowDate = ` (${dd}/${mm}/${yyyy})`;
                  }
                  
                  return new TableRow({
                    children: [
                      `${row.day}${rowDate}`, getSessionLabel(sessionIndex, isWeekend), row.class, row.subject, row.subSubject, row.ppct, row.lessonName, row.note
                    ].map(text => new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: String(text || ''), font: "Times New Roman", size: 28 })] })],
                    })),
                  });
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "\n\n", font: "Times New Roman", size: 28 }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "Người lập", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`, font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: teacherName || "....................", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 800 } }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "Duyệt kế hoạch", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`, font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: businessOwner || "....................", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 800 } }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "ke_hoach_day_hoc.docx");
  };

  const handleExportGradeBookWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Hộ kinh doanh: ${businessName || '....................'}`, font: "Times New Roman", size: 28 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Địa chỉ: ${businessAddress || '....................'}`, font: "Times New Roman", size: 28 }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "SỔ ĐẦU BÀI",
                  bold: true,
                  size: 32,
                  font: "Times New Roman",
                }),
              ],
              spacing: { before: 200, after: 400 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Tuần: ${week || '....'} - Từ ngày: ${formatDate(fromDate)} - Đến ngày: ${formatDate(toDate)}`, font: "Times New Roman", size: 28 }),
              ],
              spacing: { after: 400 },
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    "Thứ ngày tháng", "Buổi", "Môn học", "Phân môn", "Tiết theo KHDH", "Tên bài, nội dung công việc", "Sĩ số", "Nhận xét của giáo viên", "Giáo viên dạy/ký tên"
                  ].map(text => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Times New Roman", size: 24 })], alignment: AlignmentType.CENTER })],
                    shading: { fill: "F3F4F6" },
                  })),
                }),
                ...syncedGradeBookData.map(row => {
                  return new TableRow({
                    children: [
                      `${row.day} (${row.date})`, row.session, row.subject, row.subSubject, row.lessonPlanPeriod, row.lessonName, row.studentAttendance, row.teacherComment, row.teacherName
                    ].map(text => new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: String(text || ''), font: "Times New Roman", size: 24 })] })],
                    })),
                  });
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "\n\n", font: "Times New Roman", size: 28 }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "Người lập", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`, font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: teacherName || "....................", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 800 } }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "Duyệt kế hoạch", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`, font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", font: "Times New Roman", size: 28, italics: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: businessOwner || "....................", font: "Times New Roman", size: 28, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 800 } }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "so_dau_bai.docx");
  };

  const handleExportPdf = (elementId: string, filename: string) => {
    const input = document.getElementById(elementId);
    if (input) {
      // Scroll to top to ensure html2canvas captures correctly
      window.scrollTo(0, 0);
      
      // Add a temporary style to override oklch colors and hide UI elements
      const style = document.createElement('style');
      style.innerHTML = `
        #${elementId} *, #${elementId} {
          color: #000000 !important;
          border-color: #000000 !important;
          background-color: #ffffff !important;
          background-image: none !important;
          box-shadow: none !important;
        }
        #${elementId} button, 
        #${elementId} .lucide,
        #${elementId} .no-export { 
          display: none !important; 
        }
        #${elementId} select {
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: auto !important;
        }
        #${elementId} input, #${elementId} textarea {
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #${elementId} .bg-gray-50, #${elementId} .bg-gray-100 { background-color: #f3f4f6 !important; }
        #${elementId} table { border-collapse: collapse !important; width: 100% !important; margin-bottom: 20px !important; }
        #${elementId} th, #${elementId} td { 
          border: 1px solid #000000 !important; 
          padding: 8px 4px !important; 
          vertical-align: middle !important;
        }
      `;
      document.head.appendChild(style);

      // Use a small timeout to ensure styles are applied
      setTimeout(() => {
        html2canvas(input, { 
          scale: 3, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: input.scrollWidth,
          windowHeight: input.scrollHeight,
          onclone: (clonedDoc) => {
            // Additional cleanup on the cloned document if needed
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
              clonedElement.style.width = '800px'; // Force a reasonable width for A4 Portrait
            }
          }
        }).then((canvas) => {
          if (style.parentNode) document.head.removeChild(style);
          const imgData = canvas.toDataURL('image/png');
          
          // A4 dimensions in mm: 210 x 297
          const pdf = new jsPDF('p', 'mm', 'a4'); 
          const pdfWidth = 210; 
          const pdfHeight = 297; 
          
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          
          // Simplified scaling to fit A4
          const finalWidth = pdfWidth - 20; // 10mm margin on each side
          const finalHeight = (imgHeight * finalWidth) / imgWidth;
          
          const offsetX = 10;
          const offsetY = 10;

          pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, Math.min(finalHeight, pdfHeight - 20));
          pdf.save(`${filename}.pdf`);
        }).catch(err => {
          if (style.parentNode) document.head.removeChild(style);
          console.error("PDF Export Error:", err);
          setUploadStatus({ message: 'Lỗi khi xuất PDF. Vui lòng thử lại.', type: 'error' });
        });
      }, 100);
    } else {
      setUploadStatus({ message: 'Không tìm thấy nội dung để xuất PDF.', type: 'error' });
    }
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Phần Mềm quản lý chương trình dạy cho giáo viên</h2>
            <p className="text-gray-500 text-sm mt-2">Đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="admin"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <p className="text-red-500 text-sm text-center">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md"
            >
              Đăng Nhập
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p className="text-gray-400">liên hệ: Đào Minh Tâm zalo 0366000555</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-600">Phần Mềm quản lý chương trình dạy cho giáo viên</h1>
          <nav className="flex items-center space-x-6">
            <ul className="flex space-x-6">
              <li>
                <button
                  onClick={() => setActiveSection('lessonPlan')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'lessonPlan' ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Kế hoạch dạy học
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('gradeBook')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'gradeBook' ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Xuất sổ đầu bài
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('settings')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'settings' ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Cấu hình
                </button>
              </li>
            </ul>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-200"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className=""
        >
          {activeSection === 'lessonPlan' && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div id="lessonPlanContent" className="p-4 bg-white">
                <div className="mb-4 border-b pb-2">
                  <p className="text-sm font-medium text-gray-700">Hộ kinh doanh: <span className="font-bold">{businessName || '....................'}</span></p>
                  <p className="text-sm font-medium text-gray-700">Địa chỉ: <span className="font-bold">{businessAddress || '....................'}</span></p>
                </div>
                
                <h2 className="text-3xl font-bold mb-6 text-emerald-700 text-center uppercase">Kế hoạch dạy học của giáo viên</h2>
                
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-export">
                <div>
                  <label htmlFor="businessNameLP" className="block text-sm font-medium text-gray-700">Hộ kinh doanh:</label>
                  <input 
                    type="text" 
                    id="businessNameLP" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="businessAddressLP" className="block text-sm font-medium text-gray-700">Địa chỉ:</label>
                  <input 
                    type="text" 
                    id="businessAddressLP" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="businessOwnerLP" className="block text-sm font-medium text-gray-700">Chủ hộ kinh doanh:</label>
                  <input 
                    type="text" 
                    id="businessOwnerLP" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
                    value={businessOwner}
                    onChange={(e) => setBusinessOwner(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="teacherNameLP" className="block text-sm font-medium text-gray-700">Họ tên giáo viên dạy:</label>
                  <input 
                    type="text" 
                    id="teacherNameLP" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="gradeGroupLP" className="block text-sm font-medium text-gray-700">Khối lớp:</label>
                  <select 
                    id="gradeGroupLP" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    value={selectedGradeGroup}
                    onChange={(e) => setSelectedGradeGroup(e.target.value)}
                  >
                    <option value="Khối 6,7,8,9">Khối 6,7,8,9</option>
                    <option value="Khối 10,11,12">Khối 10,11,12</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="week" className="block text-sm font-medium text-gray-700">Tuần:</label>
                  <input 
                    type="text" 
                    id="week" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">Từ ngày:</label>
                  <input 
                    type="date" 
                    id="fromDate" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">Đến ngày:</label>
                  <input 
                    type="date" 
                    id="toDate" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Họ tên giáo viên dạy: <span className="font-bold">{teacherName || '....................'}</span></p>
                <p className="text-sm font-medium text-gray-700">Tuần: <span className="font-bold">{week || '....'}</span> - Từ ngày: <span className="font-bold">{formatDate(fromDate)}</span> - Đến ngày: <span className="font-bold">{formatDate(toDate)}</span></p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Thứ, ngày</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Buổi</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Lớp</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Môn học</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Phân môn</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Tiết PPCT</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">Tên bài dạy</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                    </tr>
                  </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Example rows for Monday */}
                        {[...Array(7)].map((_, dayIndex) => {
                          const isWeekend = dayIndex === 5 || dayIndex === 6;
                          const dayLabel = dayIndex < 6 ? `Thứ ${dayIndex + 2}` : 'Chủ nhật';
                          const dayRows = editableLessonPlan.filter(row => row.id.startsWith(`${dayIndex}-`));
                          
                          // Calculate date for this day
                          let displayDate = "";
                          if (fromDate) {
                            const d = new Date(fromDate);
                            d.setDate(d.getDate() + dayIndex);
                            const dd = String(d.getDate()).padStart(2, '0');
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            displayDate = `${dd}/${mm}/${d.getFullYear()}`;
                          }

                          return (
                            <React.Fragment key={`day-plan-${dayIndex}`}>
                              {dayRows.map((row, sessionIndex) => (
                                <LessonPlanRow 
                                  key={row.id}
                                  row={row}
                                  dayLabel={dayLabel}
                                  displayDate={displayDate}
                                  numSessions={dayRows.length + 1}
                                  sessionIndex={sessionIndex}
                                  isWeekend={isWeekend}
                                  subjects={subjects}
                                  selectedGradeGroup={selectedGradeGroup}
                                  handleInputChange={handleInputChange}
                                />
                              ))}
                              <tr>
                                <td colSpan={9} className="px-2 py-1 bg-gray-50 text-center border-b border-gray-300">
                                  <button 
                                    onClick={() => handleAddSession(dayIndex)}
                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors flex items-center justify-center w-full py-1"
                                  >
                                    + Thêm ca học cho {dayLabel}
                                  </button>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-between items-start">
                <div className="text-center">
                  <p className="text-sm text-gray-700 font-bold uppercase">Người lập</p>
                  <p className="text-sm text-gray-500 italic">Ngày {String(new Date().getDate()).padStart(2, '0')} tháng {String(new Date().getMonth() + 1).padStart(2, '0')} năm {new Date().getFullYear()}</p>
                  <p className="text-sm text-gray-500 italic">(Ký, ghi rõ họ tên)</p>
                  <p className="text-sm font-bold uppercase mt-12">{teacherName || "...................."}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-700 font-bold uppercase">Duyệt kế hoạch</p>
                  <p className="text-sm text-gray-500 italic">Ngày {String(new Date().getDate()).padStart(2, '0')} tháng {String(new Date().getMonth() + 1).padStart(2, '0')} năm {new Date().getFullYear()}</p>
                  <p className="text-sm text-gray-500 italic">(Ký, ghi rõ họ tên)</p>
                  <p className="text-sm font-bold uppercase mt-12">{businessOwner || "...................."}</p>
                </div>
              </div>
            </div>
              <div className="mt-6 flex justify-end space-x-4">
                <input type="file" id="lessonPlanFileUpload" accept=".xlsx, .xls" className="hidden" onChange={(e) => handleFileUpload(e, 'lessonPlan')} />
                <label htmlFor="lessonPlanFileUpload" className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-colors cursor-pointer">Nhập file Excel</label>
                <button onClick={handleSaveLessonPlan} className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-colors">Lưu Kế hoạch</button>
                <button onClick={handleExportLessonPlanExcel} className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition-colors">Xuất file Excel</button>
                <button onClick={handleExportLessonPlanWord} className="px-6 py-3 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-colors">Xuất file Word</button>
                <button onClick={syncToGradeBook} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">Đồng bộ sang sổ đầu bài</button>
              </div>
              {uploadStatus.message && activeSection === 'lessonPlan' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-md text-sm ${uploadStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {uploadStatus.message}
                </motion.div>
              )}
            </div>
          )}
          {activeSection === 'gradeBook' && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div id="gradeBookContent" className="overflow-x-auto p-4">
                <div className="mb-4 border-b pb-2">
                  <p className="text-sm font-medium text-gray-700">Hộ kinh doanh: <span className="font-bold">{businessName || '....................'}</span></p>
                  <p className="text-sm font-medium text-gray-700">Địa chỉ: <span className="font-bold">{businessAddress || '....................'}</span></p>
                </div>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold uppercase">Sổ Đầu Bài</h2>
                    <p className="text-sm font-medium text-gray-700">Tuần: <span className="font-bold">{week || '....'}</span> - Từ ngày: <span className="font-bold">{formatDate(fromDate)}</span> - Đến ngày: <span className="font-bold">{formatDate(toDate)}</span></p>
                  </div>

                <table className="min-w-full divide-y divide-gray-200 border border-black">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black w-24">Thứ ngày tháng</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black w-16">Buổi</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black w-32">Môn học</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black w-32">Phân môn</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black w-20">Tiết theo KHDH</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black">Tên bài, nội dung công việc</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black w-20">Sĩ số</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-r border-b border-black w-48">Nhận xét của giáo viên</th>
                      <th className="px-2 py-3 text-center text-xs font-bold text-black uppercase border-b border-black w-32">Giáo viên dạy/ký tên</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-black">
                    {syncedGradeBookData.length > 0 ? (
                      syncedGradeBookData.map((row, index) => (
                        <GradeBookRow 
                          key={index}
                          row={row}
                          index={index}
                          handleGradeBookChange={handleGradeBookChange}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-2 py-12 text-center text-gray-500 italic border-b border-black">
                          Chưa có dữ liệu đồng bộ. Vui lòng nhập kế hoạch dạy học và nhấn "Đồng bộ sang sổ đầu bài".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="mt-8 flex justify-between items-start">
                  <div className="text-center">
                    <p className="text-sm text-gray-700 font-bold uppercase">Người lập</p>
                    <p className="text-sm text-gray-500 italic">Ngày {String(new Date().getDate()).padStart(2, '0')} tháng {String(new Date().getMonth() + 1).padStart(2, '0')} năm {new Date().getFullYear()}</p>
                    <p className="text-sm text-gray-500 italic">(Ký, ghi rõ họ tên)</p>
                    <p className="text-sm font-bold uppercase mt-12">{teacherName || "...................."}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-700 font-bold uppercase">Duyệt kế hoạch</p>
                    <p className="text-sm text-gray-500 italic">Ngày {String(new Date().getDate()).padStart(2, '0')} tháng {String(new Date().getMonth() + 1).padStart(2, '0')} năm {new Date().getFullYear()}</p>
                    <p className="text-sm text-gray-500 italic">(Ký, ghi rõ họ tên)</p>
                    <p className="text-sm font-bold uppercase mt-12">{businessOwner || "...................."}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button onClick={handleExportExcel} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">Xuất file Excel</button>
                <button onClick={handleExportGradeBookWord} className="px-6 py-3 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-colors">Xuất file Word</button>
              </div>
            </div>
          )}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-3xl font-semibold mb-6 text-emerald-700">Cấu hình hệ thống</h2>
              
              <div className="mb-10 p-6 border rounded-lg bg-emerald-50">
                <h3 className="text-xl font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">Thông tin Hộ kinh doanh</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên hộ kinh doanh:</label>
                    <input 
                      type="text" 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ:</label>
                    <input 
                      type="text" 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chủ hộ kinh doanh:</label>
                    <input 
                      type="text" 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      value={businessOwner}
                      onChange={(e) => setBusinessOwner(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4">Cấu hình Môn học & Phân môn</h3>
              <div className="space-y-8">
                {Object.keys(subjects).map(gradeGroup => (
                  <div key={gradeGroup} className="border rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{gradeGroup}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.keys(subjects[gradeGroup]).map(subjectName => (
                        <div key={subjectName} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-emerald-600">{subjectName}</h4>
                            <button 
                              onClick={() => deleteSubject(gradeGroup, subjectName)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Xóa môn
                            </button>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {subjects[gradeGroup][subjectName].map((sub: string, idx: number) => (
                              <div key={`${sub}-${idx}`} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded text-sm">
                                <span>{sub}</span>
                                <button 
                                  onClick={() => deleteSubSubject(gradeGroup, subjectName, idx)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Thêm phân môn..."
                              className="flex-1 text-xs border rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                              value={editingSubject === `${gradeGroup}-${subjectName}` ? newSubSubjectName : ""}
                              onChange={(e) => {
                                setEditingSubject(`${gradeGroup}-${subjectName}`);
                                setNewSubSubjectName(e.target.value);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') addSubSubject(gradeGroup, subjectName);
                              }}
                            />
                            <button 
                              onClick={() => {
                                setEditingSubject(`${gradeGroup}-${subjectName}`);
                                addSubSubject(gradeGroup, subjectName);
                              }}
                              className="bg-emerald-500 text-white px-2 py-1 rounded text-xs hover:bg-emerald-600"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add New Subject Card */}
                      <div className="bg-emerald-50 p-4 rounded-md border border-dashed border-emerald-300 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-emerald-700 mb-2">Thêm môn học mới</h4>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Tên môn học..."
                            className="flex-1 text-sm border rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                            value={editingSubject === gradeGroup ? newSubjectName : ""}
                            onChange={(e) => {
                              setEditingSubject(gradeGroup);
                              setNewSubjectName(e.target.value);
                            }}
                          />
                          <button 
                            onClick={() => {
                              setEditingSubject(gradeGroup);
                              addSubject(gradeGroup);
                            }}
                            className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>liên hệ: Đào Minh Tâm zalo 0366000555</p>
        </div>
      </footer>
    </div>
  );
}


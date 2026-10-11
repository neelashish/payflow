import { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { importStudents, addFeeItem, getFeeItems } from '../store';
import type { Student } from '../types';

interface ImportRow {
  name: string;
  studentId: string;
  address: string;
  email: string;
  phone: string;
  course: string;
  academicSession: string;
  feeDescription: string;
  amount: string;
}

export default function StudentImport() {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [imported, setImported] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mapped = mapColumns(results.data as Record<string, string>[]);
          setRows(mapped);
          validateRows(mapped);
          setStep('preview');
        },
        error: () => {
          setErrors(['Failed to parse CSV file. Please check the format.']);
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
          const mapped = mapColumns(jsonData);
          setRows(mapped);
          validateRows(mapped);
          setStep('preview');
        } catch {
          setErrors(['Failed to parse Excel file. Please check the format.']);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrors(['Unsupported file format. Please use CSV or Excel files.']);
    }
  };

  const mapColumns = (data: Record<string, string>[]): ImportRow[] => {
    return data.map(row => {
      // Try to auto-detect column names
      const findValue = (keys: string[]): string => {
        for (const key of keys) {
          const found = Object.keys(row).find(k => k.toLowerCase().includes(key.toLowerCase()));
          if (found && row[found]) return row[found].trim();
        }
        return '';
      };

      return {
        name: findValue(['name', 'student name', 'student_name']),
        studentId: findValue(['student id', 'admission', 'roll', 'student_id', 'id']),
        address: findValue(['address', 'addr']),
        email: findValue(['email', 'mail']),
        phone: findValue(['phone', 'mobile', 'contact', 'tel']),
        course: findValue(['course', 'class', 'department', 'dept']),
        academicSession: findValue(['session', 'academic', 'year']),
        feeDescription: findValue(['fee', 'description', 'fee type']),
        amount: findValue(['amount', 'fee amount', 'payable']),
      };
    });
  };

  const validateRows = (data: ImportRow[]) => {
    const errs: string[] = [];
    data.forEach((row, idx) => {
      if (!row.name) errs.push(`Row ${idx + 1}: Missing student name`);
      if (!row.studentId) errs.push(`Row ${idx + 1}: Missing student ID`);
      if (row.amount && isNaN(parseFloat(row.amount))) errs.push(`Row ${idx + 1}: Invalid amount "${row.amount}"`);
    });
    setErrors(errs);
  };

  const handleImport = () => {
    const validRows = rows.filter(r => r.name && r.studentId);
    const students: Omit<Student, 'id'>[] = validRows.map(r => ({
      studentId: r.studentId,
      name: r.name,
      address: r.address,
      email: r.email,
      phone: r.phone,
      course: r.course,
      academicSession: r.academicSession || '2026-27',
    }));

    if (students.length > 0) {
      importStudents(students);
    }

    // Import unique fee descriptions
    const existingFees = getFeeItems();
    const feeDescriptions = [...new Set(validRows.map(r => r.feeDescription).filter(f => f))];
    feeDescriptions.forEach(desc => {
      if (!existingFees.find(f => f.description === desc)) {
        const row = validRows.find(r => r.feeDescription === desc);
        const amount = row?.amount ? parseFloat(row.amount) : 0;
        if (amount > 0) {
          addFeeItem({
            description: desc,
            amount,
            currency: 'INR',
            academicSession: '2026-27',
            active: true,
          });
        }
      }
    });

    setImported(students.length);
    setStep('result');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <i className="fas fa-file-import text-blue-400"></i>
        Import Students & Fees
      </h2>

      {step === 'upload' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-blue-500 transition cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <i className="fas fa-cloud-upload-alt text-4xl text-slate-500 mb-4"></i>
            <p className="text-white font-medium mb-2">Drop your file here or click to browse</p>
            <p className="text-slate-400 text-sm">Supports CSV, XLSX, XLS files</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          <div className="mt-6 bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-300 font-medium mb-2">Expected columns:</p>
            <div className="flex flex-wrap gap-2">
              {['Name', 'Student ID', 'Email', 'Phone', 'Course', 'Academic Session', 'Fee Description', 'Amount'].map(col => (
                <span key={col} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{col}</span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Column names are auto-detected. Only Name and Student ID are required.</p>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                const sampleData = 'Name,Student ID,Email,Phone,Course,Academic Session,Fee Description,Amount\nAarav Sharma,STU-001,aarav@example.com,+91 9876543210,B.Com (Hons),2026-27,Tuition Fees,15000\nPriya Patel,STU-002,priya@example.com,+91 9876543211,B.Sc CS,2026-27,Lab Fees,2500';
                const blob = new Blob([sampleData], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample_students.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              <i className="fas fa-download mr-1"></i>Download sample CSV template
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">
              <i className="fas fa-file text-blue-400 mr-2"></i>
              {fileName} — {rows.length} rows found
            </h3>
            <button
              onClick={() => { setStep('upload'); setRows([]); setErrors([]); }}
              className="text-sm text-slate-400 hover:text-white"
            >
              <i className="fas fa-times mr-1"></i>Cancel
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 bg-amber-900/20 border border-amber-800 rounded-lg p-3 max-h-32 overflow-y-auto">
              <p className="text-amber-400 text-sm font-medium mb-1">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {errors.length} warning(s):
              </p>
              {errors.slice(0, 10).map((err, i) => (
                <p key={i} className="text-amber-300 text-xs">{err}</p>
              ))}
              {errors.length > 10 && <p className="text-amber-300 text-xs">...and {errors.length - 10} more</p>}
            </div>
          )}

          <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-300">#</th>
                  <th className="px-3 py-2 text-left text-slate-300">Name</th>
                  <th className="px-3 py-2 text-left text-slate-300">Student ID</th>
                  <th className="px-3 py-2 text-left text-slate-300">Course</th>
                  <th className="px-3 py-2 text-left text-slate-300">Email</th>
                  <th className="px-3 py-2 text-left text-slate-300">Fee</th>
                  <th className="px-3 py-2 text-right text-slate-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700">
                    <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2 text-white">{row.name || <span className="text-red-400">Missing</span>}</td>
                    <td className="px-3 py-2 text-white">{row.studentId || <span className="text-red-400">Missing</span>}</td>
                    <td className="px-3 py-2 text-slate-300">{row.course}</td>
                    <td className="px-3 py-2 text-slate-300">{row.email}</td>
                    <td className="px-3 py-2 text-slate-300">{row.feeDescription}</td>
                    <td className="px-3 py-2 text-right text-slate-300">{row.amount ? `₹${parseFloat(row.amount).toLocaleString('en-IN')}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => { setStep('upload'); setRows([]); setErrors([]); }}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <i className="fas fa-check mr-2"></i>
              Import {rows.filter(r => r.name && r.studentId).length} Students
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/50 border-2 border-green-700 mb-4">
            <i className="fas fa-check text-3xl text-green-400"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Import Complete</h3>
          <p className="text-slate-400 mb-6">{imported} students imported successfully</p>
          <button
            onClick={() => { setStep('upload'); setRows([]); setErrors([]); setImported(0); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Import More
          </button>
        </div>
      )}
    </div>
  );
}

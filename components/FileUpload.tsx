import React, { useState } from 'react';
import { Icons } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (!isProcessing) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative w-full h-48 sm:h-64 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center p-6 overflow-hidden group
        ${dragActive 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]' 
          : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-slate-500 bg-white/50 dark:bg-dark-card/50'
        }
        ${isProcessing ? 'cursor-not-allowed border-primary-500/50' : 'cursor-pointer hover:shadow-lg'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        onChange={handleChange}
        accept="image/*,application/pdf"
        disabled={isProcessing}
      />

      {/* Scanning Animation Layer */}
      {isProcessing && (
        <div className="absolute inset-0 z-10 pointer-events-none">
           <div className="absolute w-full h-1 bg-primary-500/50 shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-scan"></div>
           <div className="scan-overlay animate-scan"></div>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4 pointer-events-none z-10 relative">
        <div className={`p-4 rounded-full transition-all duration-500 
          ${isProcessing 
            ? 'bg-primary-100 dark:bg-primary-900 scale-110' 
            : dragActive 
              ? 'bg-primary-100 dark:bg-primary-900 scale-110' 
              : 'bg-slate-100 dark:bg-slate-800 group-hover:scale-110'
          }`}>
          {isProcessing ? (
            <Icons.Loader className="w-8 h-8 text-primary-600 animate-spin" />
          ) : (
            <Icons.Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isProcessing ? 'Scanning & Extracting Data...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI-powered processing for Receipts, Invoices & Statements (PDF/JPG)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
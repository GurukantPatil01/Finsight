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
      className={`relative w-full h-48 sm:h-64 rounded-sm border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center p-8 overflow-hidden
        ${dragActive
          ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10'
          : 'border-neutral-300 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-neutral-600 bg-white dark:bg-dark-card'
        }
        ${isProcessing ? 'cursor-not-allowed border-primary-400' : 'cursor-pointer'}
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

      {/* Simple Processing Indicator */}
      {isProcessing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/50 z-10"></div>
      )}

      <div className="flex flex-col items-center gap-5 pointer-events-none z-10 relative">
        <div className={`p-5 rounded-sm border-2 transition-all duration-300 
          ${isProcessing
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : dragActive
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900'
          }`}>
          {isProcessing ? (
            <Icons.Loader className="w-7 h-7 text-primary-600 animate-spin" />
          ) : (
            <Icons.Upload className={`w-7 h-7 transition-colors ${dragActive ? 'text-primary-600' : 'text-slate-400'}`} />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-normal text-slate-700 dark:text-slate-200">
            {isProcessing ? 'Processing Document...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Receipts, Invoices & Statements (PDF/JPG)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
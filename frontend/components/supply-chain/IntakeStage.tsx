"use client";
import { useState } from "react";

interface IntakeStageProps {
  uploadedFiles: File[];
  onFilesChange: (files: File[]) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onProcessDocuments?: () => void;
  isUploading?: boolean;
  processingCount?: number;
}

export const IntakeStage = ({
  uploadedFiles,
  onFilesChange,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onProcessDocuments,
  isUploading = false,
  processingCount = 0,
}: IntakeStageProps) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      onFilesChange([...uploadedFiles, ...selectedFiles]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Upload Area - Show only when no files */}
        {uploadedFiles.length === 0 && (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging ? 'border-[#5332FF] bg-[#5332FF]/5' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#5332FF]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#5332FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Vendor RFQ Documents</h3>
              <p className="text-sm text-gray-600 mb-6">Drop your RFQ files here or browse to get started</p>
              <button
                onClick={() => document.getElementById('intake-file-input')?.click()}
                className="px-6 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors"
              >
                Browse Files
              </button>
              <input
                id="intake-file-input"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                multiple
                onChange={handleFileInput}
              />
              <p className="text-sm text-gray-500 mt-4">Supports: PDF, DOCX files</p>
            </div>
          </div>
        )}

        {/* File List - Show when files are uploaded */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">Uploaded Documents ({uploadedFiles.length})</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => document.getElementById('intake-file-input')?.click()}
                  className="text-sm text-[#5332FF] hover:text-[#5332FF]/80 font-medium transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Files
                </button>
                <button
                  onClick={() => onFilesChange([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </button>
              </div>
            </div>
            {/* Hidden file input for Add Files button */}
            <input
              id="intake-file-input"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              multiple
              onChange={handleFileInput}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 transition-all hover:bg-gray-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#5332FF]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#5332FF]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onFilesChange(uploadedFiles.filter((_, i) => i !== index));
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {uploadedFiles.length} of {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} will be processed
              </p>
              {onProcessDocuments && (
                <button
                  onClick={onProcessDocuments}
                  disabled={uploadedFiles.length === 0 || isUploading}
                  className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Documents
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

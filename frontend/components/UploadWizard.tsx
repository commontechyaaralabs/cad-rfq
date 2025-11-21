"use client";
import { useState } from "react";

interface UploadWizardProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  isDetecting: boolean;
  onDetect: () => void;
  visibleFiles: Set<number>;
  onVisibleFilesChange: (visibleFiles: Set<number>) => void;
}

export const UploadWizard = ({ files, onFilesChange, isDetecting, onDetect, visibleFiles, onVisibleFilesChange }: UploadWizardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const currentStep = files.length === 0 ? 1 : isDetecting ? 2 : 2;

  const toggleFileVisibility = (index: number) => {
    const newVisibleFiles = new Set(visibleFiles);
    if (newVisibleFiles.has(index)) {
      newVisibleFiles.delete(index);
    } else {
      newVisibleFiles.add(index);
    }
    onVisibleFilesChange(newVisibleFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
      return isPdf || isDocx;
    });
    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles];
      onFilesChange(newFiles);
      // Auto-add new files to visible set
      const newIndices = Array.from({ length: validFiles.length }, (_, i) => files.length + i);
      const updatedVisible = new Set(visibleFiles);
      newIndices.forEach(idx => updatedVisible.add(idx));
      onVisibleFilesChange(updatedVisible);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newFiles = [...files, ...selectedFiles];
      onFilesChange(newFiles);
      // Auto-add new files to visible set
      const newIndices = Array.from({ length: selectedFiles.length }, (_, i) => files.length + i);
      const updatedVisible = new Set(visibleFiles);
      newIndices.forEach(idx => updatedVisible.add(idx));
      onVisibleFilesChange(updatedVisible);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1">
          <div className={`flex items-center gap-3 ${files.length > 0 ? 'text-[#5332FF]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              files.length > 0 ? 'bg-[#5332FF] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              1
            </div>
            <span className="font-medium">Upload RFQs</span>
          </div>
          <div className={`h-1 flex-1 ${files.length > 0 ? 'bg-[#5332FF]' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-3 ${files.length > 0 ? 'text-[#5332FF]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              files.length > 0 ? 'bg-[#5332FF] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <span className="font-medium">Detect Vendors</span>
          </div>
          <div className={`h-1 flex-1 ${isDetecting ? 'bg-[#5332FF]' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-3 ${isDetecting ? 'text-[#5332FF]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              isDetecting ? 'bg-[#5332FF] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <span className="font-medium">Compare & Insights</span>
          </div>
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
              onClick={() => document.getElementById('wizard-file-input')?.click()}
              className="px-6 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors"
            >
              Browse Files
            </button>
            <input
              id="wizard-file-input"
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

      {/* Step 2: File List & Detect */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Uploaded Documents ({files.length})</h3>
            <button
              onClick={() => {
                onFilesChange([]);
                onVisibleFilesChange(new Set());
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {files.map((file, index) => {
              const isVisible = visibleFiles.has(index);
              return (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    isVisible 
                      ? 'bg-gray-50 border-gray-200 opacity-100' 
                      : 'bg-gray-100 border-gray-300 opacity-50'
                  }`}
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
                      onClick={() => toggleFileVisibility(index)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={isVisible ? "Hide from comparison" : "Show in comparison"}
                    >
                      {isVisible ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        removeFile(index);
                        const newVisibleFiles = new Set(visibleFiles);
                        newVisibleFiles.delete(index);
                        // Adjust indices for remaining files
                        const adjustedSet = new Set<number>();
                        newVisibleFiles.forEach(i => {
                          if (i > index) {
                            adjustedSet.add(i - 1);
                          } else {
                            adjustedSet.add(i);
                          }
                        });
                        onVisibleFilesChange(adjustedSet);
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
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {visibleFiles.size > 0 
                ? `${visibleFiles.size} of ${files.length} file${files.length !== 1 ? 's' : ''} will be compared`
                : 'Select files to compare (minimum 2 required)'
              }
            </p>
            <button
              onClick={onDetect}
              disabled={visibleFiles.size < 2 || isDetecting}
              className="px-8 py-3 bg-[#5332FF] text-white rounded-lg font-semibold hover:bg-[#5332FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDetecting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting Vendors...
                </>
              ) : (
                <>
                  Detect Vendor Data
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


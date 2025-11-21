"use client";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string | null;
  previewKind: "image" | "pdf" | "other";
  fileName: string | null;
}

export const PreviewModal = ({ isOpen, onClose, previewUrl, previewKind, fileName }: PreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="relative rounded-lg shadow-xl max-w-[90vw] max-h-[85vh] w-full" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-sm font-medium" style={{ color: '#0B0B0C' }}>
            Preview — {fileName}
          </p>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md text-sm font-semibold"
            style={{ backgroundColor: '#E5E7EB', color: '#0B0B0C' }}
          >
            Close
          </button>
        </div>
        <div className="p-4">
          {previewKind === "image" && previewUrl && (
            <img src={previewUrl} alt="preview" className="block mx-auto" style={{ maxWidth: '86vw', maxHeight: '72vh' }} />
          )}
          {previewKind === "pdf" && previewUrl && (
            <iframe src={previewUrl} title="PDF preview" className="w-[86vw]" style={{ height: '72vh' }} />
          )}
          {previewKind === "other" && (
            <div className="text-center" style={{ color: '#6B7280' }}>
              <p className="mb-4">Preview not available for this file type.</p>
              {previewUrl && (
                <a
                  href={previewUrl}
                  download={fileName || 'file'}
                  className="px-4 py-2 rounded-md text-sm font-semibold"
                  style={{ backgroundColor: '#5332FF', color: '#FFFFFF' }}
                >
                  Download
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


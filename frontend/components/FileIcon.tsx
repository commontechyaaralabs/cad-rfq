export const renderFileIcon = (file: File | null) => {
  if (!file) return null;
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const circleStyle = { backgroundColor: '#F3F4F6' };
  if (isImage) {
    return (
      <div className="h-8 w-8 rounded-full flex items-center justify-center" style={circleStyle}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#5332FF" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 7a2 2 0 1 1 0 4a2 2 0 0 1 0-4zm11 10l-5-6l-3.5 4.5L8 13l-3 4h14z"></path>
        </svg>
      </div>
    );
  }
  if (isPdf) {
    return (
      <div className="h-8 w-8 rounded-full flex items-center justify-center" style={circleStyle}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EF4444" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path fill="#FFFFFF" d="M8 16h1.5a2 2 0 0 0 0-4H8zm1.5-3a1 1 0 1 1 0 2H9v-2zM12 12h1v4h-1zm2 0h1.8a1.7 1.7 0 0 1 0 3.4H14zM15.8 15a.7.7 0 1 0 0-1.4H15V15z"></path>
          <path fill="#EF4444" d="M14 2v6h6z"></path>
        </svg>
      </div>
    );
  }
  return (
    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={circleStyle}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path fill="#6B7280" d="M14 2H6a2 2 0 0 0-2 2v14h2V4h8z"></path>
        <path fill="#6B7280" d="M14 2v6h6z"></path>
      </svg>
    </div>
  );
};


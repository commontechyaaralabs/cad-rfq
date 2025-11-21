export const openComparePreview = (
  targetFile: File | null,
  setPreviewUrl: (url: string) => void,
  setPreviewKind: (kind: "image" | "pdf" | "other") => void,
  setFile: (file: File | null) => void,
  setIsPreviewOpen: (open: boolean) => void,
  kindHint: "rfq" | "cad"
) => {
  if (!targetFile) return;
  const url = URL.createObjectURL(targetFile);
  setPreviewUrl(url);
  if (kindHint === "cad" && (targetFile.type.startsWith("image/") || targetFile.name.toLowerCase().match(/\.(png|jpe?g|webp)$/))) {
    setPreviewKind("image");
  } else if (targetFile.type === "application/pdf" || targetFile.name.toLowerCase().endsWith(".pdf")) {
    setPreviewKind("pdf");
  } else {
    setPreviewKind("other");
  }
  setFile(targetFile);
  setIsPreviewOpen(true);
};


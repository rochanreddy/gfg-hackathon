import { useCallback, useState, useRef } from "react";
import { Upload, FileUp, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const FileUpload = ({ onUpload, isUploading }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.toLowerCase().endsWith(".csv")) {
        setSelectedFile(file);
        setUploadSuccess(false);
        await onUpload(file);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2000);
      }
    },
    [onUpload],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setUploadSuccess(false);
        await onUpload(file);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2000);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [onUpload],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 cursor-pointer ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
      }`}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-1"
          >
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Processing…</span>
          </motion.div>
        ) : uploadSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-1"
          >
            <CheckCircle2 size={20} className="text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400">Uploaded!</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-1"
          >
            <FileUp size={20} className="text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">
                Drop a CSV here
              </p>
              <p className="text-[10px] text-muted-foreground">
                or click to browse
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFile && !isUploading && !uploadSuccess && (
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Upload size={10} />
          {selectedFile.name}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

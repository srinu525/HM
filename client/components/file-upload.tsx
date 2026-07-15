"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, Download, Trash2, FileText, Image, File } from "lucide-react";

interface FileAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  entity: string;
  entityId: string;
  createdAt: string;
}

interface FileUploadProps {
  entity: string;
  entityId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function FileUpload({ entity, entityId }: FileUploadProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const res = await api.get("/files", { params: { entity, entityId } });
      setFiles(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchFiles(); }, [entity, entityId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity", entity);
      formData.append("entityId", entityId);
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchFiles();
    } catch (err) { console.error(err); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (file: FileAttachment) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/files/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles(files.filter(f => f.id !== id));
    } catch (e) { console.error(e); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4 text-pink-500" />;
    if (mimeType === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
    return <File className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments ({files.length})
          </span>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleUpload}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-sm">No files attached</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.mimeType)}
                  <div>
                    <p className="font-medium text-sm">{file.originalName}</p>
                    <p className="text-xs text-gray-400">
                      {formatSize(file.size)} &middot; {new Date(file.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(file)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

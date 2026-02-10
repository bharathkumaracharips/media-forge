"use client";

import { useState, useRef } from "react";
import { Upload, X, FileVideo, Music } from "lucide-react";

interface UploadZoneProps {
    label: string;
    accept: string;
    maxFiles?: number;
    onFilesSelected: (files: File[]) => void;
    files: File[];
    onRemove: (index: number) => void;
}

export default function UploadZone({
    label,
    accept,
    maxFiles = 10,
    onFilesSelected,
    files,
    onRemove,
}: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            const newFiles = Array.from(e.dataTransfer.files);
            if (files.length + newFiles.length > maxFiles) {
                alert(`Maximum ${maxFiles} files allowed.`);
                return;
            }
            onFilesSelected(newFiles);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const newFiles = Array.from(e.target.files);
            if (files.length + newFiles.length > maxFiles) {
                alert(`Maximum ${maxFiles} files allowed.`);
                return;
            }
            onFilesSelected(newFiles);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="file"
                multiple={maxFiles > 1}
                accept={accept}
                onChange={handleChange}
                style={{ display: "none" }}
            />

            <div
                className="glass-panel"
                style={{
                    padding: "3rem",
                    textAlign: "center",
                    cursor: "pointer",
                    border: isDragging ? "2px solid var(--primary)" : "1px solid var(--border)",
                    background: isDragging ? "rgba(59, 130, 246, 0.1)" : undefined
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                    <Upload size={48} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{label}</h3>
                <p style={{ opacity: 0.7, fontSize: "0.875rem" }}>Drag & drop files here or click to browse</p>
                <p style={{ opacity: 0.5, fontSize: "0.75rem", marginTop: "0.5rem" }}>Supports: {accept}</p>
            </div>

            {files.length > 0 && (
                <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {files.map((file, i) => (
                        <div
                            key={i}
                            className="glass-panel"
                            style={{
                                padding: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                animation: "fadeIn 0.3s ease-out"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", overflow: "hidden" }}>
                                <div style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                                    {file.type ? (file.type.startsWith("audio") ? <Music size={20} /> : <FileVideo size={20} />) : <FileVideo size={20} />}
                                </div>
                                <div style={{ overflow: "hidden" }}>
                                    <p style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "300px" }}>{file.name}</p>
                                    <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "white",
                                    opacity: 0.7,
                                    cursor: "pointer",
                                    padding: "0.5rem",
                                    display: "flex"
                                }}
                                className="hover:opacity-100"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

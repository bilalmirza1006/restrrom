"use client";

import { useRef, useState, useCallback } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function UploadBuildingImage({ image, setImage }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const onFile = useCallback(
    (file) => {
      const imagePreview = URL.createObjectURL(file);
      setImage({ file, imagePreview });
    },
    [setImage]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files[0]) onFile(e.target.files[0]);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`
        w-full h-[348px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center
        transition-colors
        ${
          dragOver
            ? "border-primary bg-primary/10"
            : "border-gray-300 bg-gray-100"
        }
        cursor-pointer
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {image.imagePreview ? (
        <img
          src={image.imagePreview}
          alt="imagePreview"
          className="w-full h-full object-contain rounded-lg"
        />
      ) : (
        <>
          <IoCloudUploadOutline className="text-gray-500 text-5xl" />
          <p className="mt-2 text-gray-500">Upload Building Image</p>
          <p className="text-xs text-gray-400">(click or drag & drop)</p>
        </>
      )}
    </div>
  );
}

'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/cloudinary';

interface Props {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function ImageUploader({ value, onChange, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <div className="flex gap-2">
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://... ou uploader →"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-semibold disabled:opacity-60 whitespace-nowrap"
          >
            {uploading ? '⏳ Upload...' : '📷 Uploader'}
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm"
            >
              ✕
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {value && (
        <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative bg-gray-50">
          <Image src={value} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
    </div>
  );
}

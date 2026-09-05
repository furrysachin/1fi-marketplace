import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Renders a product image; if the remote URL fails (offline, removed,
 * hotlink-blocked) it gracefully falls back to a branded placeholder.
 */
export default function ProductImage({ src, alt, className = '', iconClassName = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-ink-100 to-ink-50 text-ink-200 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={28} className={iconClassName} />
      </div>
    );
  }

  // Locally-served product renders (client/public/images) are portrait shots on a
  // white background — fit them fully so they are never cropped. Remote lifestyle
  // photos keep the cover crop.
  const objectFit = src.startsWith('/images/') ? 'object-contain' : 'object-cover';

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${objectFit}`}
    />
  );
}
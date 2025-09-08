"use client";

import Image from "next/image";

interface CustomImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: () => void;
  width?: number;
  height?: number;
}

export default function CustomImage({
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  onError,
  onClick,
  width,
  height,
}: CustomImageProps) {
  // Check if this is an uploaded image from our backend
  const isUploadedImage = src.includes("/uploads/");

  // For uploaded images, use regular img tag to bypass Next.js optimization
  if (isUploadedImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} ${
          fill ? "absolute inset-0 w-full h-full object-cover" : ""
        }`}
        onError={onError}
        onClick={onClick}
        style={
          fill
            ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
            : { width, height }
        }
        crossOrigin="anonymous"
      />
    );
  }

  // For external images, use Next.js Image component
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={onError}
      onClick={onClick}
      width={width}
      height={height}
    />
  );
}

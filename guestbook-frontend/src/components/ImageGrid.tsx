import { useEffect, useState } from "react";
import ImageCard from "./ImageCard";

interface ImageItem {
  id: string;
  url: string;
  caption: string;
  uploadTime: string;
}

export default function ImageGrid() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem("id_token");

    fetch(`${API}/api/images`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        maxWidth: "100%",
        margin: "auto",
      }}
    >
      {images.map((img) => (
        <ImageCard key={img.id} image={img} />
      ))}
    </div>
  );
}

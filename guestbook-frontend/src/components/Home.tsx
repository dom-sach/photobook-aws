import { useEffect, useState } from 'react';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";

interface ImageItem {
  id: string;
  url: string;
  caption: string;
  uploadTime: string;
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_BACKEND_URL;
  console.log("========== Frontend =============");
  console.log("API =", API);


  // Home dostępny dopiero po zalogowaniu
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);


  const [images, setImages] = useState<ImageItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('id_token');

    // pobierz listę obrazków z backendu
    fetch(`${API}/api/images`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error('Błąd pobierania obrazków:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);      // <-- poprawione
    formData.append('caption', caption);

    const token = localStorage.getItem('id_token');

    await fetch(`${API}/api/images`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    // odśwież listę po uploadzie
    const res = await fetch(`${API}/api/images`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    const data = await res.json();
    setImages(data);
    setShowUpload(false);
    setFile(null);
    setCaption('');
  };

  return (
    <div>
      <button onClick={() => setShowUpload(true)}>Dodaj obrazek</button>
      {showUpload && (
        <div>
          <h3>Dodaj obrazek</h3>
          <input type="file" accept=".jpg,.png" onChange={handleFileChange} />
          <input
            type="text"
            placeholder="Podpis"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <button onClick={handleUpload}>Wyślij</button>
          <button onClick={() => setShowUpload(false)}>Anuluj</button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {images.map((img) => (
          <div key={img.id} style={{border: '1px solid #ccc', padding: '10px'}}>
            <img src={img.url} alt={img.caption} style={{width: '100%'}} />
            <p>{img.caption}</p>
            <small>{img.uploadTime}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {logout as cognitoLogout} from "../auth.ts";

interface ImageItem {
  id: string;
  url: string;
  caption: string;
  uploadTime: string;
}

export default function Home() {
  const { isLoggedIn, logout } = useAuth();
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

  const handleLogout = () => {
    cognitoLogout();   // usuwa sesję Cognito
    logout();          // ustawia isLoggedIn = false w kontekście
    localStorage.removeItem("id_token");
    navigate("/login"); // redirect
  };

  return (
    <div>

      <button style={{
        display: 'flex',
        margin: 'auto',
        marginBottom: '2rem',
        marginTop: '2rem',
        fontSize: '1.2rem',
      }} onClick={() => setShowUpload(true)}>
        Dodaj obrazek
      </button>

      <button style={{
        display: 'flex',
        margin: 'auto',
        marginBottom: '2rem',
        marginTop: '2rem',
        fontSize: '1.2rem',
      }} onClick={handleLogout}>
        Wyloguj
      </button>

      {showUpload && (
        <div style={{
          width: '80%',
          margin: 'auto',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h3>Dodaj obrazek</h3>
          <input
            type="file"
            style={{
              lineHeight: '2rem',
            }}
            accept=".jpg,.png"
            onChange={handleFileChange}/>

          <input
            type="text"
            style={{
              lineHeight: '2rem',
            }}
            placeholder="Podpis"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <div style={{
            display: 'flex',
            width: '100%',
            margin: 'auto',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignContent: 'space-around',
          }}>
            <button
              onClick={handleUpload}
              style={{
                width: '30%',
              }}>
              Wyślij
            </button>

            <button
              onClick={() => setShowUpload(false)}
              style={{
                width: '30%',
              }}>
              Anuluj
            </button>
          </div>

        </div>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        maxWidth: '80%',
        alignContent: 'center',
        justifyContent: 'center',
        margin: 'auto',
      }}>
        {images.map((img) => (
          <div key={img.id} style={{border: '1px solid #ccc', padding: '10px'}}>
            <img src={img.url} alt={img.caption} style={{width: '100%'}}/>
            <h4 style={{
              margin: '0',
              marginTop: '1rem',
              marginBottom: '0.5rem',
            }}>
              {img.caption}
            </h4>

            <small>
              {new Date(img.uploadTime).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
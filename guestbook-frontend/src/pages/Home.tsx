import { useEffect, useState } from 'react';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {logout as cognitoLogout} from "../auth.ts";
import ImageGrid from "../components/ImageGrid.tsx";

export default function Home() {

  // Constants
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Logowanie
  const API = import.meta.env.VITE_BACKEND_URL;
  console.log("[Home] Logging backend URL = ", API);

  // Dostęp dopiero po zalogowaniu
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Upload obrazka
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    const token = localStorage.getItem('id_token');
    await fetch(`${API}/api/images`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    setShowUpload(false);
    setFile(null);
    setCaption('');
  };

  // Logout
  const handleLogout = () => {
    cognitoLogout();   // usuwa sesję Cognito
    logout();          // ustawia isLoggedIn = false w kontekście
    localStorage.removeItem("id_token");
    navigate("/login");
  };


  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        margin: 'auto',
        width: '80%',
        justifyContent: 'center'
      }} >
        {/* Przyciski */}
        <button style={{
          display: 'flex',
          margin: 'auto',
          marginBottom: '2rem',
          marginTop: '2rem',
          fontSize: '1rem',
        }} onClick={() => setShowUpload(true)}>
          Dodaj obrazek
        </button>

        <button style={{
          display: 'flex',
          margin: 'auto',
          marginBottom: '2rem',
          marginTop: '2rem',
          fontSize: '1rem',
        }} onClick={handleLogout}>
          Wyloguj
        </button>

        <button
          style={{
            display: 'flex',
            margin: 'auto',
            marginBottom: '2rem',
            marginTop: '2rem',
            fontSize: '1rem',
          }}
          onClick={() => navigate("/profile")}
        >
          Mój Profil
        </button>
      </div>



      {/* Dodawanie nowego obrazka */}
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

      {/* Lista wszystkich obrazków */}
      <div style={{marginTop: "2rem"}}>
        <ImageGrid/>
      </div>


    </div>
  );
}
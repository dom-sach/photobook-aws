import { useState } from 'react';
import { signIn, signUp} from "../auth.ts";
import ConfirmSignup from "./ConfirmSignup.tsx";
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext.tsx";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, login, logout } = useAuth();


  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  console.log("UserPoolId:", userPoolId);
  console.log("ClientId:", clientId);

  const handleLogin = async () => {
    try {
      const token = await signIn(email, password);
      localStorage.setItem('id_token', token);
      alert('Zalogowano!');
      login()
      navigate('/'); // przekierowanie na stronę główną
    } catch (err) {
      alert('Błąd logowania');
      console.error(err);
    }
  };

  const handleSignup = async () => {
    try {
      await signUp(email, password);
      alert('Zarejestrowano! Teraz się zaloguj.');
    } catch (err) {
      alert('Błąd rejestracji');
      console.error(err);
    }
  };

  if (showConfirm) {
    return <ConfirmSignup />;
  }
  return (
    <div>
      {!isLoggedIn ? (
        <div className="login-container">
          <h2>Logowanie / Rejestracja</h2>

          <label htmlFor="email">Email</label>
          {/*<input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>*/}
          <input
            type="email"
            id="email"
            placeholder="Wprowadź email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Hasło</label>
          <input
            type="password"
            id="password"
            placeholder="Wprowadź hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button onClick={handleLogin}>Zaloguj</button>
          <button onClick={handleSignup}>Zarejestruj</button>

          <p>Nie potwierdziłeś konta?{" "}
            <button onClick={() => setShowConfirm(true)}>
              Potwierdź rejestrację
            </button>
          </p>

          <h3>Debug:</h3>
          <p>{import.meta.env.VITE_COGNITO_USER_POOL_ID}</p>
          <p>{import.meta.env.VITE_COGNITO_CLIENT_ID}</p>
        </div>
      ) : (
        <div>
          <p>Zalogowany</p>
          <button onClick={logout}>Wyloguj się</button>
        </div>
      )
      }
    </div>


  );
}

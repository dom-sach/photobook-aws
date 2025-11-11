import { useState } from 'react';
import { signIn, signUp} from "../auth.ts";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  console.log("UserPoolId:", userPoolId);
  console.log("ClientId:", clientId);

  const handleLogin = async () => {
    try {
      const token = await signIn(email, password);
      localStorage.setItem('id_token', token);
      alert('Zalogowano!');
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

  return (
    <div>
      <h3>Debug:</h3>
      <p>{import.meta.env.VITE_COGNITO_USER_POOL_ID}</p>
      <p>{import.meta.env.VITE_COGNITO_CLIENT_ID}</p>


      <h2>Logowanie / Rejestracja</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło"/>
      <button onClick={handleLogin}>Zaloguj</button>
      <button onClick={handleSignup}>Zarejestruj</button>
    </div>
  );
}

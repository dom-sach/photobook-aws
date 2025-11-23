import { CognitoUser } from "amazon-cognito-identity-js";
import React, { useState } from "react";
import {userPool} from "../auth.ts";
import {useNavigate} from "react-router-dom";

const ConfirmSignup = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    // @ts-ignore
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        setStatus("❌ Błąd: " + err.message);
      } else {
        setStatus("✅ Konto potwierdzone. Możesz się teraz zalogować.");
        navigate('/');
      }
    });
  };

  return (
    <div style={{
      margin: 'auto',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '80%',
      maxHeight: '80%',
      justifyContent: 'center',
      alignContent: 'center',
    }}>
      <h2>Potwierdzenie rejestracji</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            marginTop: '2rem',
            marginBottom: '2rem',
          }}
        />
        <br />
        <input
          type="text"
          placeholder="Kod potwierdzający"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{
            marginTop: '2rem',
            marginBottom: '2rem',
          }}
        />
        <br />
        <button
          type="submit"
          style={{
            width: '100%',
            height: '1.5rem',
          }}
        >
          Potwierdź konto
        </button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default ConfirmSignup;

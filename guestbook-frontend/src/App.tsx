import { useEffect, useState } from 'react';


type Message = {
  id: number;
  author: string;
  text: string;
  createdAt: string;
};

const API = import.meta.env.VITE_API_URL as string;

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  const loadMessages = async () => {
    const res = await fetch(`${API}/api/messages`);
    setMessages(await res.json());
  };

  useEffect(() => { loadMessages(); }, []);

  const createMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });
    setAuthor(''); setText('');
    loadMessages();
  };

  const likeMessage = async (id: number) => {
    await fetch(`${API}/api/messages/${id}/like`, { method: 'POST' });
    // nic nie robimy – tylko demo
  };

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API}/api/media`, { method: 'POST', body: form });
    const data = await res.json();
    setGallery(g => [data.url, ...g]);
    setFile(null);
    (document.getElementById('file') as HTMLInputElement).value = '';
  };

  return (
    <div style={{maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui, sans-serif'}}>
      <h1>Guestbook + Galeria</h1>

      <section style={{marginBottom: 32}}>
        <h2>Nowy wpis</h2>
        <form onSubmit={createMessage}>
          <input placeholder="Autor" value={author} onChange={e=>setAuthor(e.target.value)} required />
          <input placeholder="Treść" value={text} onChange={e=>setText(e.target.value)} required style={{width: 400, marginLeft: 8}} />
          <button type="submit" style={{marginLeft: 8}}>Wyślij</button>
        </form>
      </section>

      <section style={{marginBottom: 32}}>
        <h2>Wpisy</h2>
        <ul>
          {messages.map(m => (
            <li key={m.id} style={{marginBottom: 8}}>
              <b>#{m.id}</b> <i>{m.author}</i>: {m.text}
              <button onClick={()=>likeMessage(m.id)} style={{marginLeft: 8}}>👍</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Upload obrazu</h2>
        <form onSubmit={uploadFile}>
          <input id="file" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
          <button type="submit" style={{marginLeft: 8}}>Wyślij</button>
        </form>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap: 12, marginTop: 16}}>
          {gallery.map((url, idx)=>(
            <img key={idx} src={`${API}${url}`} alt="uploaded" style={{width:'100%', height:120, objectFit:'cover', border:'1px solid #ccc'}} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;

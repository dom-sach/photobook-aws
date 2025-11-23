import { useEffect, useState } from "react";

interface Comment {
  id: string;
  text: string;
  authorEmail: string;
  createdAt: string;
}

interface ImageItem {
  id: string;
  url: string;
  caption: string;
  uploadTime: string;
}

export default function ImageCard({ image }: { image: ImageItem }) {
  const API = import.meta.env.VITE_BACKEND_URL;

  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [text, setText] = useState("");

  const token = localStorage.getItem("id_token");

  // pobieranie komentarzy
  useEffect(() => {
    const token = localStorage.getItem("id_token");

    fetch(`${API}/api/images/${image.id}/comments`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Błąd pobierania komentarzy:", res.status);
          return [];
        }
        return res.json();
      })
      .then((data) => setComments(data as Comment[]))
      .catch((err) => {
        console.error("Błąd komentarzy (network):", err);
        setComments([]);
      });
  }, [image.id, API]);


  // wysyłanie komentarza
  const sendComment = async () => {
    if (text.trim().length === 0 || text.length > 300) return;

    await fetch(`${API}/api/images/${image.id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ text }),
    });

    // odśwież komentarze po wysłaniu
    const res = await fetch(`${API}/api/images/${image.id}/comments`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    }

    setText("");
    setShowCommentBox(false);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px" }}>
      <img src={image.url} alt={image.caption} style={{ width: "100%" }} />

      <h4 style={{ marginTop: "1rem" }}>{image.caption}</h4>
      <small>{new Date(image.uploadTime).toLocaleDateString()}</small>

      <hr />

      {/* Lista komentarzy */}
      <div>
        <h4>Komentarze:</h4>

        {comments.length === 0 && (
          <p style={{ fontStyle: "italic", color: "#777" }}>
            Brak komentarzy.
          </p>
        )}

        {comments.map((c) => (
          <div key={c.id} style={{ marginBottom: "0.8rem" }}>
            <h5>User: {c.authorEmail}</h5> <br />
            <span>{c.text}</span> <br />
            <small style={{ color: "#777" }}>
              {new Date(c.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>

      {/* Przycisk */}
      <button
        style={{ marginTop: "0.5rem" }}
        onClick={() => setShowCommentBox(!showCommentBox)}
      >
        Skomentuj
      </button>

      {/* Formularz komentarza */}
      {showCommentBox && (
        <div style={{ marginTop: "1rem" }}>
          <textarea
            placeholder="Napisz komentarz (max 300 znaków)"
            maxLength={300}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "100%", minHeight: "60px" }}
          />

          <button
            onClick={sendComment}
            style={{ marginTop: "0.5rem", width: "100%" }}
          >
            Wyślij
          </button>
        </div>
      )}
    </div>
  );
}

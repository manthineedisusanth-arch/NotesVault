import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("notes")) || [];
      // Filter out corrupted data from previous app versions
      return saved.filter((note) => note && note.id && note.subject);
    } catch (e) {
      return [];
    }
  });

  const [text, setText] = useState("");
  const [subject, setSubject] = useState("General");
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);
  const [activeAlbum, setActiveAlbum] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [noteColor, setNoteColor] = useState("default");

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [dark]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFile(reader.result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  function addNote() {
    if (text.trim() === "" && !file) return;

    const newNote = {
      id: Date.now(),
      text: text,
      subject: subject,
      file: file,
      color: noteColor,
      pinned: false,
      timestamp: new Date().toLocaleString(),
    };

    setNotes([newNote, ...notes]);
    setText("");
    setSubject("General");
    setNoteColor("default");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id));
  }

  function togglePin(id) {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note,
      ),
    );
  }

  const subjectsList = ["General", "Work", "Personal", "Study", "Ideas"];
  const colorsList = [
    { name: "Default", value: "default" },
    { name: "Red", value: "red" },
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Yellow", value: "yellow" },
  ];
  const albums = ["All", ...new Set(notes.map((note) => note.subject))];

  const filteredAndSortedNotes = notes
    .filter((note) => {
      const matchesSearch = note.text
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesAlbum =
        activeAlbum === "All" || note.subject === activeAlbum;
      return matchesSearch && matchesAlbum;
    })
    .sort((a, b) => {
      if (a.pinned === b.pinned) return b.id - a.id;
      return a.pinned ? -1 : 1;
    });

  return (
    <div className="app">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <header>
        <div className="header-content">
          <h1>NotesVault Pro</h1>
          <div className="header-actions">
            <div className="view-toggle">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>
            <button className="theme-toggle" onClick={() => setDark(!dark)}>
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="controls-section slide-down">
          <input
            type="text"
            placeholder="Search your vault..."
            className="search-input"
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="album-filters">
            {albums.map((album) => (
              <button
                key={album}
                className={`album-btn ${activeAlbum === album ? "active" : ""}`}
                onClick={() => setActiveAlbum(album)}
              >
                {album}
              </button>
            ))}
          </div>
        </div>

        <div className="create-section scale-in">
          <div className="input-row">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="ui-select"
            >
              {subjectsList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            <select
              value={noteColor}
              onChange={(e) => setNoteColor(e.target.value)}
              className={`ui-select color-${noteColor}`}
            >
              {colorsList.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name} Tag
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="What is on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="note-input"
            rows="3"
          />

          <div className="action-group">
            <div className="file-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="file-input"
              />
              {file && <span className="file-status">Image attached</span>}
            </div>
            <button className="add-btn" onClick={addNote}>
              Create Note
            </button>
          </div>
        </div>

        <div className={`notes-container ${viewMode}-view`}>
          {filteredAndSortedNotes.map((note) => (
            <div
              className={`note-card color-${note.color} fade-up`}
              key={note.id}
            >
              <div className="note-header">
                <div className="note-meta">
                  <span className="note-subject">{note.subject}</span>
                  <span className="note-date">{note.timestamp}</span>
                </div>
                <button
                  className={`pin-btn ${note.pinned ? "pinned" : ""}`}
                  onClick={() => togglePin(note.id)}
                >
                  {note.pinned ? "Unpin" : "Pin"}
                </button>
              </div>

              <p className="note-text">{note.text}</p>

              {note.file && (
                <div className="note-image-container">
                  <img src={note.file} alt="Attached" className="note-image" />
                </div>
              )}

              <div className="note-footer">
                <button
                  className="delete-btn"
                  onClick={() => deleteNote(note.id)}
                >
                  Delete Note
                </button>
              </div>
            </div>
          ))}
          {filteredAndSortedNotes.length === 0 && (
            <div className="empty-state">No notes found. Create one above.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
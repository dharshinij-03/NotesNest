import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";

const API = "http://localhost:4000/api/notes";

function App() {
  const [form, setForm] = useState({ title: "", details: "" });
  const [notes, setNotes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", details: "" });
  const [user, setUser] = useState(null);

  async function load() {
    const res = await axios.get(API);
    setNotes(res.data);
  }

  async function loadUser() {
    const res = await axios.get("http://localhost:4000/api/user", { withCredentials: true });
    setUser(res.data.user);
  }

  useEffect(() => {
    load();
    loadUser();
  }, []);

  async function addNote(e) {
    e.preventDefault();
    if (!form.title || !form.details) return alert("Enter all details");

    const res = await axios.post(API, form);
    setNotes([...notes, res.data]);
    setForm({ title: "", details: "" });
  }

  function startEdit(note) {
    setEditId(note._id);
    setEditForm({ title: note.title, details: note.details });
  }

  async function saveEdit(id) {
    if (!editForm.title || !editForm.details) return alert("Fill all fields");
    const res = await axios.put(`${API}/${id}`, editForm);
    setNotes(notes.map((n) => (n._id === id ? res.data : n)));
    setEditId(null);
    setEditForm({ title: "", details: "" });
  }

  async function remove(id) {
    await axios.delete(`${API}/${id}`);
    setNotes(notes.filter((n) => n._id !== id));
  }

  return (
    <div className="app-bg">
      <Navbar user={user} />

      <main className="container py-5">
        <h1 className="text-center fw-bold mb-4">📒 Your Notes</h1>

        {!user && (
          <div className="alert alert-warning text-center rounded-pill shadow-sm">
            Please login with Google to create and manage your notes.
          </div>
        )}

        {user && (
          <form onSubmit={addNote} className="note-form card p-4 shadow-sm mb-5">
            <h4 className="mb-3">Create a Note</h4>
            <input
              className="form-control mb-2"
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="form-control mb-3"
              placeholder="Details..."
              rows="3"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            ></textarea>
            <button className="btn btn-primary w-100 rounded-pill">Add Note</button>
          </form>
        )}

        {/* Notes Grid */}
        <div className="row">
          {notes.length === 0 ? (
            <p className="text-muted text-center">No notes yet</p>
          ) : (
            notes.map((n) => (
              <div key={n._id} className="col-md-4 mb-4">
                <div className="card note-card shadow-sm">
                  {editId === n._id ? (
                    <div className="card-body">
                      <input
                        className="form-control mb-2"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                      <textarea
                        className="form-control mb-2"
                        value={editForm.details}
                        onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                      ></textarea>
                      <button className="btn btn-success btn-sm me-2" onClick={() => saveEdit(n._id)}>
                        Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="card-body">
                      <h5 className="card-title">{n.title}</h5>
                      <p className="card-text">{n.details}</p>
                      {user && (
                        <div>
                          <button className="btn btn-warning btn-sm me-2" onClick={() => startEdit(n)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(n._id)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

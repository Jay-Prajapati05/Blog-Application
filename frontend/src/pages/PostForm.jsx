import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PostForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id); // /edit/:id => edit mode, /create => create mode
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // In edit mode, load the existing post and prefill the form
  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;

    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        if (ignore) return;

        const { post } = data;
        // UI check only, the backend also enforces ownership
        if (String(post.author?._id) !== user.id) {
          setLoadError("You can only edit your own posts");
          return;
        }
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags.join(", "));
      } catch (err) {
        if (!ignore) {
          setLoadError(err.response?.data?.message || "Failed to load post");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      ignore = true;
    };
  }, [id, isEdit, user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { title, content, tags };
      const { data } = isEdit
        ? await api.put(`/posts/${id}`, payload)
        : await api.post("/posts", payload);

      navigate(`/posts/${data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save post");
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (loadError) return <p className="error">{loadError}</p>;

  return (
    <div>
      <h1>{isEdit ? "Edit post" : "Create post"}</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          rows="10"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          id="tags"
          type="text"
          placeholder="react, hooks"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Publish"}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
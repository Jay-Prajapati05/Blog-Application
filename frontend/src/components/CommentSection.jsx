import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/formatDate";

const MAX_LENGTH = 500;

const CommentSection = ({ postId }) => {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Prefill the name once the logged-in user is restored (keep what the user typed)
  useEffect(() => {
    setName((prev) => prev || user?.name || "");
  }, [user]);

  useEffect(() => {
    let ignore = false;

    const fetchComments = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/posts/${postId}/comments`);
        if (!ignore) setComments(data.comments);
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load comments");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      ignore = true;
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !text.trim()) {
      setFormError("Name and comment are required");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { name, text });
      // Show the new comment at the top without refetching the list
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comments">
      <h2>Comments ({comments.length})</h2>

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          rows="3"
          placeholder="Write a comment..."
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span className="hint">
          {text.length}/{MAX_LENGTH}
        </span>
        {formError && <p className="error">{formError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>

      {loading && <p>Loading comments...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && comments.length === 0 && (
        <p>No comments yet. Be the first to comment!</p>
      )}

      {comments.map((c) => (
        <div key={c._id} className="comment">
          <p className="meta">
            <strong>{c.name}</strong> · {formatDate(c.createdAt)}
          </p>
          <p>{c.text}</p>
        </div>
      ))}
    </section>
  );
};

export default CommentSection;
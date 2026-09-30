import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";
import { formatDate } from "../utils/formatDate";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/posts/${id}`);
        if (!ignore) setPost(data.post);
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load post");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete post");
      setDeleting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p className="error">{error || "Post not found"}</p>;

  // UI convenience only, the backend enforces the real ownership check
  const isAuthor = user && post.author && user.id === String(post.author._id);

  return (
    <div>
      <article className="post-detail">
        <h1>{post.title}</h1>
        <p className="meta">
          By {post.author?.name || "Unknown"} · {formatDate(post.createdAt)}
        </p>

        {post.tags.length > 0 && (
          <div className="tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="post-content">{post.content}</div>

        {error && <p className="error">{error}</p>}

        {isAuthor && (
          <div className="actions">
            <button onClick={() => navigate(`/edit/${post._id}`)}>Edit</button>
            <button className="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </article>

      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostDetail;
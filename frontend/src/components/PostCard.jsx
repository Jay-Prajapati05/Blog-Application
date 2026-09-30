import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

const EXCERPT_LENGTH = 150;

const PostCard = ({ post }) => {
  const excerpt =
    post.content.length > EXCERPT_LENGTH
      ? `${post.content.slice(0, EXCERPT_LENGTH)}...`
      : post.content;

  return (
    <article className="post-card">
      <h2>
        <Link to={`/posts/${post._id}`}>{post.title}</Link>
      </h2>
      {/* author can be null if the user was deleted */}
      <p className="meta">
        By {post.author?.name || "Unknown"} · {formatDate(post.createdAt)}
      </p>
      <p>{excerpt}</p>
      {post.tags.length > 0 && (
        <div className="tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default PostCard;
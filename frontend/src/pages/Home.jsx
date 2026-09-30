import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the source of truth for page and search
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, totalPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ignore the response if the user changed page/search before it arrived
    let ignore = false;

    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/posts", { params: { page, search } });
        if (!ignore) {
          setPosts(data.posts);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load posts");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      ignore = true;
    };
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    // A new search always starts from page 1
    setSearchParams(term ? { search: term } : {});
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const params = {};
    if (search) params.search = search;
    if (newPage > 1) params.page = newPage;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search posts by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
        {search && (
          <button type="button" onClick={handleClear}>
            Clear
          </button>
        )}
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && posts.length === 0 && <p>No posts found.</p>}

      {!loading && posts.map((post) => <PostCard key={post._id} post={post} />)}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Home;
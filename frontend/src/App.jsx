import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import PostForm from "./pages/PostForm";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <PostForm  key="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <PostForm key="create"  />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}

export default App;

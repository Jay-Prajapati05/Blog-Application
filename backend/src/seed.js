import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB  from "./config/db.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/comment.js";

// Safety guard: never wipe a production database
if (process.env.NODE_ENV === "production") {
  console.error("Seeding is disabled in production");
  process.exit(1);
}

const SEED_PASSWORD = "password123";

const usersData = [
  { name: "Ana Sharma", email: "ana@example.com" },
  { name: "Rohan Patel", email: "rohan@example.com" },
  { name: "Meera Iyer", email: "meera@example.com" },
];

// authorIndex points to a user in usersData
const postsData = [
  { title: "Getting started with Node.js", tags: ["node", "backend"], authorIndex: 0,
    content: "Node.js lets you run JavaScript on the server. Start with a simple Express app and build from there." },
  { title: "Understanding React hooks", tags: ["react", "frontend"], authorIndex: 1,
    content: "Hooks like useState and useEffect let function components manage state and side effects cleanly." },
  { title: "MongoDB schema design basics", tags: ["mongodb", "database"], authorIndex: 2,
    content: "Choose between embedding and referencing based on how your data is queried and how it grows." },
  { title: "JWT authentication explained", tags: ["auth", "node"], authorIndex: 0,
    content: "A JWT carries signed claims. The server verifies the signature on every request, so no session storage is needed." },
  { title: "React Router v6 in practice", tags: ["react", "routing"], authorIndex: 1,
    content: "Dynamic routes like /posts/:id combine with useParams to render detail pages for any record." },
  { title: "Why controllers and services are separate", tags: ["architecture", "backend"], authorIndex: 2,
    content: "Controllers handle HTTP, services hold business logic. This keeps code reusable and easy to test." },
  { title: "Pagination done right", tags: ["api", "backend"], authorIndex: 0,
    content: "Use skip and limit with a stable sort order, and always return total counts so the UI can build page links." },
  { title: "CSS Grid vs Flexbox", tags: ["css", "frontend"], authorIndex: 1,
    content: "Flexbox is great for one-dimensional layouts, Grid for two-dimensional ones. Use both together." },
  { title: "Error handling in Express", tags: ["express", "node"], authorIndex: 2,
    content: "A central error handler with custom error classes gives consistent responses and keeps controllers clean." },
  { title: "Form handling in React", tags: ["react", "forms"], authorIndex: 0,
    content: "Controlled inputs keep form state in React. Validate on submit and show clear error messages." },
  { title: "Deploying a MERN app", tags: ["deployment", "mern"], authorIndex: 1,
    content: "Deploy the API and the client separately, and configure environment variables and CORS carefully." },
  { title: "Git habits every developer needs", tags: ["git", "tools"], authorIndex: 2,
    content: "Commit small, write meaningful messages, and use branches for every feature or fix." },
];

const commentsData = [
  { name: "Aarav", text: "Great explanation, very helpful!" },
  { name: "Priya", text: "This cleared up my confusion, thanks." },
  { name: "Kabir", text: "Could you write a follow-up on this topic?" },
];

const seed = async () => {
  await connectDB();

  console.log("Clearing old data...");
  await Promise.all([User.deleteMany(), Post.deleteMany(), Comment.deleteMany()]);

  console.log("Creating users...");
  const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
  const users = await User.insertMany(
    usersData.map((u) => ({ ...u, password: hashed }))
  );

  console.log("Creating posts...");
  // Spread createdAt one hour apart so the newest-first ordering is predictable
  const now = Date.now();
  const posts = await Post.insertMany(
    postsData.map((p, i) => ({
      title: p.title,
      content: p.content,
      tags: p.tags,
      author: users[p.authorIndex]._id,
      createdAt: new Date(now - (postsData.length - i) * 60 * 60 * 1000),
    }))
  );

  console.log("Creating comments...");
  // Add comments to the first five posts
  const comments = posts.slice(0, 5).flatMap((post) =>
    commentsData.map((c) => ({ postId: post._id, name: c.name, text: c.text }))
  );
  await Comment.insertMany(comments);

  console.log(
    `Done: ${users.length} users, ${posts.length} posts, ${comments.length} comments`
  );
  console.log(`Login with any seeded email and password "${SEED_PASSWORD}"`);

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
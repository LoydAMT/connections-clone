import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CreateGame from "./pages/CreateGame.jsx";
import EditGame from "./pages/EditGame.jsx";
import BrowseGames from "./pages/BrowseGames.jsx";
import PlayGame from "./pages/PlayGame.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/" className="app-title">
            Connections<span className="app-title-dot">.</span>
          </Link>
          <ThemeToggle />
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateGame />} />
            <Route path="/edit/:id" element={<EditGame />} />
            <Route path="/play" element={<BrowseGames />} />
            <Route path="/play/:id" element={<PlayGame />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

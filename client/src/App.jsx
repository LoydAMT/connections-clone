import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CreateGame from "./pages/CreateGame.jsx";
import BrowseGames from "./pages/BrowseGames.jsx";
import PlayGame from "./pages/PlayGame.jsx";

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/" className="app-title">
            Connections<span className="app-title-dot">.</span>
          </Link>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateGame />} />
            <Route path="/play" element={<BrowseGames />} />
            <Route path="/play/:id" element={<PlayGame />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <p className="home-tagline">Group words that share a common thread.</p>
      <div className="home-choices">
        <Link to="/create" className="choice-card">
          <div className="choice-icon">✏️</div>
          <h2>Create a Game</h2>
          <p>Make your own puzzle with 4 categories of 4 words and share it.</p>
        </Link>
        <Link to="/play" className="choice-card">
          <div className="choice-icon">🎮</div>
          <h2>Play Games</h2>
          <p>Browse puzzles made by others and try to solve them.</p>
        </Link>
      </div>
    </div>
  );
}

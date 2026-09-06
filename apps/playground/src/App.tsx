import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ChallengePage } from "./screens/ChallengePage";
import { Home } from "./screens/Home";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/challenges/:challengeId" element={<ChallengePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

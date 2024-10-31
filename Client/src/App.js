import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Editor from "./components/Editor";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <div className="text-white">
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/editor/:id" element={<Editor />}></Route>
      </Routes>
    </div>
  );
}

export default App;

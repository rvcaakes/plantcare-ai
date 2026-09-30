import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Detection from "./pages/Detection";
import Preview from "./pages/Preview";
import Result from "./pages/Result";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detection" element={<Detection />} />
      <Route path="/preview" element={<Preview />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}

export default App;
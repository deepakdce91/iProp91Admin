import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

import Dashboard from "./scenes/dashboard";

import State from "./scenes/state";
import City from "./scenes/city";
import Builders from "./scenes/builders";
import Projects from "./scenes/projects";
import DocumentType from "./scenes/documentType";
import RejectedReasons from "./scenes/rejectedReasons";
import MoreInfoReasons from "./scenes/moreInfoReasons";
import Property from "./scenes/property";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar  isSidebar={isSidebar} />
          <main className="content h-full  overflow-scroll">
            <Topbar  setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/state" element={<State />} />
              <Route path="/city" element={<City />} />
              <Route path="/builders" element={<Builders />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/documentType" element={<DocumentType />} />
              <Route path="/rejectedReasons" element={<RejectedReasons />} />
              <Route path="/moreInfoReasons" element={<MoreInfoReasons />} />
              <Route path="/property" element={<Property />} />

            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

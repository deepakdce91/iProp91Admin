import { useState,useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

import Dashboard from "./scenes/dashboard";

import State from "./scenes/configurations/state";
import City from "./scenes/configurations/city";
import Builders from "./scenes/configurations/builders";
import Projects from "./scenes/configurations/projects";
import DocumentType from "./scenes/configurations/documentType";
import RejectedReasons from "./scenes/configurations/rejectedReasons";
import MoreInfoReasons from "./scenes/configurations/moreInfoReasons";
import Property from "./scenes/general/property";
import Users from "./scenes/general/users";
import Auth from "./scenes/auth";



import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";


function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Set the document title
    document.title = "Iprop91 Admin";

    // Create or update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Iprop91 is a website for ease of real estate buying..");
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "This is a description of the page.";
      document.head.appendChild(meta);
    }

    // Clean up meta tags on component unmount if necessary
    return () => {
      if (metaDescription) {
        document.head.removeChild(metaDescription);
      }
    };
  }, []); 

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <div className="app">

          {!(location.pathname === "/auth") && (
            <Sidebar isSidebar={isSidebar} />
          )}

          <main className="content h-full  overflow-scroll">
            {!(location.pathname === "/auth") && (
              <Topbar setIsSidebar={setIsSidebar} />
            )}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/state" element={<State />} />
              <Route path="/city" element={<City />} />
              <Route path="/builders" element={<Builders />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/documentType" element={<DocumentType />} />
              <Route path="/rejectedReasons" element={<RejectedReasons />} />
              <Route path="/moreInfoReasons" element={<MoreInfoReasons />} />
              <Route path="/property" element={<Property />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </main>
          
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

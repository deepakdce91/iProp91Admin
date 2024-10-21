import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Or any other theme
import 'primereact/resources/primereact.min.css';  // Core CSS
import 'primeicons/primeicons.css';  // Icons



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
import Login from "./scenes/auth/login";
import Signup from "./scenes/auth/signup";
import Documents from "./scenes/general/documents"

import GroupFormation from "./scenes/configurations/groupFormation";
import Conversations from "./scenes/configurations/conversations";
import ReportedMessages from "./scenes/configurations/reportedMessages";


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import useAuthToken from "./hooks/useAuthToken";  // Custom hook for JWT token handling
import useMetaTags from "./hooks/useMetaTags";    // Custom hook for meta tags


// Constants for routes
const routes = {
  login: "/login",
  signup: "/signup",
  home: "/",
  state: "/state",
  city: "/city",
  builders: "/builders",
  projects: "/projects",
  documentType: "/documentType",
  rejectedReasons: "/rejectedReasons",
  moreInfoReasons: "/moreInfoReasons",

  groupFormation : "/groupFormation",
  conversations : "/conversations",
  reportedMessages : "/reportedMessages",

  property: "/property",
  users: "/users",
  documents : "/documents"
};

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);


  const [userId, setUserId] = useState();
  const [userToken, setUserToken] = useState();

  const changeLoginStatus = ()=>{
    setLoggedIn(!loggedIn)
  }

  // useeffecttt
  useEffect(() => {
    try {
      // getting userId and userToken
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  }, [loggedIn]);


  // Custom hook to manage JWT token
    useAuthToken(navigate);
  

  // Custom hook for meta tag updates
  useMetaTags({
    title: "iProp91 Admin",
    description: "Iprop91 is a website for ease of real estate buying."
  });


  

  // Check if the current route is login or signup
  const isAuthRoute = location.pathname === routes.login || location.pathname === routes.signup;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <div className="app">
          {!isAuthRoute && <Sidebar isSidebar={isSidebar} />}

          <main className="content h-full overflow-scroll">
            {!isAuthRoute && <Topbar setIsSidebar={setIsSidebar} />}
            <Routes>
              <Route path={routes.login} element={<Login changeLoginStatus ={ changeLoginStatus}/>} />
              <Route path={routes.signup} element={<Signup changeLoginStatus ={ changeLoginStatus}/>} />

              {userId && userToken && <>

              <Route path={routes.home} element={<Dashboard />} />
              <Route path={routes.state} element={<State />} />
              <Route path={routes.city} element={<City />} />
              <Route path={routes.builders} element={<Builders />} />
              <Route path={routes.projects} element={<Projects />} />
              <Route path={routes.documentType} element={<DocumentType />} />
              <Route path={routes.rejectedReasons} element={<RejectedReasons />} />
              <Route path={routes.moreInfoReasons} element={<MoreInfoReasons />} />

              <Route path={routes.groupFormation} element={< GroupFormation/>} />
              <Route path={routes.conversations} element={<Conversations userId={userId} userToken={userToken}/>} />
              <Route path={routes.reportedMessages} element={<ReportedMessages />} />

              <Route path={routes.property} element={<Property />} />
              <Route path={routes.users} element={<Users />} />
              <Route path={routes.documents} element={<Documents />} />
              </>}
              
            </Routes>

            <ToastContainer
        position="top-center"
        autoClose={2000} // Ensure toasts auto-close
        hideProgressBar={false} // Show the progress bar
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
      />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

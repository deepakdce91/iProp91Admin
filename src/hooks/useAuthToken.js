import { useEffect } from "react";
// import {jwtDecode} from "jwt-decode";
import { useLocation } from "react-router-dom";

const useAuthToken = (navigate) => {

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("iProp-token");
    if (!token) {
      if(!(location.pathname === "/login" || location.pathname === "/signup")){
        console.log("No token found, redirecting to login.");
        navigate("/login");
      }
        
    }
  }, [navigate]);
};

export default useAuthToken;

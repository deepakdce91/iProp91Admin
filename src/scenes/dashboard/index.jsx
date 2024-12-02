import { Box } from "@mui/material";
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 
import { client } from "../../config/s3Config"; 

import Header from "../../components/Header";



const Dashboard = () => {

  const getTokenInfo = (e) =>{
    e.preventDefault();

    let token = localStorage.getItem("iProp-token");
    if(token){
      console.log(token);
      const decoded = jwtDecode(token);
      console.log(decoded);
    }else{
      console.log("You are not authenticated.")
    }
    
  }

  const handleLogout = () =>{
    localStorage.removeItem("iProp-token")
    console.log("Logging out")
     setTimeout(() => {
      window.location.reload(); 
     }, 200);
  }


  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" /> 
      </Box>

      <button className="p-3 bg-gray-300 text-black" onClick={getTokenInfo}>
        get token info 
      </button>

      <button className="p-3 mt-5 text-gray-300 bg-red-500" onClick={handleLogout}>
        logout 
      </button>


    </Box>
  );
};

export default Dashboard;

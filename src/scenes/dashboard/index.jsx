import { Box } from "@mui/material";
import React, { useState } from "react";

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 
import { client } from "../../config/s3Config"; 


import Header from "../../components/Header";


const Dashboard = () => {

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileURL, setFileURL] = useState("");
  const [message, setMessage] = useState("");

  const [filePath, setFilePath] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload the file to Supabase S3
const uploadFile = async(myFile)  =>  {

  console.log("upload clicked")
  console.log(myFile.name);

  const userNumber = "5566556656"
  const myPath = `propertyDocs/${userNumber}/${myFile.name}`
  try {
    const uploadParams = {
      Bucket: process.env.REACT_APP_PROPERTY_BUCKET, 
      Key: myPath, 
      Body: myFile, // The file content
      ContentType: myFile.type, // The MIME type of the file
    };

    console.log(uploadParams);

    const command = new PutObjectCommand(uploadParams);
    let response = await client.send(command);

    console.log("uploaded successfully", response);


    return myPath; //  return the file path
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};


//get signed url
const getSignedUrlForPrivateFile = async(path) => {
  try {
    const getParams = {
      Bucket: process.env.REACT_APP_PROPERTY_BUCKET, 
      Key: path, 
    };

    const command = new GetObjectCommand(getParams);
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // URL valid for 1 hour

    console.log('Signed URL:', signedUrl);
    return signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};


  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" /> 
      </Box>

      <div>
      <h2>Upload a File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={()=>{
        uploadFile(selectedFile)
      }}>Upload</button>
      
    </div>

    <button onClick={()=>{
      const accessKeyId = process.env.REACT_APP_S3_ACCESS_KEY_ID;
      const secretAccessKey = process.env.REACT_APP_S3_SECRET_ACCESS_KEY;
      
      console.log(accessKeyId, secretAccessKey);
    }}>
      printttt
    </button>

    <input className="text-black" value={filePath} onChange={(e)=>{
      e.preventDefault();
      setFilePath(e.target.value);
    }} type="text" />

    <button onClick={()=>{
      console.log(getSignedUrlForPrivateFile(filePath))
    }}>GET PUBLIC URL</button>

    </Box>
  );
};

export default Dashboard;

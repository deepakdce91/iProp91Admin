import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { removeSpaces } from "../../../MyFunctions";
import { useTheme } from "@mui/material";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";

import {formatDate} from "../../../MyFunctions"

// ------------------
const EditSafe = ({ userId, userToken, safeId, fieldName, propertyId }) => {
  const theme = useTheme();

  const [myArr, setMyArr] = useState([]);
  const [arrWithUrl, setArrWithUrl] = useState([]);

  const [isUploading, setIsUploading] = useState(false);

  const fetchFieldData = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/safe/adminFetchCategoryDocuments/${propertyId}/${fieldName}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          if (response.data.data) {
            setMyArr(response.data.data);
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const addFile = async (body) => {
    await axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/safe/adminAddDocument/${propertyId}/${fieldName}?userId=${userId}`,
        body,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast.success("Document Added.");
          fetchFieldData();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const deleteFile = async (id) => {
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/safe/adminDeleteDocument/${propertyId}/${fieldName}/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Document deleted.");
          fetchFieldData();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };
  // Remove object by index
  const handleRemove = (index) => {
    deleteFile(myArr[index]._id);
  };

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (safeId, fieldName, myFile) => {
    const myFileName = removeSpaces(myFile.name); // removing blank space from name
    const myPath = `documentsSafe/${safeId}/${fieldName}/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
        Key: myPath,
        Body: myFile, // The file content
        ContentType: myFile.type, // The MIME type of the file
      };
      const command = new PutObjectCommand(uploadParams);
      await client.send(command);
      return { myFileName, myPath }; // return the file path and name
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    setIsUploading(true);

    try {
      // Check if a file was selected
      const item = e.target.files[0];
      if (!item) {
        // User clicked cancel, exit the function
        setIsUploading(false);
        toast.info("No file selected.");
        return;
      }

      let cloudFileDetails = await uploadFileToCloud(safeId, fieldName, item);

      if (cloudFileDetails) {
        const addedFile = {
          name: cloudFileDetails.myFileName,
          path: cloudFileDetails.myPath,
        };

        // Save added document
        addFile(addedFile);

        setIsUploading(false);
      }
    } catch (error) {
      toast.error("Some ERROR occurred.");
      setIsUploading(false);
      console.log(error.message);
    }
  };

  useEffect(() => {
    // Function to get signed URL
    const getSignedUrlForPrivateFile = async (path) => {
      try {
        const getParams = {
          Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
          Key: path,
          ResponseContentDisposition: "inline",
        };

        const command = new GetObjectCommand(getParams);
        const signedUrl = await getSignedUrl(client, command, {
          expiresIn: 3600,
        }); // URL valid for 1 hour

        return signedUrl;
      } catch (error) {
        console.error("Error getting signed URL:", error);
        throw error;
      }
    };

    // Function to update paths with signed URLs
    async function updatePathsWithSignedUrl(arr) {
      return Promise.all(
        arr.map(async (obj) => {
          return {
            ...obj, // Spread the original object properties
            path: await getSignedUrlForPrivateFile(obj.path), // Replace path with signed URL
          };
        })
      );
    }

    // Fetch the URLs and update the state
    const fetchUrl = async () => {
      try {
        const newUrlArray = await updatePathsWithSignedUrl(myArr);
        if (newUrlArray) {
          setArrWithUrl(newUrlArray);
        }
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };

    // Call fetchUrl
    fetchUrl();
  }, [myArr]);

  // fetching field data
  useEffect(() => {
    fetchFieldData();
  }, []);

  return (
    <div>
      {/* Form for adding a new object */}
      <div>
        <h2 className="text-lg mb-2">Add New Documents</h2>

        <div className="pr-10">
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            onChange={handleFileUpload}
          />
          {isUploading === true && (
            <div className="flex items-center">
              <img
                className="ml-2 mt-2 h-8 w-7  "
                src={`${
                  theme.palette.mode === "dark"
                    ? "/spinner-white.svg"
                    : "/spinner.svg"
                }`}
                alt="upload-spinner"
              />
              <p className="ml-2 mt-1">Uploading..</p>
            </div>
          )}
        </div>
      </div>

      {/* Display the array */}
      <div className="my-5">
        <h3 className=" text-lg my-2 font-extrabold">Documents List</h3>
        {myArr.length === 0 && "No Document uploaded Yet"}
        <ul>
          {myArr?.map((obj, index) => (
            <li key={index} className="my-4">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <p>
                    <span className="font-bold">Document Name:</span> {obj.name}
                  </p>
                  <p>
                    <span className="font-bold">Uploaded on:</span> {formatDate(obj.createdAt)}
                  </p>
                 
                </div>
                <div className="flex">
                  {(arrWithUrl.length > 0 &&  arrWithUrl[index])  && <a
                    target="_blank" href={arrWithUrl[index]["path"]}
                    className="bg-blue-500 mr-3 flex p-2 justify-center items-center rounded-sm text-white"
                    onClick={() => {}}
                  >
                    <FaEye className="h-4 w-4 mr-1" /> View
                  </a>}
                  <button
                    className="bg-red-500  flex p-2 justify-center items-center rounded-sm text-white"
                    onClick={() => handleRemove(index)}
                  >
                    <RiDeleteBin5Fill className="h-4 w-4 mr-1" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditSafe;

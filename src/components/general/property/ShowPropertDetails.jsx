import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "../../../config/s3Config";


//get signed url---will be used sooon
const getSignedUrlForPrivateFile = async (path) => {
  try {
    const getParams = {
      Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
      Key: path,
      ResponseContentDisposition: "inline",
    };

    const command = new GetObjectCommand(getParams);
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // URL valid for 1 hour

    return signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
};

const ShowPropertyDetails = ({ data }) => {
  const theme = useTheme();
  // theme.palette.mode  === "dark"

  const [updateData, setUpdateData] = useState(data);
  const [documentArray, setDocumentArray] = useState([]);

  const getUrlsArray = (pathArray) => {
    pathArray.map(async (path) => {
      let url = await getSignedUrlForPrivateFile(path);
      setDocumentArray((prevItems) => [...prevItems, url]);
    });
  };

  const changeField = (field, value) => {
    setUpdateData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setTimeout(() => {
      axios
        .put(
          `http://localhost:3700/api/property/updateproperty/${data._id}`,
          updateData
        )
        .then((response) => {
          if (response) {
            toast.success("Field updated!");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Some ERROR occurred.");
        });
    }, 200);
  };



  useEffect(() => {
    getUrlsArray(data.documents.files);
  }, []);

  return (
    <>
    <div className="w-full mx-auto p-4 pt-2 md:p-6 lg:p-12 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-8 text-black ">Property Details</h2>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Customer Name
          </label>
          <p className="text-gray-900">{data.customerName}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Customer Number
          </label>
          <p className="text-gray-900">{data.customerNumber}</p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Property Name
          </label>
          <p className="text-gray-900">{data.name}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            State
          </label>
          <p className="text-gray-900">{data.state}</p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            City
          </label>
          <p className="text-gray-900">{data.city}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Builder
          </label>
          <p className="text-gray-900">{data.builder}</p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Project
          </label>
          <p className="text-gray-900">{data.project}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Tower
          </label>
          <p className="text-gray-900">{data.tower}</p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Unit
          </label>
          <p className="text-gray-900">{data.unit}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Size (sq. ft.)
          </label>
          <p className="text-gray-900">{data.size}</p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Nature
          </label>
          <p className="text-gray-900">{data.nature}</p>
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Status
          </label>
          <p className="text-gray-900">{data.status}</p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3 mb-6 md:mb-0">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Documents
          </label>
          {documentArray.length > 0 && <ul className="list-disc pl-4">
            {data.documents.files.map((file, index) => (
              <li  className="text-gray-800" key={index}>
                {file.split("/")[file.split("/").length - 1]} {" "} 
                <a href={documentArray[index]} target="_blank" className="ml-2 underline" >View</a>
              </li>
            ))}
          </ul>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row -mx-3 uppercase tracking-wide text-gray-700 text-xs font-bold">
        <div className="w-full px-3 md:w-1/2">
          <div className="mb-5">
            <label htmlFor="applicationStatus" className="mb-3 block ">
              Application Status
            </label>
            <select
              id="applicationStatus"
              value={updateData.applicationStatus}
              onChange={(e) => changeField("applicationStatus", e.target.value)}
              className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
            >
              <option value="">Select...</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="more-info-required">More info required</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-5 uppercase tracking-wide text-gray-700 text-xs font-bold">
        <label className="mb-3 block ">Delete Property?</label>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="radio"
              name="enable"
              value="yes"
              className="h-5 w-5"
              id="radioButton1"
              checked={updateData.isDeleted === "yes"}
              onChange={(e) => changeField("isDeleted", e.target.value)}
            />
            <label htmlFor="radioButton1" className="pl-3  font-medium">
              Yes
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="enable"
              value="no"
              className="h-5 w-5"
              id="radioButton2"
              checked={updateData.isDeleted === "no"}
              onChange={(e) => changeField("isDeleted", e.target.value)}
            />
            <label htmlFor="radioButton2" className="pl-3  font-medium">
              No
            </label>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div> 


    
    </>
  );
};

export default ShowPropertyDetails;

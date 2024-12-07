import axios from "axios";
import React, { useEffect, useState } from "react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { useTheme } from "@mui/material";
import { FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";

function areAllFieldsFilled(obj) {
  for (const key in obj) {
    if (typeof obj[key] !== 'string' || obj[key].trim() === '') {
      return false; // Return false if any field fails the check
    }
  }
  return true; // Return true if all fields are valid
}


function replaceKeysWithValues(inputString, replacements) {
  // Create a regular expression to match all keys in the replacements object
  const keysRegex = new RegExp(Object.keys(replacements).join("|"), "g");

  // Replace each key in the string with its corresponding value from the object
  return inputString.replace(
    keysRegex,
    (matchedKey) => replacements[matchedKey]
  );
}

function SendEmailModal({ data, closeModal }) {
  const theme = useTheme();

  // const valuesString = "yolo,fomo,yoyo,hoehoehoe";

  // Convert the comma-separated string into an array
  const valuesArray = data.variableNames.split(",").map((value) => value.trim());
  if(data.totalVariables === 0){ // 0 variables set the value to 0
    valuesArray.length = 0;      // bcoz for 0 var its coming 1
  }

  // Initialize state to store values for each input field
  const [inputValues, setInputValues] = useState(
    valuesArray.reduce((acc, value, index) => {
      acc[value] = ""; // Default values initialized from the array
      return acc;
    }, {})
  );

  const [emailAddress, setEmailAddress] = useState("");

  // Handle changes to input fields
  const handleInputChange = (field, newValue) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [field]: newValue,
    }));
  };

  const handleSubmit = (e) => {
    if(areAllFieldsFilled(inputValues) && emailAddress.length > 0){
      let finalBody;
      if(data.totalVariables > 0){
        finalBody = replaceKeysWithValues(data.body,inputValues);
      }else{
        finalBody = data.body;
      }

      // send email
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/sendEmail/sendSimpleEmail`,
        {
          to : emailAddress,
          subject : data.subject,
          body : finalBody
        }
        )
        .then((response) => {
          if (response.data) {
               if(response.data.success === true){
                toast.success("Email sent successfully!");
               }else{
                toast.error("Some error occured.");
               }
          closeModal();
          }
        })
        .catch((error) => {
          toast.error("Some error occured.");
          closeModal();
          console.error("Error:", error);
        });
    }else{
      toast.error("Fill all fields.");
    }
  };

  return (
    <div
      className={`fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] `}
    >
      <div
        className={`${
          theme.palette.mode === "dark"
            ? "text-gray-200 bg-[#090E17]"
            : "text-gray-800 bg-white"
        } w-full max-w-md  shadow-lg rounded-lg p-6 relative`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          onClick={closeModal}
          className="w-3 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
          viewBox="0 0 320.591 320.591"
        >
          <path
            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
            data-original="#000000"
          ></path>
          <path
            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
            data-original="#000000"
          ></path>
        </svg>

        <div className="my-4 text-center">
          <div className="flex  justify-center">
            <HiMiniUserGroup className="h-24 w-24 " />
          </div>
          <h4 className=" text-lg font-semibold mt-4">Send Email</h4>
          <p>Email Type : <strong>{data.templateName}</strong></p>
          <div className="flex items-center justify-center mt-4">
            <label htmlFor="emailAddress">{"To : "}</label>
            <input type="email" value={emailAddress} placeholder="Receiver's email address" onChange={(e)=>{setEmailAddress(e.target.value)}} className=" border-[1px]  text-gray-800 block w-[80%] pl-3 ml-2 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
          </div>
        </div>

        {data.totalVariables > 0 && <div className="text-center">Provide the values for dynamic varibales first </div>}
        {data.totalVariables > 0 && valuesArray.map((value, index) => {
          return (
            <div key={value+index} className="flex flex-col items-center" style={{ marginBottom: "10px" }}>
              <input
                className=" border-[1px] mt-3 text-gray-800 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                type="text"
                placeholder={value}
                value={inputValues[value] || ""}
                onChange={(e) => handleInputChange(value, e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </div>
          );
        })}

        <div className="flex flex-col space-y-2 ">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 mt-4 rounded-lg text-white text-sm tracking-wide bg-green-500 hover:bg-green-600 flex items-center justify-center active:bg-green-500"
          >
            Send <FaPaperPlane className="ml-2"/>
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendEmailModal;

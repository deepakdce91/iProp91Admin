import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getNameList } from "../../../MyFunctions";
import { getUniqueItems } from "../../../MyFunctions";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

import heic2any from "heic2any";
import { MdEdit } from "react-icons/md";

 

function PropertyForm({ editData, setModeToDisplay  }) {

  const fileInputRef = useRef(null);

  const [uploadedFile, setuploadedFile] = useState();

  const [isUploading, setIsUploading] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    profile : "",
    lastLogin : new Date(),
    visible: true,
  });

  const handleDivClick = () => {
    // Trigger the click event on the file input
    fileInputRef.current.click();
  };

  // Upload the file to Supabase S3
  const uploadedFileToCloud = async (myFile) => {
     
      const myPath = `propertyDocs/${addData.customerNumber}/${myFile.name}`;
      try {
        const uploadParams = {
          Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
          Key: myPath,
          Body: myFile, // The file content
          ContentType: myFile.type, // The MIME type of the file
        };
        const command = new PutObjectCommand(uploadParams);
        await client.send(command);
        return myPath; //  return the file path
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    
  };


  const handleFileAdding = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    console.log(file.name)

    setuploadedFile(file);

      // checking for .heic files and converting it into jpeg before adding
      // if (file.type === "image/heic") {
      //   try {
      //     // Convert .heic file to .png
      //     const convertedBlob = await heic2any({
      //       blob: file,
      //       toType: "image/jpeg",
      //     });

      //     // Create a new File object from the Blob
      //     const convertedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, ".jpeg"), {
      //       type: "image/jpeg",
      //     });

      //     setuploadedFiles((prevFiles) => [...prevFiles, convertedFile]);

      //   } catch (error) {
      //     console.error("Error converting HEIC file:", error);
      //   }
      // }else{
      //   // if file is not jpeg..adding directly
      //   setuploadedFiles((prevFiles) => [...prevFiles, file]);
      // }
   
  };

  const handleFileUpload = async(e) => {
    e.preventDefault();
    if(addData.phone.length === 10 ){
      const isNumeric = /^[0-9]*$/.test(addData.phone);
      if(!isNumeric){
        toast.error("Phone number should contain only number")
      }else{
        try {
          
              let cloudFilePath = await uploadedFileToCloud(uploadedFile);

              if(cloudFilePath){
                setAddData((prevData) => ({
                  ...prevData,
                  profile : cloudFilePath
                }));
                setuploadedFile();
              }
             
    
        } catch (error) {
          setIsUploading(false);
          toast.error("Some error occured while uploading.");
          console.log(error.message);
        }
      }
      
    }else{
      toast.error("Enter valid customer number");
      return
      
    }
  };

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

   
  };

  const handleSubmit = (addData) => {
    
      if (
        addData.name !== "" &&
        addData.phone !== "" 
      ) {
        if (editData) {
          axios
            .put(
              `http://localhost:3700/api/property/updateproperty/${editData._id}`,
              addData
            )
            .then((response) => {
              if (response) {
                toast("User updated!");
                setTimeout(() => {
                  setModeToDisplay();
                }, 2000);
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              toast.error("Some ERROR occurred.");
            });
        } else {
          const myData = {
            name : "",
            phone : "",
            email : "",
            profile : "",
            password : "",
            lastLogin : new Date(),
            visible : addData.visible || true
          }
          axios
            .post("http://localhost:3700/api/property/addproperty", myData)
            .then((response) => {
              if (response) {
                toast("User added!");
                setTimeout(() => {
                  setModeToDisplay();
                }, 2000);
               
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              toast.error("Some ERROR occurred.");
            });
        }
      } else {
        toast.error("Fill all the fields.");
      }
    
  };



  useEffect(() => {

    if (editData) {
      setAddData({
        name: editData.name,
        applicationStatus: editData.applicationStatus,
        state: editData.state,
        city: editData.city,
        builder: editData.builder,
        project: editData.project,
        tower: editData.tower,
        unit: editData.unit,
        size: editData.size,
        nature: editData.nature,
        enable : editData.enable,
        customerName : editData.customerName,
        customerNumber: editData.customerNumber,
        status: editData.status,
        isDeleted : editData.isDeleted,
        documents: {
          type: editData.documents.type,
          files: editData.documents.files,
        },
        addedBy: "admin",
      });
    }
  }, [editData]);

  return (
    <Box
      sx={{
        padding: "24px",
        "& .MuiInputBase-root": {
          backgroundColor: colors.primary[400],
          color: colors.grey[100],
          borderRadius: "4px",
          "&:hover": {
            borderColor: colors.blueAccent[700],
          },
        },
        "& .MuiInputLabel-root": {
          color: colors.grey[300],
          "&.Mui-focused": {
            color: colors.blueAccent[700],
          },
        },
        "& .MuiFormControl-root": {
          marginBottom: "16px",
        },
        "& .MuiSelect-root": {
          backgroundColor: colors.primary[400],
          color: colors.grey[100],
          borderRadius: "4px",
          "&:hover": {
            borderColor: colors.blueAccent[700],
          },
        },
        "& .MuiFormLabel-root": {
          color: colors.grey[100],
          "&.Mui-focused": {
            color: colors.greenAccent[300],
          },
        },
        "& .MuiRadio-root": {
          color: `${colors.greenAccent[200]} !important`,
        },
        "& .MuiButton-root": {
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
          "&:hover": {
            backgroundColor: colors.greenAccent[400],
          },
        },
        "& .MuiFormHelperText-root": {
          color: colors.grey[200],
        },
      }}
    >
      <div className="flex items-center justify-center">
        <div className="w-full">
          <form>

          <div className="relative w-fit">
          
          <img src="/logo192.png" className="h-40 w-40" />
          <div 
          onClick={handleDivClick}
          className="flex text-gray-400 hover:text-white absolute bottom-0 -right-8 items-end">
          <MdEdit className="w-6 h-6  rounded-full  "/>
          <span>Change</span>
          </div>
          <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileAdding}
      />

          

  
            </div>

            <div className="flex flex-col md:flex-row gap-2">

            <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 ">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label
                      htmlFor="fName"
                      className="text-lg font-medium"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={addData.name}
                      onChange={(e) => changeField("name", e.target.value)}
                      placeholder="Name"
                      className="w-full mt-[18px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

            <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label
                      htmlFor="phone"
                      className="text-lg font-medium"
                    >
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={addData.phone}
                      onChange={(e) => changeField("phone", e.target.value)}
                      placeholder="Phone number"
                      className="w-full mt-[18px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              

              {/* <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label
                      htmlFor="profile"
                      className="text-lg font-medium"
                    >
                      Profile picture
                    </label>
                    <input
                      type="file"
                      name="profile"
                      id="profile"
                      value={uploadedFile}
                      multiple={false}
                      onChange={handleFileAdding}
                      className="w-full mt-[18px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div> */}
             
            </div>

            <div className="flex flex-col md:flex-row gap-2">
            <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label
                      htmlFor="email"
                      className="text-lg font-medium"
                    >
                      Email
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      value={addData.email}
                      onChange={(e) => changeField("email", e.target.value)}
                      placeholder="Email"
                      className="w-full mt-[18px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label
                      htmlFor="password"
                      className="text-lg font-medium"
                    >
                      Password
                    </label>
                    <input
                      type="text"
                      name="password"
                      id="password"
                      value={addData.password}
                      onChange={(e) => changeField("password", e.target.value)}
                      placeholder="Password"
                      className="w-full mt-[18px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>
            
             
           

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Make user visible?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="enable"
                    value="yes"
                    className="h-5 w-5"
                    id="radioButton1"
                    checked={addData.isDeleted === "yes"}
                    onChange={(e) => changeField("isDeleted", e.target.value)}
                  />
                  <label
                    htmlFor="radioButton1"
                    className="pl-3 text-base font-medium"
                  >
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
                    checked={addData.isDeleted === "no"}
                    onChange={(e) => changeField("isDeleted", e.target.value)}
                  />
                  <label
                    htmlFor="radioButton2"
                    className="pl-3 text-base font-medium"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={() => handleSubmit(addData)}
                className={`px-8 py-3 ${
                  isUploading === true ? "bg-gray-600" : "bg-[#6A64F1]"
                }  text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading === true ? "bg-gray-600" : "hover:bg-[#5a52e0]"
                }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                disabled={isUploading === true ? true : false}
              >
                {editData ? "Update Property" : "Add Property"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default PropertyForm;

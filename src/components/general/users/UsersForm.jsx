import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getNameList } from "../../../MyFunctions";
import { getUniqueItems } from "../../../MyFunctions";

import heic2any from "heic2any";
import { MdEdit } from "react-icons/md";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "../../../config/s3Config";
// import { Preview } from "@mui/icons-material";

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

function PropertyForm({ editData, setModeToDisplay }) {
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(
    process.env.REACT_APP_DEFAULT_PROFILE_URL
  );

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    profilePicture: "",
    lastLogin: new Date(),
    visible: "true",
  });

  const handleDivClick = () => {
    // Trigger the click event on the file input
    fileInputRef.current.click();
  };

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (myFile) => {
    const myPath = `usersProfilePic/${myFile.name}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
        Key: myPath,
        Body: myFile, // The file content
        ContentType: myFile.type, // The MIME type of the file
      };
      const command = new PutObjectCommand(uploadParams);
      let success = await client.send(command);
      if (success) {
        changeField("profilePicture", myPath);
        return myPath; //  return the file path
      }
      return;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();

    setIsUploading(true);
    toast("Uploading Image.");
    const file = event.target.files[0];

    try {
      let cloudFilePath = await uploadFileToCloud(file);

      if (cloudFilePath) {
        setAddData((prevData) => ({
          ...prevData,
          profilePicture: cloudFilePath,
        }));
        let signedUrl = await getSignedUrlForPrivateFile(cloudFilePath);
        if (signedUrl) {
          toast.success("Profile picture changed!");
          setIsUploading(false);
          setPreviewUrl(signedUrl);
        }
      }
    } catch (error) {
      setIsUploading(true);
      toast.error("Some error occured while uploading.");
      console.log(error.message);
    }
  };

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = (addData) => {
    if (addData.name !== "" && addData.phone !== "") {
      if (editData) {
        console.log(addData);
        axios
          .put(
            `http://localhost:3700/api/users/updateuser/${editData._id}`,
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
        console.log(addData);
        // const myData = {
        //   name : "",
        //   phone : "",
        //   email : "",
        //   profilePicture : "",
        //   password : "",
        //   lastLogin : new Date(),
        //   visible : addData.visible || "true"
        // }
        axios
          .post("http://localhost:3700/api/users/adduser", addData)
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
      console.log(editData)
      setAddData({
        name: editData.name,
        phone: editData.phone,
        email: editData.email ,
        password: editData.password ,
        profilePicture: editData.profilePicture || "",
        lastLogin: editData.lastLogin || new Date(),
        visible: editData.visible || "true",
      });

      if (editData.profilePicture !== "") {
        setPreviewUrl(getSignedUrlForPrivateFile(editData.profilePicture));
      }
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
              <img
                src={previewUrl}
                className="h-32 w-32 rounded-full mb-5"
                alt="profile-picture"
              />

{isUploading === true ? (
                            <img
                              className="ml-2 mt-2 h-8 w-7 absolute bottom-0 -right-6 "
                              src={`${
                                theme.palette.mode === "dark"
                                  ? "/spinner-white.svg"
                                  : "/spinner.svg"
                              }`}
                              alt="upload-spinner"
                            />
                          ) : <div
                          onClick={handleDivClick}
                          className="flex text-gray-400 hover:text-white absolute bottom-0 -right-12 items-end"
                        >
                          <MdEdit className="w-6 h-6  rounded-full  " />
                          <span>Change</span>
                        </div>}

              

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 ">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label htmlFor="fName" className="text-lg font-medium">
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
                    <label htmlFor="phone" className="text-lg font-medium">
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
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label htmlFor="email" className="text-lg font-medium">
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
                    <label htmlFor="password" className="text-lg font-medium">
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
                    value={"true"}
                    className="h-5 w-5"
                    id="radioButton1"
                    checked={addData.visible === "true"}
                    onChange={(e) => changeField("visible", e.target.value)}
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
                    value={"false"}
                    className="h-5 w-5"
                    id="radioButton2"
                    checked={addData.visible === "false"}
                    onChange={(e) => changeField("visible", e.target.value)}
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
                {editData ? "Update User" : "Add User"}
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

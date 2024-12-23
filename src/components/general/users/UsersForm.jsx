import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import heic2any from "heic2any";
import { MdEdit } from "react-icons/md";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

import { supabase } from "../../../config/supabase";

import { TbAlertSquareRoundedFilled } from "react-icons/tb";
import { IoCheckboxOutline } from "react-icons/io5";

import { removeSpaces } from "../../../MyFunctions";

function UserForm({ editData, setModeToDisplay, userToken, userId }) {
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("/default-profile-pic.jpg");

  const [avatarPreview, setAvatarPreview] = useState("/default-avatar-pic.jpg");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    profilePicture: "",
    avatar: "",
    lastLogin: new Date(),
    suspended: "false",
    fraud: "false",
  });

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_PROFILE_PIC_BUCKET)
      .getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
    return data.publicUrl;
  };

  const handleDivClick1 = () => {
    // Trigger the click event on the file input
    fileInputRef1.current.click();
  };

  const handleDivClick2 = () => {
    // Trigger the click event on the file input
    fileInputRef2.current.click();
  };

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (myFile, localName) => {
    let myPath = "";
    if (localName === "avatar") {
      myPath = removeSpaces(`userAvatar/${myFile.name}`);
    } else {
      myPath = removeSpaces(`userProfilePicture/${myFile.name}`);
    }

    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_PROFILE_PIC_BUCKET,
        Key: myPath,
        Body: myFile, // The file content
        ContentType: myFile.type, // The MIME type of the file
      };
      const command = new PutObjectCommand(uploadParams);
      let success = await client.send(command);
      if (success) {
        if (localName === "avatar") {
          changeField("avatar", myPath);
        } else {
          changeField("profilePicture", myPath);
        }
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
    const localName = event.target.name;
    console.log(localName);

    if (localName === "avatar") {
      setIsAvatarUploading(true);
    } else {
      setIsUploading(true);
    }

    toast("Uploading Image.");
    const file = event.target.files[0];
    // checking for .heic files and converting it into jpeg before adding
    if (file.type === "image/heic") {
      try {
        // Convert .heic file to .png
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
        });

        // Create a new File object from the Blob
        const convertedFile = new File(
          [convertedBlob],
          file.name.replace(/\.heic$/i, ".jpeg"),
          {
            type: "image/jpeg",
          }
        );

        file = convertedFile;
      } catch (error) {
        console.error("Error converting HEIC file:", error);
      }
    }

    try {
      let cloudFilePath = await uploadFileToCloud(
        file,
        `${localName === "avatar" ? "userAvatar" : "userProfilePicture"}`
      );

      if (cloudFilePath) {
        setAddData((prevData) => ({
          ...prevData,
          profilePicture: cloudFilePath,
        }));
        let publicUrl = getPublicUrlFromSupabase(cloudFilePath);
        if (publicUrl) {
          toast.success(
            `${localName === "avatar" ? "Avatar" : "Profile picture"} changed!`
          );

          if (localName === "avatar") {
            setAvatarPreview(publicUrl);
            setIsAvatarUploading(false);
          } else {
            setPreviewUrl(publicUrl);
            setIsUploading(false);
          }
          if (localName === "avatar") {
            setAddData((prevData) => ({
              ...prevData,
              avatar: publicUrl,
            }));
          } else {
            setAddData((prevData) => ({
              ...prevData,
              profilePicture: publicUrl,
            }));
          }
        }
      }
    } catch (error) {
      if (localName === "avatar") {
        setIsAvatarUploading(false);
      } else {
        setIsUploading(false);
      }
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
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/users/updateuser/${editData._id}?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
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
        axios
          .post(
            `${process.env.REACT_APP_BACKEND_URL}/api/users/adduser?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
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
    const fetchData = async () => {
      if (editData) {
        setAddData({
          ...addData,
          name: editData.name,
          phone: editData.phone,
          email: editData.email,
          profilePicture: editData.profilePicture || "",
          avatar: editData.avatar || "",
          lastLogin: editData.lastLogin || new Date(),
          suspended: editData.suspended || "false",
          fraud: editData.fraud || "false",
        });

        if (editData.profilePicture !== "") {
          try {
            setPreviewUrl(editData.profilePicture); // Set the preview URL
          } catch (error) {
            console.error("Error fetching signed URL:", error);
          }
        }

        if (editData.avatar && editData.avatar !== "") {
          try {
            setAvatarPreview(editData.avatar); // Set the preview URL
          } catch (error) {
            console.error("Error fetching signed URL:", error);
          }
        }
      }
    };

    fetchData();
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
            <div className="flex mb-6">
              {/* // profile picture  */}
              <div className="flex flex-col justify-end relative mr-20">
                <img
                  src={previewUrl}
                  className="h-32 w-32 rounded-full mb-5"
                  alt="profile-picture"
                />

                <h3 className="text-lg text-center">Profile Picture</h3>

                {isUploading === true ? (
                  <img
                    className="ml-2 mt-2 h-8 w-7 absolute top-0 -right-6 "
                    src={`${
                      theme.palette.mode === "dark"
                        ? "/spinner-white.svg"
                        : "/spinner.svg"
                    }`}
                    alt="upload-spinner"
                  />
                ) : (
                  <div
                    onClick={handleDivClick1}
                    className="flex text-gray-400 hover:text-white absolute top-0 -right-14 items-end"
                  >
                    <MdEdit className="w-6 h-6  rounded-full  " />
                    <span>Change</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef1}
                  name="profilePicture"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </div>

              {/* // avatar  */}
              <div className="relative w-fit flex flex-col justify-end">
                <img
                  src={avatarPreview}
                  className="h-24 w-24 rounded-full "
                  alt="profile-picture"
                />
                <h3 className="text-lg text-center">Avatar</h3>

                {isAvatarUploading === true ? (
                  <img
                    className="ml-2 mt-2 h-8 w-7 absolute top-10 -right-6 "
                    src={`${
                      theme.palette.mode === "dark"
                        ? "/spinner-white.svg"
                        : "/spinner.svg"
                    }`}
                    alt="upload-spinner"
                  />
                ) : (
                  <div
                    onClick={handleDivClick2}
                    className="flex text-gray-400 hover:text-white absolute top-10 -right-12 items-end"
                  >
                    <MdEdit className="w-5 h-5  rounded-full  " />
                    <span className="text-xs">Change</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef2}
                  name="avatar"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </div>
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

                    {editData && (
                      <div
                        className={`w-full mt-[18px]  rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md flex items-center -center`}
                      >
                        {editData.password === "" ? (
                          <>
                            <TbAlertSquareRoundedFilled className="mr-2" />{" "}
                            <div>{"Password not set"}</div>
                          </>
                        ) : (
                          <>
                            <IoCheckboxOutline className="mr-2 text-green-400" />{" "}
                            <div>{"Password Set"}</div>
                          </>
                        )}

                        {/*   */}
                      </div>
                    )}

                    <input
                      type="text"
                      name="password"
                      id="password"
                      value={addData.password}
                      onChange={(e) => changeField("password", e.target.value)}
                      placeholder={
                        editData?.password === ""
                          ? "Set password"
                          : "Set new password"
                      }
                      className={`w-full mt-[18px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md flex items-center -center`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Mark user as fraud?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="fraud"
                    value={"true"}
                    className="h-5 w-5"
                    id="radioButton11"
                    checked={addData.fraud === "true"}
                    onChange={(e) => changeField("fraud", e.target.value)}
                  />
                  <label
                    htmlFor="radioButton11"
                    className="pl-3 text-base font-medium"
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="fraud"
                    value={"false"}
                    className="h-5 w-5"
                    id="radioButton22"
                    checked={addData.fraud === "false"}
                    onChange={(e) => changeField("fraud", e.target.value)}
                  />
                  <label
                    htmlFor="radioButton22"
                    className="pl-3 text-base font-medium"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Suspend user account?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="suspended"
                    value={"true"}
                    className="h-5 w-5"
                    id="radioButton1"
                    checked={addData.suspended === "true"}
                    onChange={(e) => changeField("suspended", e.target.value)}
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
                    name="suspended"
                    value={"false"}
                    className="h-5 w-5"
                    id="radioButton2"
                    checked={addData.suspended === "false"}
                    onChange={(e) => changeField("suspended", e.target.value)}
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
                  isUploading === true || isAvatarUploading === true
                    ? "bg-gray-600"
                    : "bg-[#6A64F1]"
                }  text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading === true || isAvatarUploading === true
                    ? "bg-gray-600"
                    : "hover:bg-[#5a52e0]"
                }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                disabled={
                  isUploading === true || isAvatarUploading === true
                    ? true
                    : false
                }
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

export default UserForm;

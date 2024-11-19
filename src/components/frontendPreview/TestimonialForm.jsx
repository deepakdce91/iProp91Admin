import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import { removeSpaces } from "../../MyFunctions";

import { supabase } from "../../config/supabase";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../config/s3Config";

import heic2any from "heic2any";


function TestimonialForm({ editData, userId, userToken, setModeToDisplay }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    testimonial: "",
    enable: "no",
  });

  const [myUserId, setMyUserId] = useState("IPA");
  const [userName, setUserName] = useState("");
  const [userProfilePic, setUserProfilePic] = useState("");

  const [uploadFile, setUploadFile] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [fileAddedForUpload, setFileAddedForUpload] = useState(false);


  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_SITE_BUCKET)
      .getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
    return {
      name: path.split("/")[path.split("/").length - 1],
      url: data.publicUrl,
    };
  };

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (myFile) => {
    const myFileName = removeSpaces(myFile.name); // removing blank space from name
    const myPath = `testimonialPFP/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_SITE_BUCKET,
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

        setUploadFile(convertedFile);
        setFileAddedForUpload(true);
      } catch (error) {
        console.error("Error converting HEIC file:", error);
      }
    } else {
      // if file is not jpeg..adding directly
      setUploadFile(file);
      setFileAddedForUpload(true);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      toast("Uploading file.");

      let cloudFilePath = await uploadFileToCloud(uploadFile);

      // when in last iteration
      if (cloudFilePath) {
        const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
        if (publicUrl) {
          setUserProfilePic(publicUrl);

          setIsUploading(false);
          setUploadFile("");
          setFileAddedForUpload(false);
          toast.success("File uploaded.");
        }
      }
    } catch (error) {
      setIsUploading(false);
      toast.error("Some error occured while uploading.");
      console.log(error.message);
    }
  };

  const changeTitle = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      title: value,
    }));
  };

  const changeEnableStatus = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      enable: value,
    }));
  };

  const handleSubmit = (myData) => {
    if (uploadFile) {
      toast.error("Upload file before submitting form.");
    }else{
      if (myData.title !== "" && myData.testimonial !== ""  && userName !== "" && userProfilePic !== "") {
        const addData = {
            ...myData,
            userInfo : {
                id : myUserId,
                profilePicture : userProfilePic,
                name : userName
            }
        } 
      if (editData) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/testimonials/updateTestimonial/${editData._id}?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("Testimonial updated!");
              setTimeout(() => {
                setModeToDisplay();
              }, 1000);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      } else {
        axios
          .post(
            `${process.env.REACT_APP_BACKEND_URL}/api/testimonials/addTestimonial?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("Testimonial added!");
              setTimeout(() => {
                setModeToDisplay();
              }, 1000);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      }
    } else {
      toast.error("Fill all fields.");
    }
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        testimonial: editData.testimonial,
        enable: editData.enable,
        userInfo: editData.userInfo,
      });

      setMyUserId(editData.userInfo.id);
      setUserName(editData.userInfo.profilePicture);
      setUserProfilePic(editData.userInfo.name);
    }
  }, [editData]);

  return (
    <Box
      sx={{
        "& .MuiInputBase-root": {
          backgroundColor: colors.primary[400],
          color:
            theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[900],
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
        "& .MuiFormHelperText-root": {
          color: colors.grey[200],
        },
        "& .MuiFormLabel-root": {
          color: colors.grey[100],
          "&.Mui-focused": {
            color: colors.greenAccent[300],
          },
        },
        "& .MuiButton-root": {
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
          "&:hover": {
            backgroundColor: colors.greenAccent[400],
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
        "& .MuiCheckbox-root": {
          color: `${colors.greenAccent[200]} !important`,
        },
      }}
    >
      <div className="flex items-center justify-center pl-6 px-12">
        <div className="w-full">
          <form>
            

            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3 ">
                <div className="mb-5">
                  <label
                    htmlFor="testimonial"
                    className="mb-3 block text-base font-medium"
                  >
                    Testimonial
                  </label>
                  <textarea
                    name="testimonial"
                    id="testimonial"
                    autoComplete="off"
                    list="mystates"
                    value={addData.testimonial}
                    onChange={(e) => {
                      setAddData({
                        ...addData,
                        testimonial: e.target.value,
                      });
                    }}
                    placeholder="Write here"
                    className="w-full h-48 rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="-mx-3 flex flex-wrap">
             
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="username"
                    className="mb-3 block text-base font-medium"
                  >
                    User Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    autoComplete="off"
                    list="mystates"
                    value={userName}
                    onChange={(e) => {
                        setUserName(e.target.value);
                    }}
                    placeholder="Username"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="flex flex-col  -mx-3 ">
              
              <div className="w-full items-center flex px-3 ">
                <div className="mb-5">
                  <label
                    htmlFor="file"
                    className="mb-3 block text-base font-medium"
                  >
                    Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="image"
                    onChange={handleFileAdding}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className={`px-8 py-3 h-fit mx-3 mt-3 ${
                    fileAddedForUpload === false ? "bg-gray-600" : (isUploading === true ? "bg-gray-600" : "bg-blue-500")
                  }  text-white font-medium text-lg rounded-md shadow-md ${
                    fileAddedForUpload === false
                      ? "bg-gray-600"
                      : "hover:bg-blue-600"
                  }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                  disabled={fileAddedForUpload === false ? true : isUploading}
                >
                  {`Upload`}
                </button>
              </div>

              {editData && (
                <div className="ml-3 flex lg:items-center flex-col lg:flex-row">
                  <div className="text-lg mb-2 lg:mb-0">
                    Already Uploaded Image :{" "}
                  </div>
                  <div className="lg:ml-2">
                    <a
                      target="_blank"
                      className="underline"
                      href={editData.userInfo.profilePicture}
                    >
                      {"View Image"}
                    </a>
                  </div>
                </div>
              )}
            </div>
            </div>


            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Enable ?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="enable"
                    value="yes"
                    className="h-5 w-5"
                    id="radioButton1"
                    checked={addData.enable === "yes"}
                    onChange={(e) => changeEnableStatus(e.target.value)}
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
                    checked={addData.enable === "no"}
                    onChange={(e) => changeEnableStatus(e.target.value)}
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

            <div>
              <button
                style={{ backgroundColor: colors.blueAccent[500] }}
                className="hover:shadow-htmlForm rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(addData);
                }}
              >
                {editData ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default TestimonialForm;

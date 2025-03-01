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

function ArticlesForm({ editData, setModeToDisplay, userToken, userId }) {
  const [uploadFile, setUploadFile] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [fileAddedForUpload, setFileAddedForUpload] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    title : "",
    image: "",
    forPage : "",
    enable: "false",
    redirectionLink : ""
  });

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
    const myPath = `articles/${myFileName}`;
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


  const handleFileUpload = async (e, myFile) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      toast("Uploading file.");

      let cloudFilePath = await uploadFileToCloud(myFile);

      // when in last iteration
      if (cloudFilePath) {
        const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
        if (publicUrl) {
          changeField("image", publicUrl);

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

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (uploadFile) {
      toast.error("Upload file before submitting form.");
    } else {
      if (addData.title !== "" && addData.image !== "" && addData.forPage !== "" && addData.enable !== "") {
        if (editData) {
          axios
            .put(
              `${process.env.REACT_APP_BACKEND_URL}/api/articles/updateArticle/${editData._id}?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                toast.success("Article updated!");
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
              `${process.env.REACT_APP_BACKEND_URL}/api/articles/addArticle?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                toast.success("Article Added!");
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
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        title: editData.title,
        image: editData.image,
        enable: editData.enable,
        forPage : editData.forPage || "",
        redirectionLink : editData.redirectionLink || ""
      });
    }
  }, [editData]);

  return (
    <Box
      sx={{
        padding: "24px",
        "& .MuiInputBase-root": {
          backgroundColor: colors.primary[400],
          color: colors.grey[100], // This still applies to other areas, not input text
          borderRadius: "4px",
          "&:hover": {
            borderColor: colors.blueAccent[700],
          },
          // Ensure input text is always black
          "& input": {
            color: "#000000", // Sets the input text color to black
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
          <div className="flex flex-col lg:flex-row -mx-3">
              <div className="w-full lg:px-3 lg:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="title"
                    className="mb-3 block text-base font-medium"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={addData.title}
                    onChange={(e) => changeField("title", e.target.value)}
                    placeholder="Title"
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
                    onChange={(e)=>{
                      handleFileUpload(e,e.target.files[0])
                    }}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <span className="text-xs font-light mt-2">Size : 2480 x 4000 px</span>
                </div>
  
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
                      href={editData.image.url}
                    >
                      {editData.image.name}
                    </a>
                  </div>
                </div>
              )}
            </div>
              </div>

              <div className="flex flex-col lg:flex-row -mx-3 mt-5 lg:mt-0">
              <div className="w-full lg:px-3 lg:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="redirectionLink"
                    className="mb-3 block text-base font-medium"
                  >
                    Redirection Link
                  </label>
                  <input
                    type="text"
                    name="redirectionLink"
                    id="redirectionLink"
                    value={addData.redirectionLink}
                    onChange={(e) => changeField("redirectionLink", e.target.value)}
                    placeholder="Redirection Link"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
              <div className="w-full lg:px-3 lg:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="forPage"
                    className="mb-3 block text-base font-medium"
                  >
                    For Page
                  </label>
                  <input
                    type="text"
                    name="forPage"
                    id="forPage"
                    value={addData.forPage}
                    onChange={(e) => changeField("forPage", e.target.value)}
                    placeholder="For page?"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
              </div>
            

            <div className="my-5">
              <label className="text-lg font-medium ">Enable?</label>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="fraud"
                    value={"true"}
                    className="h-5 w-5"
                    id="radioButton11"
                    checked={addData.enable === "true"}
                    onChange={(e) => changeField("enable", e.target.value)}
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
                    checked={addData.enable === "false"}
                    onChange={(e) => changeField("enable", e.target.value)}
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

            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={() => {
                  handleSubmit();
                  // console.log(addData)
                }}
                className={`px-8 py-3 ${
                  isUploading === true ? "bg-gray-600" : "bg-[#6A64F1]"
                }  text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading === true ? "bg-gray-600" : "hover:bg-[#5a52e0]"
                }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                disabled={isUploading === true ? true : false}
              >
                {editData ? "Update Article" : "Add Article"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default ArticlesForm;

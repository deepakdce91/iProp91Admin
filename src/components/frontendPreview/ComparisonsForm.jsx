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

function ComparisonsForm({ editData, setModeToDisplay, userToken, userId }) {
  const [uploadFile, setUploadFile] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [fileAddedForUpload, setFileAddedForUpload] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    title: "",
    topText: "",
    bottomText: "",
    centerImage: "",
    enable: "false",
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
    const myPath = `comparisons/${myFileName}`;
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
          changeField("centerImage", publicUrl);

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
      if (
        addData.title !== "" &&
        addData.topText !== "" &&
        addData.bottomText !== "" &&
        addData.centerImage !== "" &&
        addData.enable !== ""
      ) {
        if (editData) {
          axios
            .put(
              `${process.env.REACT_APP_BACKEND_URL}/api/comparisons/updateComparison/${editData._id}?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                toast.success("Advise updated!");
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
              `${process.env.REACT_APP_BACKEND_URL}/api/comparisons/addComparison?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                toast.success("Advise Added!");
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
        topText: editData.topText,
        bottomText: editData.bottomText,
        centerImage: editData.centerImage,
        enable: editData.enable,
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
            {/* // title and top text  */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
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

              <div className="w-full items-center flex-col px-3 md:w-1/2">
                <div className="items-center flex">
                  <div className="mb-2">
                    <label
                      htmlFor="file"
                      className="mb-3 block text-base font-medium"
                    >
                      Center Image
                    </label>
                    <input
                      type="file"
                      name="file"
                      id="file"
                      onChange={handleFileAdding}
                      className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className={`px-8 py-3 h-fit mx-3 mt-3 ${
                      fileAddedForUpload === false
                        ? "bg-gray-600"
                        : "bg-blue-500"
                    }  text-white font-medium text-lg rounded-md shadow-md ${
                      fileAddedForUpload === false
                        ? "bg-gray-600"
                        : "hover:bg-blue-600"
                    }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                    disabled={fileAddedForUpload === false ? true : false}
                  >
                    {`Upload`}
                  </button>
                </div>
                {editData && editData.centerImage && (
                  <div className="ml-1 flex lg:items-center flex-col lg:flex-row">
                    <div className="font-bold mb-2 lg:mb-0">
                      Already Uploaded Image :{" "}
                    </div>
                    <div className="lg:ml-2">
                      <a
                        target="_blank"
                        className="underline"
                        href={editData.centerImage.url}
                      >
                        {editData.centerImage.name}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* {top text } */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 ">
                <div className="mb-5">
                  <label
                    htmlFor="bottomText"
                    className="mb-3 block text-base font-medium"
                  >
                    Top Text
                  </label>
                  <textarea
                    type="text"
                    name="topText"
                    id="topText"
                    value={addData.topText}
                    onChange={(e) => changeField("topText", e.target.value)}
                    placeholder="Top Text"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* { bottom text } */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    htmlFor="bottomText"
                    className="mb-3 block text-base font-medium"
                  >
                    Bottom Text
                  </label>
                  <textarea
                    type="text"
                    name="bottomText"
                    id="bottomText"
                    value={addData.bottomText}
                    onChange={(e) => changeField("bottomText", e.target.value)}
                    placeholder="Bottom Text"
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
                {editData ? "Update Comparison" : "Add Comparison"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default ComparisonsForm;

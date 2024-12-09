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

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CKUploadAdapter from "../../config/CKUploadAdapter";

import { RiDeleteBinFill } from "react-icons/ri";

function ComparisonsForm({ editData, setModeToDisplay, userToken, userId }) {
  const [uploadFile1, setUploadFile1] = useState();
  const [fileAddedForUpload1, setFileAddedForUpload1] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const [uploadFile2, setUploadFile2] = useState();
  const [fileAddedForUpload2, setFileAddedForUpload2] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    title: "",
    topText: "",
    bottomText: "",
    centerImage1: "",
    centerImage2: "",
    redirectionLink : "",
    enable: "false",
  });

  const editorConfiguration = {
    extraPlugins: [
      function (editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = function (
          loader
        ) {
          return new CKUploadAdapter(loader, supabase);
        };
      },
    ],
  };

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

  const handleFileAdding = async (event, name) => {
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

        if (name === "centerImage1") {
          setUploadFile1(convertedFile);
          setFileAddedForUpload1(true);
        } else {
          setUploadFile2(convertedFile);
          setFileAddedForUpload2(true);
        }
      } catch (error) {
        console.error("Error converting HEIC file:", error);
      }
    } else {
      // if file is not jpeg..adding directly
      if (name === "centerImage1") {
        setUploadFile1(file);
        setFileAddedForUpload1(true);
      } else {
        setUploadFile2(file);
        setFileAddedForUpload2(true);
      }
    }
  };

  const handleFileUpload = async (e, name) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      toast("Uploading file.");

      let cloudFilePath;

      if (name === "centerImage1") {
        cloudFilePath = await uploadFileToCloud(uploadFile1);
      } else {
        cloudFilePath = await uploadFileToCloud(uploadFile2);
      }

      // when in last iteration
      if (cloudFilePath) {
        const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
        if (publicUrl) {
          changeField(name, publicUrl);
          toast.success("File uploaded.");
          setIsUploading(false);

          if (name === "centerImage1") {
            setUploadFile1("");
            setFileAddedForUpload1(false);
          } else {
            setUploadFile2("");
            setFileAddedForUpload2(false);
          }
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
    if (uploadFile1 || uploadFile2) {
      toast.error("Upload file before submitting form.");
    } else {
      if (
        addData.title !== "" &&
        addData.topText !== "" &&
        addData.bottomText !== "" &&
        addData.centerImage1 !== "" &&
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
                toast.success("Comparisons updated!");
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
                toast.success("Comparisons Added!");
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
      let myObj = {
        title: editData.title,
        topText: editData.topText,
        bottomText: editData.bottomText,
        centerImage1: editData.centerImage1,
        enable: editData.enable,
      };
      if (editData.centerImage2) {
        myObj.centerImage2 = editData.centerImage2;
      }
      if(editData.redirectionLink){
        myObj.redirectionLink = editData.redirectionLink
      }

      setAddData(myObj);
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
              
              <div className="w-full px-3 md:w-1/2">
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
            </div>

            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full items-center flex-col px-3 md:w-1/2">
                <div className="items-center flex">
                  <div className="mb-5">
                    <label
                      htmlFor="file"
                      className="mb-3 block text-base font-medium"
                    >
                      Center Image 1
                    </label>
                    <input
                      type="file"
                      name="file"
                      id="file"
                      onChange={(e) => handleFileAdding(e, "centerImage1")}
                      className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleFileUpload(e, "centerImage1")}
                    className={`px-8 py-3 h-fit mx-3 mt-3 ${
                      fileAddedForUpload1 === false
                        ? "bg-gray-600"
                        : "bg-blue-500"
                    }  text-white font-medium text-lg rounded-md shadow-md ${
                      fileAddedForUpload1 === false
                        ? "bg-gray-600"
                        : "hover:bg-blue-600"
                    }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                    disabled={fileAddedForUpload1 === false ? true : false}
                  >
                    {`Upload`}
                  </button>
                </div>
                {editData && editData.centerImage1 && addData.centerImage1 !== "" &&(
                  <div className="flex flex-col">
                    <div className="ml-1 flex lg:items-center flex-col lg:flex-row">
                      <div className="font-bold mb-2 lg:mb-0">
                        Already Uploaded Image :{" "}
                      </div>
                      <div className="lg:ml-2">
                        <a
                          target="_blank"
                          className="underline"
                          href={editData.centerImage1.url}
                        >
                          {editData.centerImage1.name}
                        </a>
                      </div>
                    </div>

                   {addData && addData.centerImage1 !== "" && <button
                      onClick={(e) => {
                        e.preventDefault();
                        changeField("centerImage1", "");
                        toast("Image 1 removed.")
      
                      }}
                      className=" my-2 items-center justify-center flex border border-gray-400 w-fit px-2 transform transition-transform duration-300 hover:scale-110"
                    >
                      <RiDeleteBinFill className="text-red-400 h-4 w-4 mr-1" />
                      <div className="text-">Delete Uploaded Image</div>
                    </button>}
                  </div>
                )}
              </div>

              <div className="w-full items-center flex-col px-3 md:w-1/2">
                <div className="items-center flex">
                  <div className="mb-5">
                    <label
                      htmlFor="file2"
                      className="mb-3 block text-base font-medium"
                    >
                      Center Image 2
                    </label>
                    <input
                      type="file"
                      name="file2"
                      id="file2"
                      onChange={(e) => handleFileAdding(e, "centerImage2")}
                      className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleFileUpload(e, "centerImage2")}
                    className={`px-8 py-3 h-fit mx-3 mt-3 ${
                      fileAddedForUpload2 === false
                        ? "bg-gray-600"
                        : "bg-blue-500"
                    }  text-white font-medium text-lg rounded-md shadow-md ${
                      fileAddedForUpload2 === false
                        ? "bg-gray-600"
                        : "hover:bg-blue-600"
                    }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                    disabled={fileAddedForUpload2 === false ? true : false}
                  >
                    {`Upload`}
                  </button>
                </div>
                {editData && editData.centerImage2 && addData.centerImage2 !== "" && (
                  <div className="flex flex-col">
                    <div className="ml-1 flex lg:items-center flex-col lg:flex-row">
                      <div className="font-bold mb-2 lg:mb-0">
                        Already Uploaded Image :{" "}
                      </div>
                      <div className="lg:ml-2">
                        <a
                          target="_blank"
                          className="underline"
                          href={editData.centerImage2.url}
                        >
                          {editData.centerImage2.name}
                        </a>
                      </div>
                    </div>

                   <button
                      onClick={(e) => {
                        e.preventDefault();
                        changeField("centerImage2", "");
                        toast("Image 2 removed.")
                      }}
                      className=" my-2 items-center justify-center flex border border-gray-400 w-fit px-2 transform transition-transform duration-300 hover:scale-110"
                    >
                      <RiDeleteBinFill className="text-red-400 h-4 w-4 mr-1" />
                      <div className="text-">Delete Uploaded Image</div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* {top text } */}
            <div className="flex flex-col md:flex-row -mx-3 mt-4">
              <div className="w-full px-3 ">
                <div className="mb-5">
                  <label
                    htmlFor="bottomText"
                    className="mb-3 block text-base font-medium"
                  >
                    Top Text
                  </label>

                  <div className=" w-full  text-black pr-0 md:pr-5 ">
                    <CKEditor
                      editor={ClassicEditor}
                      config={editorConfiguration}
                      data={addData.topText}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        changeField("topText", data);
                      }}
                    />
                  </div>
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

                  <div className=" w-full  text-black pr-0 md:pr-5 ">
                    <CKEditor
                      editor={ClassicEditor}
                      config={editorConfiguration}
                      data={addData.bottomText}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        changeField("bottomText", data);
                      }}
                    />
                  </div>
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

            {/* <Muheheh/> */}
            {/* <Editor/> */}
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default ComparisonsForm;

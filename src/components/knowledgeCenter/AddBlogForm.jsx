import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import heic2any from "heic2any";
import { MdEdit } from "react-icons/md";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../config/s3Config";

import { supabase } from "../../config/supabase";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import CKUploadAdapter from "../../config/CKUploadAdapter";


 
function AddBlogForm({ editData, setModeToDisplay, userToken, userId }) {
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(
    "/default-library-thumbnail.jpg"
  );

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    thumbnail: "",
    title: "",
    content: "",
    enable: "true",
  });

  const editorConfiguration = {
    // plugins: [ Image, PictureEditing, ImageUpload, CloudServices, CKBox, CKBoxImageEdit, /* ... */ ],
    extraPlugins: [
      function (editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
          return new CKUploadAdapter(loader, supabase);
        };
      },
    ],
  };

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_LIBRARY_THUMBNAIL_BUCKET)
      .getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
    return data.publicUrl;
  };

  const handleDivClick = () => {
    // Trigger the click event on the file input
    fileInputRef.current.click();
  };

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (myFile) => {
    const myPath = `blogsThumbnail/${myFile.name}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_LIBRARY_THUMBNAIL_BUCKET,
        Key: myPath,
        Body: myFile, // The file content
        ContentType: myFile.type, // The MIME type of the file
      };
      const command = new PutObjectCommand(uploadParams);
      let success = await client.send(command);
      if (success) {
        changeField("thumbnail", myPath);
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
      let cloudFilePath = await uploadFileToCloud(file);

      if (cloudFilePath) {
        setAddData((prevData) => ({
          ...prevData,
          thumbnail: cloudFilePath,
        }));
        let publicUrl = getPublicUrlFromSupabase(cloudFilePath);
        if (publicUrl) {
          toast.success("Thumbnail picture changed!");
          setIsUploading(false);
          setPreviewUrl(publicUrl);
          setAddData((prevData) => ({
            ...prevData,
            thumbnail: publicUrl,
          }));
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
    if (addData.title !== "" && addData.content !== "") {
      if (editData) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/library/updateBlog/${editData._id}?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("Blog updated!");
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
            `${process.env.REACT_APP_BACKEND_URL}/api/library/addBlog?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("Blog added!");
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
          thumbnail: editData.thumbnail || "/default-library-thumbnail.jpg",
          title: editData.title,
          content: editData.content,
          enable: editData.enable,
        });

        if (editData.thumbnail !== "") {
          try {
            setPreviewUrl(editData.thumbnail); // Set the preview URL
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
            <div className="relative w-fit">
              <h1 className="text-lg font-medium mb-3">Thumbnail</h1>
              <img
                src={previewUrl}
                className="h-32 w-52 rounded-lg mb-5 object-cover"
                alt="profile-picture"
              />

              {isUploading === true ? (
                <img
                  className="ml-2 mt-2 h-8 w-7 absolute bottom-0 -right-10 "
                  src={`${
                    theme.palette.mode === "dark"
                      ? "/spinner-white.svg"
                      : "/spinner.svg"
                  }`}
                  alt="upload-spinner"
                />
              ) : (
                <div
                  onClick={handleDivClick}
                  className="flex text-gray-400 hover:text-white absolute bottom-0 -right-20 items-end"
                >
                  <MdEdit className="w-6 h-6  rounded-full  " />
                  <span>Change</span>
                </div>
              )}

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
                  <div className="my-4">
                    <label htmlFor="fName" className="text-lg font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={addData.title}
                      onChange={(e) => changeField("title", e.target.value)}
                      placeholder="Title"
                      className="w-full mt-[10px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-medium mt-2 mb-3">Content</h2>

            <div className=" w-full  text-black pr-0 md:pr-5 ">
              <CKEditor
                editor={ClassicEditor}
                config={editorConfiguration}
                data={addData.content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  changeField("content", data);
                }}
              />
            </div>

            <div className="my-5">
              <label className="text-lg font-medium ">
                Enable?
              </label>
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
                onClick={() => handleSubmit(addData)}
                className={`px-8 py-3 ${
                  isUploading === true ? "bg-gray-600" : "bg-[#6A64F1]"
                }  text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading === true ? "bg-gray-600" : "hover:bg-[#5a52e0]"
                }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                disabled={isUploading === true ? true : false}
              >
                {editData ? "Update Blog" : "Add Blog"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default AddBlogForm;

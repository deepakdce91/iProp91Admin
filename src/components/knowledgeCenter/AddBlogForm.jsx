import { Box, useTheme } from "@mui/material";
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
import {
  removeSpaces,
  sortArrayByName,
} from "../../MyFunctions";

import { Editor } from '@tinymce/tinymce-react';
import { Chips } from "primereact/chips";

function AddBlogForm({ editData, setModeToDisplay, userToken, userId }) {
  const urlRegex = /^(https?:\/\/)/;
  const fileInputRef = useRef(null);

  const editorRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(
    "/default-library-thumbnail.jpg"
  );

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    priority: 6,
    thumbnail: "",
    title: "",
    content: "",
    youtubeVideos: [],
    additionalMediaLinks: [],
    enable: "true",
  });

   // File upload handler for TinyMCE
    const handleEditorUpload = async (blobInfo) => {
      try {
        const file = blobInfo.blob();
        const fileName = removeSpaces(blobInfo.filename());
        const myPath = `editorFiles/${fileName}`;
  
        const uploadParams = {
          Bucket: process.env.REACT_APP_LIBRARY_BUCKET,
          Key: myPath,
          Body: file,
          ContentType: file.type,
        };
  
        const command = new PutObjectCommand(uploadParams);
        await client.send(command);
  
        const { data } = supabase.storage
          .from(process.env.REACT_APP_LIBRARY_BUCKET)
          .getPublicUrl(myPath);
  
        return data.publicUrl;
      } catch (error) {
        console.error('Upload failed:', error);
        throw new Error('Upload failed');
      }
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

  const handleSubmit = (myData) => {
    if (myData.title !== "" && myData.content !== "" && myData.priority !== "") {

      const addData = myData;
      addData.priority = Number(myData.priority);
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
          priority: editData.priority,
          thumbnail: editData.thumbnail || "/default-library-thumbnail.jpg",
          title: editData.title,
          content: editData.content,
          youtubeVideos: editData.youtubeVideos,
          additionalMediaLinks: editData.additionalMediaLinks,
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

              <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 ">
                <div className="w-full pr-3">
                  <div className="my-4">
                    <label htmlFor="priority" className="text-lg font-medium">
                      Priority <span className="font-extralight text-sm">{"( From 1 to 6 )"}</span>
                    </label>
                    <input
                      type="number"
                      min={"1"}
                      max={"6"}
                      name="priority"
                      id="priority"
                      value={addData.priority}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        // Validate if the value is within the range 1-6
                        if (
                          newValue === "" ||
                          (newValue >= 1 && newValue <= 6)
                        ) {
                          changeField("priority",newValue);
                        }
                      }}
                      placeholder="Priority"
                      className="w-full mt-[10px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-medium mt-2 mb-3">Content</h2>

           <div className="w-full text-black pr-0 md:pr-5">
                         <Editor
                           apiKey={process.env.REACT_APP_TINY_MCE_API_KEY} 
                           onInit={(evt, editor) => editorRef.current = editor}
                           value={addData.content}
                           init={{
                             height: 500,
                             menubar: true,
                             plugins: [
                               'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                               'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                               'insertdatetime', 'media', 'table', 'help', 'wordcount'
                             ],
                             toolbar: 'undo redo | blocks | ' +
                               'bold italic | alignleft aligncenter ' +
                               'alignright alignjustify | bullist numlist outdent indent | ' +
                               'removeformat | table | link image | help',
                             content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                             table_responsive_width: true,
                             table_default_styles: {
                               width: '100%',
                               borderCollapse: 'collapse'
                             },
                             table_cell_class_list: [
                               {title: 'None', value: ''},
                               {title: 'Wider Cell', value: 'wider-cell'}
                             ],
                             table_row_class_list: [
                               {title: 'None', value: ''},
                               {title: 'Larger Row', value: 'larger-row'}
                             ],
                             images_upload_handler: handleEditorUpload,
                             file_picker_types: 'image',
                             promotion: false
                           }}
                           
                           onEditorChange={(content) => {
                             changeField("content", content);
                           }}
                         />
                       </div>

            {/* youtube urls  */}

            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col w-full  pr-0 md:pr-5 ">
                <div className="w-full pr-3">
                  <div className="my-4 flex flex-col">
                    <label
                      htmlFor="ytlinks"
                      className="text-lg mb-2 font-medium"
                    >
                      Youtube Links
                    </label>
                    <Chips
                      value={addData.youtubeVideos}
                      onChange={(e) => {
                        if (
                          e.value.length > addData.additionalMediaLinks.length
                        ) {
                          // ("item added");
                          const recentItem = e.value[e.value.length - 1];
                          const isRecentUrl = urlRegex.test(recentItem);
                          if (isRecentUrl === true) {
                            changeField("youtubeVideos", e.value);
                          } else {
                            toast.error("Provide a valid youtube url.");
                          }
                        } else {
                          changeField("youtubeVideos", e.value);
                        }
                      }}
                    ></Chips>
                  </div>
                </div>
              </div>
            </div>

            {/* // additional urls  */}

            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-col w-full  pr-0 md:pr-5 ">
                <div className="w-full pr-3">
                  <div className="my-4 flex flex-col">
                    <label
                      htmlFor="addlinks"
                      className="text-lg mb-2 font-medium"
                    >
                      Additional media links
                    </label>

                    <Chips
                      value={addData.additionalMediaLinks}
                      onChange={(e) => {
                        if (
                          e.value.length > addData.additionalMediaLinks.length
                        ) {
                          // ("item added");
                          const recentItem = e.value[e.value.length - 1];
                          const isRecentUrl = urlRegex.test(recentItem);
                          if (isRecentUrl === true) {
                            changeField("additionalMediaLinks", e.value);
                          } else {
                            toast.error("Provide a valid url.");
                          }
                        } else {
                          changeField("additionalMediaLinks", e.value);
                        }
                      }}
                    ></Chips>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* <LinkChips fieldName={"additionalMediaLinks"} preSelected={addData.additionalMediaLinks} updateSelectedArr={changeField} /> */}
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

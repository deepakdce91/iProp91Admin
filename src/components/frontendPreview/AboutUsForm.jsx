import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import { Editor } from '@tinymce/tinymce-react';

import { supabase } from "../../config/supabase";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../config/s3Config";

function AboutUsForm({ editData, setModeToDisplay, userToken, userId }) {
  const editorRef = useRef(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    text: "",
  });

  // File upload handler for TinyMCE
  const handleEditorUpload = async (blobInfo) => {
    try {
      const file = blobInfo.blob();
      const fileName = blobInfo.filename().replace(/\s+/g, ''); // removing blank space from name
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

  const handleSubmit = () => {
    if (addData.text !== "") {
      if (editData) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/aboutUs/update/${editData._id}?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast.success("About Us updated!");
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
            `${process.env.REACT_APP_BACKEND_URL}/api/aboutUs/add?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast.success("About Us Added!");
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
      toast.error(" text is required.");
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        text: editData.text || "",
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
          "& input": {
            color: "#000000",
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
            <div className="flex flex-col -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    htmlFor="text"
                    className="mb-3 block text-base font-medium"
                  >
                    About Us Text
                  </label>
                  <div className="w-full text-black">
                    <Editor
                      apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                      onInit={(evt, editor) => editorRef.current = editor}
                      value={addData.text}
                      init={{
                        height: 700,
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
                        setAddData(prevData => ({
                          ...prevData,
                          text: content
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-[#6A64F1] text-white font-medium text-lg rounded-md shadow-md hover:bg-[#5a52e0] focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50"
              >
                {editData ? "Update About Us" : "Add About Us"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default AboutUsForm;
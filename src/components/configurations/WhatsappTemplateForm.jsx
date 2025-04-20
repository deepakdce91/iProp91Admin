import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  removeSpaces,
  sortArrayByName,
} from "../../MyFunctions";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../config/s3Config";
import { Editor } from '@tinymce/tinymce-react';
import { supabase } from "../../config/supabase";




function WhatsappTemplateForm({ editData, setModeToDisplay, userToken, userId }) {
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    templateName: "", 
    body: "",
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

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      addData.templateName !== "" &&
      addData.body !== ""
    ) {
      if (editData) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/whatsappTemplates/updateWhatsappTemplate/${editData._id}?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast.success("Template updated!");
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
            `${process.env.REACT_APP_BACKEND_URL}/api/whatsappTemplates/addWhatsappTemplate?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast.success("Template added!");
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
        templateName: editData.templateName,
        body: editData.body || "",
        enable: editData.enable || "true",
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
            {/* // template name  */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-2/3 lg:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="templateName"
                    className="mb-3 block text-base font-medium"
                  >
                    Template Name
                  </label>
                  <input
                    type="text"
                    name="templateName"
                    id="templateName"
                    value={addData.templateName}
                    onChange={(e) =>
                      changeField("templateName", e.target.value)
                    }
                    placeholder="Template Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

   

            {editData && editData.totalVariables > 0 && (
              <div>
                <div>
                  <strong> Varaibles : </strong>{" "}
                </div>
                <div>
                  {editData.variableNames.split(",").map((item, index) => {
                    return <p key={index + "var"}>{item}</p>;
                  })}
                </div>
              </div>
            )}

            <h2 className="text-lg font-medium mt-2 mb-3">Body</h2>
            <div className="w-full text-black pr-0 md:pr-5">
              <Editor
                apiKey={process.env.REACT_APP_TINY_MCE_API_KEY} 
                onInit={(evt, editor) => editorRef.current = editor}
                value={addData.body}
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
                  changeField("body", content);
                }}
              />
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
                {editData ? "Update Template" : "Add Template"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default WhatsappTemplateForm;
import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { supabase } from "../../config/supabase";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CKUploadAdapter from "../../config/CKUploadAdapter";



function EmailTemplateForm({ editData, setModeToDisplay, userToken, userId }) {

  const [isUploading, setIsUploading] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    title: "",
    template : "",
    enable : "true"
   
  });

  const editorConfiguration = {
    extraPlugins: [
      function (editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
          return new CKUploadAdapter(loader, supabase);
        };
      },
    ],
  };


  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };


  const handleSubmit = () => {

      if (
        addData.title !== "" &&
        addData.template !== "" 
      ) {
        if (editData) {
          axios
            .put(
              `${process.env.REACT_APP_BACKEND_URL}/api/emailTemplates/updateEmailTemplate/${editData._id}?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                toast.success("Email Template updated!");
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
              `${process.env.REACT_APP_BACKEND_URL}/api/emailTemplates/addEmailTemplate?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
     
                toast.success("Email Template added!");
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
        title: editData.title,
        template : editData.template || "",
        enable : editData.enable || "true"
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

            {/* // customer name and number  */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 ">
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
            </div>


            <h2 className="text-lg font-medium mt-2 mb-3">Template</h2>
            <div className=" w-full  text-black pr-0 md:pr-5 ">
              <CKEditor
                editor={ClassicEditor}
                config={editorConfiguration}
                data={addData.template}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  changeField("template", data);
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
                onClick={() => { 
                    handleSubmit()
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

export default EmailTemplateForm;


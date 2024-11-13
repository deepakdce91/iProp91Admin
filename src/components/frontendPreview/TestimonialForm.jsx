import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Textarea } from "@material-tailwind/react";

function TestimonialForm({ editData, userId, userToken, setModeToDisplay }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    title: "",
    testimonial: "",
    enable: "no",
    addedBy: "admin",
  });

  const [myUserId, setMyUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userProfilePic, setUserProfilePic] = useState("");

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
    if (myData.title !== "" && myData.testimonial !== "" && myUserId !== "" && userName !== "" && userProfilePic !== "") {
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
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        name: editData.name,
        enable: editData.enable,
        addedBy: editData.addedBy,
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
              <div className="w-full px-3 sm:w-1/2">
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
                    autoComplete="off"
                    list="mystates"
                    value={addData.title}
                    onChange={(e) => {
                      changeTitle(e.target.value);
                    }}
                    placeholder="Title"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

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
                    htmlFor="userid"
                    className="mb-3 block text-base font-medium"
                  >
                    User Id
                  </label>
                  <input
                    type="text"
                    name="userid"
                    id="userid"
                    autoComplete="off"
                    list="mystates"
                    value={myUserId}
                    onChange={(e) => {
                      setMyUserId(e.target.value);
                    }}
                    placeholder="User Id"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
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
            </div>

            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3 sm:w-2/3">
                <div className="mb-5">
                  <label
                    htmlFor="userpfp"
                    className="mb-3 block text-base font-medium"
                  >
                    User Profile Picture Url
                  </label>
                  <input
                    type="text"
                    name="userpfp"
                    id="userpfp"
                    autoComplete="off"
                    list="mystates"
                    value={userProfilePic}
                    onChange={(e) => {
                      setUserProfilePic(e.target.value);
                    }}
                    placeholder="User Picture"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
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

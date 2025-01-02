import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Validates Indian phone numbers
  return phoneRegex.test(phone);
};

function ContactUsForm({ editData, userId, userToken, setModeToDisplay }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    mobile : "",
    email : "",
    message : "",
    addressed: "no",
  });

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    if(field === "addressed"){

        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/contactUs/updateContactUs/${editData._id}?userId=${userId}`,
            {
              addressed : value
            },
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("Addressed status updated!");
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
  };


  const handleSubmit = (addData) => {
    if (
      addData.name !== "" &&
      addData.mobile !== "" &&
      addData.email !== "" &&
      addData.message !== "" 
    ) {
      if (!validatePhone(addData.mobile)) {
        toast.error("Invalid mobile number");
        return;
      }
      if (!validateEmail(addData.email)) {
        toast.error("Invalid email");
        return;
      }
        axios
          .post(
            `${process.env.REACT_APP_BACKEND_URL}/api/contactUs/addContactUs?userId=${userId}`,
            addData,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("Contact Us query added!");
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
      toast.error("Fill all fields.");
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        name: editData.name,
        mobile : editData.mobile,
        email : editData.email,
        message : editData.message,
        addressed: editData.addressed,
      });
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
                    htmlFor="name"
                    className="mb-3 block text-base font-medium"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="off"
                    list="mystates"
                    value={addData.name}
                    onChange={(e) => {
                      changeField("name",e.target.value);
                    }}
                    placeholder="Full Name"
                    readOnly={editData ? true : false}
                    className={`${editData ? "bg-gray-300 " : ""} text-gray-600  w-full rounded-md border  border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md`}
                  />
                </div>
              </div>

            </div>

            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="mobile"
                    className="mb-3 block text-base font-medium"
                  >
                   Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    id="mobile"
                    autoComplete="off"
                    value={addData.mobile}
                    onChange={(e) => {
                      changeField("mobile",e.target.value);
                    }}
                    placeholder="Mobile number"
                    readOnly={editData ? true : false}
                    className={`${editData ? "bg-gray-300 " : ""} text-gray-600  w-full rounded-md border  border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md`}
                  />
                </div>
              </div>
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-base font-medium"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    autoComplete="off"
                    list="mystates"
                    value={addData.email}
                    onChange={(e) => {
                      changeField("email",e.target.value);
                    }}
                    placeholder="Email id"
                    readOnly={editData ? true : false}
                    className={`${editData ? "bg-gray-300 " : ""} text-gray-600  w-full rounded-md border  border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md`}
                  />
                </div>
              </div>
            </div>

            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3 ">
                <div className="mb-5">
                  <label
                    htmlFor="message"
                    className="mb-3 block text-base font-medium"
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    autoComplete="off"
                    value={addData.message}
                    onChange={(e) => {
                      setAddData({
                        ...addData,
                        message: e.target.value,
                      });
                    }}
                    placeholder="Write here"
                    readOnly={editData ? true : false}
                    className={`${editData ? "bg-gray-300 h-32 " : "h-48"} text-gray-600  w-full rounded-md border  border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md `}
                  />
                </div>
              </div>
            </div>


            {editData && <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Addressed the query ?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="enable"
                    value="yes"
                    className="h-5 w-5"
                    id="radioButton1"
                    checked={addData.addressed === "yes"}
                    onChange={(e) => changeField("addressed",e.target.value)}
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
                    checked={addData.addressed === "no"}
                    onChange={(e) => changeField("addressed",e.target.value)}
                  />
                  <label
                    htmlFor="radioButton2"
                    className="pl-3 text-base font-medium"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>}

            {!editData && <div className="flex justify-center"> 
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
            </div>}
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default ContactUsForm;

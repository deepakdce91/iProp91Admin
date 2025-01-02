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

function AppointmentsForm({ editData, userId, userToken, setModeToDisplay }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    mobile: "",
    email: "",
    enquiryFor: "",
    date: "no",
    timeSlot: "no"
  });

  const timeSlots = [
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM"
  ];

  const enquiryTypes = [
    "buy",
    "sell",
    "rent",
    "lend",
    "advise",
    "nri"
  ];

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = (addData) => {
    // Validation
    if (!validateEmail(addData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePhone(addData.mobile)) {
      toast.error("Please enter a valid Indian mobile number");
      return;
    }

    if (
      addData.name !== "" &&
      addData.mobile !== "" &&
      addData.email !== "" &&
      addData.enquiryFor !== "" &&
      addData.date !== "no" &&
      addData.timeSlot !== "no"
    ) {

        if(!editData){
            axios
            .post(
              `${process.env.REACT_APP_BACKEND_URL}/api/appointments/addAppointment?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                if(response.data.success === false){
                    return toast.error(response.data.message);
                }else{
                    toast.success("Appointment scheduled successfully!");
                setTimeout(() => {
                  setModeToDisplay();
                }, 1000);
                }
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              toast.error("Failed to schedule appointment.");
            });
        }else{
            axios
            .put(
              `${process.env.REACT_APP_BACKEND_URL}/api/appointments/updateAppointment/${editData._id}?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                toast.success("Appointment updated successfully!");
                setTimeout(() => {
                  setModeToDisplay();
                }, 1000);
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              toast.error("Failed to update appointment.");
            });
        }
      
    } else {
      toast.error("Please fill all fields.");
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        name: editData.name,
        mobile: editData.mobile,
        email: editData.email,
        enquiryFor: editData.enquiryFor,
        date: editData.date,
        timeSlot: editData.timeSlot
      });
    }
  }, [editData]);

  return (
    <Box
      sx={{
        "& .MuiInputBase-root": {
          backgroundColor: colors.primary[400],
          color: theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[900],
          borderRadius: "4px",
        },
        "& .MuiInputLabel-root": {
          color: colors.grey[300],
        },
        "& .MuiFormHelperText-root": {
          color: colors.grey[200],
        }
      }}
    >
      <div className="flex items-center justify-center pl-6 px-12">
        <div className="w-full">
          <form>
            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label htmlFor="name" className="mb-3 block text-base font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={addData.name}
                    onChange={(e) => changeField("name", e.target.value)}
                    placeholder="Full Name"
                    className="text-gray-600 w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label htmlFor="mobile" className="mb-3 block text-base font-medium">
                    Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    id="mobile"
                    value={addData.mobile}
                    onChange={(e) => changeField("mobile", e.target.value)}
                    placeholder="Mobile number"
                    className="text-gray-600 w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label htmlFor="email" className="mb-3 block text-base font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={addData.email}
                    onChange={(e) => changeField("email", e.target.value)}
                    placeholder="Email address"
                    className="text-gray-600 w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label htmlFor="enquiryFor" className="mb-3 block text-base font-medium">
                    Enquiry For
                  </label>
                  <select
                    name="enquiryFor"
                    id="enquiryFor"
                    value={addData.enquiryFor}
                    onChange={(e) => changeField("enquiryFor", e.target.value)}
                    className="text-gray-600 w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md capitalize"
                  >
                    <option value="">Select Enquiry Type</option>
                    {enquiryTypes.map((type) => (
                      <option key={type} value={type} className="capitalize">
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label htmlFor="date" className="mb-3 block text-base font-medium">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={addData.date}
                    onChange={(e) => changeField("date", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-gray-600 w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label htmlFor="timeSlot" className="mb-3 block text-base font-medium">
                    Preferred Time
                  </label>
                  <select
                    name="timeSlot"
                    id="timeSlot"
                    value={addData.timeSlot}
                    onChange={(e) => changeField("timeSlot", e.target.value)}
                    className="text-gray-600 w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="no">Select Time Slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                style={{ backgroundColor: colors.blueAccent[500] }}
                className="hover:shadow-form rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(addData);
                }}
              >
                {editData ? "Update Appointment" : "Schedule Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default AppointmentsForm;
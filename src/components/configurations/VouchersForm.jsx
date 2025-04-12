import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function VoucherForm({ editData, userId, userToken, closeForm }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    description: "",
    discountType: "", // percentage, fixed_amount, free_item
    discountValue: 0,
    status: "active", // active, redeemed, expired, cancelled
    isActive: true,
    isRedeemed: false,
    issuedDate: new Date(),
    redeemedDate: null,
    customerId: "", // Added customerId field
  });

  const changeName = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      name: value,
    }));
  };

  const changeDescription = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      description: value,
    }));
  };

  const changeDiscountType = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      discountType: value,
    }));
  };

  const changeDiscountValue = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      discountValue: parseFloat(value),
    }));
  };

  const changeStatus = (value) => {
    const newStatus = value;
    const isRedeemed = newStatus === "redeemed";
    
    setAddData((prevData) => ({
      ...prevData,
      status: newStatus,
      isRedeemed: isRedeemed,
      redeemedDate: isRedeemed && !prevData.isRedeemed ? new Date() : prevData.redeemedDate,
      isActive: newStatus === "active"
    }));
  };

  const changeActiveStatus = (value) => {
    const isActive = value === "yes";
    
    setAddData((prevData) => ({
      ...prevData,
      isActive: isActive,
      status: isActive ? (prevData.status === "active" ? prevData.status : "active") : 
                         (prevData.status === "active" ? "cancelled" : prevData.status)
    }));
  };

  const changeRedeemedStatus = (value) => {
    const isRedeemed = value === "yes";
    
    setAddData((prevData) => ({
      ...prevData,
      isRedeemed: isRedeemed,
      redeemedDate: isRedeemed && !prevData.isRedeemed ? new Date() : prevData.redeemedDate,
      status: isRedeemed ? "redeemed" : (prevData.status === "redeemed" ? "active" : prevData.status)
    }));
  };

  const changeIssuedDate = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      issuedDate: new Date(value),
    }));
  };

  // Added handler for customerId
  const changeCustomerId = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      customerId: value,
    }));
  };

  const handleSubmit = (addData) => {
    if (addData.name !== "" && addData.discountValue !== 0 && addData.discountType !== "") {
      // Prepare data for submission
      const submissionData = {
        ...addData,
        redeemedDate: addData.isRedeemed ? addData.redeemedDate || new Date() : null,
      };

      if (editData) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/redeemVouchers/updatevoucher/${editData._id}?userId=${userId}`,
            submissionData, {
              headers: {
                "auth-token": userToken
              },
            }
          )
          .then((response) => {
            if (response) {
              toast.success("Voucher updated successfully!");
              setTimeout(() => {
                closeForm();
              }, 2000);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Failed to update voucher");
          });
      } else {
        axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/api/redeemVouchers/addcustomvoucher?userId=${userId}`, submissionData, {
            headers: {
              "auth-token": userToken
            },
          })
          .then((response) => {
            if (response) {
              toast.success("Voucher added successfully!");
              setAddData({
                name: "",
                description: "",
                discountType: "",
                discountValue: 0,
                status: "active",
                isActive: true,
                isRedeemed: false,
                issuedDate: new Date(),
                redeemedDate: null,
                customerId: "", // Reset customerId
              });

              setTimeout(() => {
                closeForm();
              }, 2000);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Failed to add voucher");
          });
      }
    } else {
      toast.error("Please fill all required fields marked with *");
    }
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        name: editData.name || "",
        description: editData.description || "",
        discountType: editData.discountType || "",
        discountValue: editData.discountValue || 0,
        status: editData.status || "active",
        isActive: editData.isActive !== undefined ? editData.isActive : true,
        isRedeemed: editData.isRedeemed !== undefined ? editData.isRedeemed : false,
        issuedDate: editData.issuedDate ? new Date(editData.issuedDate) : new Date(),
        redeemedDate: editData.redeemedDate ? new Date(editData.redeemedDate) : null,
        customerId: editData.customerId || "", // Added customerId
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
      <div className="flex items-center justify-center px-6">
        <div className="w-full">
          <form>
            <div className="flex flex-wrap -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="mb-3 block text-base font-medium"
                  >
                    Voucher Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="off"
                    value={addData.name}
                    onChange={(e) => changeName(e.target.value)}
                    placeholder="Voucher Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Added Customer ID field */}
            <div className="flex flex-wrap -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    htmlFor="customerId"
                    className="mb-3 block text-base font-medium"
                  >
                    Customer ID
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    id="customerId"
                    autoComplete="off"
                    value={addData.customerId}
                    onChange={(e) => changeCustomerId(e.target.value)}
                    placeholder="Customer ID"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    htmlFor="description"
                    className="mb-3 block text-base font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    autoComplete="off"
                    value={addData.description}
                    onChange={(e) => changeDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="discountValue"
                    className="mb-3 block text-base font-medium"
                  >
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    id="discountValue"
                    value={addData.discountValue}
                    onChange={(e) => changeDiscountValue(e.target.value)}
                    placeholder="Discount Value"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="discountType"
                    className="mb-3 block text-base font-medium"
                  >
                    Discount Type *
                  </label>
                  <select
                    name="discountType"
                    id="discountType"
                    value={addData.discountType}
                    onChange={(e) => changeDiscountType(e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="">--Select--</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                    <option value="free_item">Free Item</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="status"
                    className="mb-3 block text-base font-medium"
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={addData.status}
                    onChange={(e) => changeStatus(e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="active">Active</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label className="mb-3 block text-base font-medium">
                    Is Active?
                  </label>
                  <div className="flex items-center space-x-6 py-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="yes"
                        className="h-5 w-5"
                        id="activeRadioButton1"
                        checked={addData.isActive === true}
                        onChange={(e) => changeActiveStatus(e.target.value)}
                      />
                      <label
                        htmlFor="activeRadioButton1"
                        className="pl-3 text-base font-medium"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="no"
                        className="h-5 w-5"
                        id="activeRadioButton2"
                        checked={addData.isActive === false}
                        onChange={(e) => changeActiveStatus(e.target.value)}
                      />
                      <label
                        htmlFor="activeRadioButton2"
                        className="pl-3 text-base font-medium"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label className="mb-3 block text-base font-medium">
                    Is Redeemed?
                  </label>
                  <div className="flex items-center space-x-6 py-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isRedeemed"
                        value="yes"
                        className="h-5 w-5"
                        id="redeemedRadioButton1"
                        checked={addData.isRedeemed === true}
                        onChange={(e) => changeRedeemedStatus(e.target.value)}
                      />
                      <label
                        htmlFor="redeemedRadioButton1"
                        className="pl-3 text-base font-medium"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="isRedeemed"
                        value="no"
                        className="h-5 w-5"
                        id="redeemedRadioButton2"
                        checked={addData.isRedeemed === false}
                        onChange={(e) => changeRedeemedStatus(e.target.value)}
                      />
                      <label
                        htmlFor="redeemedRadioButton2"
                        className="pl-3 text-base font-medium"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="issuedDate"
                    className="mb-3 block text-base font-medium"
                  >
                    Issued Date
                  </label>
                  <input
                    type="date"
                    name="issuedDate"
                    id="issuedDate"
                    value={formatDateForInput(addData.issuedDate)}
                    onChange={(e) => changeIssuedDate(e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            {addData.isRedeemed && (
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3">
                  <div className="mb-5">
                    <label
                      htmlFor="redeemedDate"
                      className="mb-3 block text-base font-medium"
                    >
                      Redeemed Date
                    </label>
                    <input
                      type="date"
                      name="redeemedDate"
                      id="redeemedDate"
                      value={formatDateForInput(addData.redeemedDate)}
                      onChange={(e) => setAddData(prev => ({...prev, redeemedDate: new Date(e.target.value)}))}
                      className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2">
              <button
                style={{ backgroundColor: colors.blueAccent[500] }}
                className="hover:shadow-htmlForm rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(addData);
                }}
              >
                {editData ? "Update Voucher" : "Create Voucher"}
              </button>
              <button
                style={{ 
                  backgroundColor: colors.grey[500],
                  marginLeft: "10px"
                }}
                className="hover:shadow-htmlForm rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  closeForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default VoucherForm;
import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function RewardsForm({ editData, userId, userToken, closeForm }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    title: "",
    description: "",
    discountType: "", // percentage, fixed_amount, free_item
    type: "addition",
    amount: 0,
    enabled: "yes",
    rewardType: "exclusive-iprop", // exclusive-iprop or third-party
    couponCodeType: "single", // single or range
    couponCode: [], // Array of coupon codes
    numberOfRedemptions: 1
  });

  const [coupons, setCoupons] = useState("");

  const changeName = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      name: value,
    }));
  };

  const changeTitle = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      title: value,
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

  const changeType = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      type: value,
    }));
  };

  const changeAmount = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      amount: value,
    }));
  };

  const changeEnabledStatus = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      enabled: value,
    }));
  };

  const changeRewardType = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      rewardType: value,
    }));
  };

  const changeCouponCodeType = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      couponCodeType: value,
      couponCode: value === "single" ? [prevData.name] : prevData.couponCode
    }));
  };

  const changeNumberOfRedemptions = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      numberOfRedemptions: value,
    }));
  };

  const handleCouponCodesChange = (value) => {
    setCoupons(value);
    // Split the input by commas, newlines, or spaces and filter out empty strings
    const codeArray = value.split(/[\s,]+/).filter(code => code.trim() !== "");
    setAddData((prevData) => ({
      ...prevData,
      couponCode: codeArray,
    }));
  };

  const handleSubmit = (addData) => {
    // Prepare data before submission
    const submissionData = { ...addData };
    
    // Set couponCode based on couponCodeType
    if (submissionData.couponCodeType === "single") {
      submissionData.couponCode = [submissionData.name];
    }
    
    if (addData.name !== "" && addData.title !== "" && addData.amount !== 0 && addData.discountType !== "" && addData.type !== "") {
      // Additional validation for range coupon codes
      if (addData.couponCodeType === "range" && addData.couponCode.length === 0) {
        toast.error("Please enter coupon codes.");
        return;
      }
      
      if (editData) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/rewards/updateReward/${editData._id}?userId=${userId}`,
            submissionData, {
              headers: {
                "auth-token": userToken
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("Reward updated!");
              setTimeout(() => {
                closeForm();
              }, 2000);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      } else {
        axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/api/rewards/addReward?userId=${userId}`, submissionData, {
            headers: {
              "auth-token": userToken
            },
          })
          .then((response) => {
            if (response) {
              toast("Reward added!");
              setAddData({
                name: "",
                title: "",
                description: "",
                type: "addition",
                discountType: "",
                amount: 0,
                enabled: "yes",
                rewardType: "exclusive-iprop",
                couponCodeType: "single",
                couponCode: [],
                numberOfRedemptions: 1
              });
              setCoupons("");

              setTimeout(() => {
                closeForm();
              }, 2000);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      }
    } else {
      toast.error("Fill all the required fields.");
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        name: editData.name,
        title: editData.title || "",
        type: editData.type,
        description: editData.description || "",
        discountType: editData.discountType,
        amount: editData.amount,
        enabled: editData.enabled || "yes",
        rewardType: editData.rewardType || "exclusive-iprop",
        couponCodeType: editData.couponCodeType || "single",
        couponCode: editData.couponCode || [],
        numberOfRedemptions: editData.numberOfRedemptions || 1
      });
      
      // Set coupons string for textarea when editing
      if (editData.couponCode && editData.couponCode.length > 0 && editData.couponCodeType === "range") {
        setCoupons(editData.couponCode.join("\n"));
      }
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
                    Reward Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="off"
                    value={addData.name}
                    onChange={(e) => changeName(e.target.value)}
                    placeholder="Reward Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    htmlFor="title"
                    className="mb-3 block text-base font-medium"
                  >
                    Reward Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    autoComplete="off"
                    value={addData.title}
                    onChange={(e) => changeTitle(e.target.value)}
                    placeholder="Reward Title"
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
                  <input 
                    type="text"
                    name="description"
                    id="description"
                    autoComplete="off"
                    value={addData.description}
                    onChange={(e) => changeDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="rewardType"
                    className="mb-3 block text-base font-medium"
                  >
                    Reward Type
                  </label>
                  <select
                    name="rewardType"
                    id="rewardType"
                    value={addData.rewardType}
                    onChange={(e) => changeRewardType(e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="exclusive-iprop">Exclusive iProp</option>
                    <option value="third-party">Third Party</option>
                  </select>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="couponCodeType"
                    className="mb-3 block text-base font-medium"
                  >
                    Coupon Code Type
                  </label>
                  <select
                    name="couponCodeType"
                    id="couponCodeType"
                    value={addData.couponCodeType}
                    onChange={(e) => changeCouponCodeType(e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="single">Single (Uses Reward Name)</option>
                    <option value="range">Range (Multiple Codes)</option>
                  </select>
                </div>
              </div>
            </div>

            {addData.couponCodeType === "range" && (
              <div className="flex flex-wrap -mx-3">
                <div className="w-full px-3">
                  <div className="mb-5">
                    <label
                      htmlFor="couponCodes"
                      className="mb-3 block text-base font-medium"
                    >
                      Coupon Codes <span className="text-red-500">*</span>
                      <span className="text-sm text-gray-500 ml-2">(Separate by commas, spaces or new lines)</span>
                    </label>
                    <textarea
                      name="couponCodes"
                      id="couponCodes"
                      value={coupons}
                      onChange={(e) => handleCouponCodesChange(e.target.value)}
                      placeholder="Enter coupon codes here"
                      className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap -mx-3">
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="numberOfRedemptions"
                    className="mb-3 block text-base font-medium"
                  >
                    Number of Redemptions
                  </label>
                  <input
                    type="number"
                    name="numberOfRedemptions"
                    id="numberOfRedemptions"
                    min="1"
                    value={addData.numberOfRedemptions}
                    onChange={(e) => changeNumberOfRedemptions(e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="amount"
                    className="mb-3 block text-base font-medium"
                  >
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={addData.amount}
                    onChange={(e) => changeAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="discountType"
                    className="mb-3 block text-base font-medium"
                  >
                    Discount Type <span className="text-red-500">*</span>
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
              
              <div className="w-full md:w-1/2 px-3">
                <div className="mb-5">
                  <label
                    htmlFor="type"
                    className="mb-3 block text-base font-medium"
                  >
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    id="type"
                    value={addData.type}
                    onChange={(e) => changeType(e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="">--Select--</option>
                    <option value="addition">Addition</option>
                    <option value="redemption">Redemption</option>
                  </select>
                </div>
              </div> 
            </div>

            <div className="flex flex-wrap -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    className="mb-3 block text-base font-medium"
                  >
                    Enable reward?
                  </label>
                  <div className="flex items-center space-x-6 py-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="enabled"
                        value="yes"
                        className="h-5 w-5"
                        id="radioButton1"
                        checked={addData.enabled === "yes"}
                        onChange={(e) => changeEnabledStatus(e.target.value)}
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
                        name="enabled"
                        value="no"
                        className="h-5 w-5"
                        id="radioButton2"
                        checked={addData.enabled === "no"}
                        onChange={(e) => changeEnabledStatus(e.target.value)}
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
              </div>
            </div>

            <div className="mt-2">
              <button
                style={{ backgroundColor: colors.blueAccent[500] }}
                className="hover:shadow-htmlForm rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(addData);
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default RewardsForm;
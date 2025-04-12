import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import VoucherForm from "../../../components/configurations/VouchersForm";
import { formatDate } from "../../../MyFunctions";

import { jwtDecode } from "jwt-decode";

function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [canSetInitialVouchers, setCanSetInitialVouchers] = useState(false);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    {
      field: "serial",
      headerName: "No.",
      width: 45,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1, // Start numbering from 1
    },
    {
        field: "userId",
        headerName: "For User",
        width: 100},
    {
      field: "name",
      headerName: "Voucher Name",
      width: 150,
      cellClassName: "name-column--cell",
    },
    {
      field: "description",
      headerName: "Description",
      headerAlign: "left",
      align: "left",
      width: 180,
    },
    {
      field: "discountType",
      headerName: "Discount Type",
      headerAlign: "left",
      align: "left",
      width: 130,
      valueGetter: (params) => {
        const types = {
          percentage: "Percentage",
          fixed_amount: "Fixed Amount",
          free_item: "Free Item"
        };
        return types[params.value] || params.value;
      }
    },
    {
      field: "discountValue",
      headerName: "Value",
      headerAlign: "right",
      align: "right",
      width: 100,
    },
    {
      field: "status",
      headerName: "Status",
      headerAlign: "left",
      align: "left",
      width: 100,
      valueGetter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1),
    },
    {
      field: "isActive",
      headerName: "Active",
      headerAlign: "center",
      align: "center",
      width: 80,
      valueGetter: (params) => params.value ? "Yes" : "No",
    },
    {
      field: "isRedeemed",
      headerName: "Redeemed",
      headerAlign: "center",
      align: "center",
      width: 100,
      valueGetter: (params) => params.value ? "Yes" : "No",
    },
    {
      field: "issuedDate",
      headerName: "Issued Date",
      width: 150,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "redeemedDate",
      headerName: "Redeemed Date",
      width: 150,
      valueGetter: (params) => params.value ? formatDate(params.value) : "N/A",
    },
    {
      field: "action", 
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEdit(params.row._id)}
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row._id)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchVoucher = async (id) => {
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/redeemVouchers/fetchVoucher/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setEditData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occurred.");
      });
  };

  const fetchAllVouchers = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/redeemVouchers/fetchAllVouchers?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response.data.length === 0) {
          setCanSetInitialVouchers(true);
        }
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const SetInitialVouchers = (userId, userToken) => {
    console.log("Setting Initial Vouchers");
    console.log(userId, userToken);
    axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/redeemVouchers/addDefaultVouchers?userId=${userId}`, {},
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        toast("Initial Vouchers Set!");
        fetchAllVouchers(userId, userToken);
        setCanSetInitialVouchers(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteVoucherById = async (id) => {
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/redeemVouchers/deleteVoucher/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Voucher deleted!");
          fetchAllVouchers(userId, userToken);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occurred.");
      });
  };

  useEffect(() => {
    try {
      // getting userId and userToken
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        fetchAllVouchers(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    fetchAllVouchers(userId, userToken);
    setMode("display");
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchVoucher(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteVoucherById(id);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Vouchers"
          subtitle={
            mode === "add"
              ? "Add a Redeem Voucher"
              : mode === "edit"
              ? "Edit the Redeem Voucher"
              : "Manage Redeem Vouchers here"
          }
        />

        <Box>
          {mode === "display" ? (
            <div className="flex items-center">
              {canSetInitialVouchers === true && <div
                className="border-2 mr-12 border-green-600 rounded-lg px-3 py-2 text-green-400 cursor-pointer hover:bg-green-600 hover:text-green-200"
                onClick={()=>{
                    SetInitialVouchers(userId, userToken);
                }}
              >
                Set Initial Vouchers
              </div>}

              <div
                className="border-2 mr-12 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
                onClick={handleAddMore}
              >
                Add more
              </div>
            </div>
          ) : (
            <div
              className="border-2 mr-12 border-red-600 rounded-lg px-3 py-2 text-red-400 cursor-pointer hover:bg-red-600 hover:text-red-200"
              onClick={handleCancel}
            >
              Back
            </div>
          )}
        </Box>
      </Box>

      {/* Render form or DataGrid based on mode */}
      {mode === "add" ? (
        <VoucherForm
          userId={userId}
          userToken={userToken}
          closeForm={handleCancel}
        />
      ) : mode === "edit" ? (
        editData && (
          <Box
            m="40px 0 0 0"
            height="75vh"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .name-column--cell": {
                color: colors.greenAccent[300],
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.blueAccent[700],
                borderBottom: "none",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.blueAccent[700],
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
              "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                color: `${colors.grey[100]} !important`,
              },
            }}
          >
            <VoucherForm
              userId={userId}
              userToken={userToken}
              editData={editData}
              closeForm={handleCancel}
            />
          </Box>
        )
      ) : (
        <Box
          m="40px 0 0 0"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <DataGrid
            rows={data}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row._id}
            autoHeight
          />
        </Box>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default Index;
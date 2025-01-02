import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import AppointmentsForm from "../../../components/frontendPreview/AppointmentsForm";
import { formatDate } from "../../../MyFunctions";
import { FaEye } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");
  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState();

  const columns = [
    {
      field: "serial",
      headerName: "No.",
      width: 70,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: "name",
      headerName: "Name",
      width: 130,
      cellClassName: "name-column--cell",
    },
    {
      field: "mobile",
      headerName: "Mobile",
      width: 120,
    },
    {
      field: "email",
      headerName: "Email",
      width: 150,
    },
    {
      field: "enquiryFor",
      headerName: "Enquiry Type",
      width: 80,
      valueGetter: (params) => params.value.toUpperCase(),
    },
    {
      field: "date",
      headerName: "Appointment Date",
      width: 150,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "timeSlot",
      headerName: "Time Slot",
      width: 150,
    },
    {
      field: "createdAt",
      headerName: "Booked On",
      width: 150,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEdit(params.row._id)}
            className="text-grey-400"
          >
            <FaEye />
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

  const fetchAppointment = async (id) => {
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/fetchAppointment/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken
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
        toast.error("Error fetching appointment details.");
      });
  };

  const fetchAllAppointments = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/fetchAllAppointments?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken
          },
        }
      )
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error fetching appointments.");
      });
  };

  const deleteAppointmentById = async (id) => {
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/deleteAppointment/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken
          },
        }
      )
      .then((response) => {
        if (response) {
          toast.success("Appointment deleted successfully!");
          fetchAllAppointments(userId, userToken);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error deleting appointment.");
      });
  };

  useEffect(() => {
    try {
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        fetchAllAppointments(decoded.userId, token);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error initializing appointments.");
    }
  }, []);

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    fetchAllAppointments(userId, userToken);
    setMode("display");
  };

  const handleEdit = (id) => {
    fetchAppointment(id);
    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointmentById(id);
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Appointments"
          subtitle={
            mode === "add"
              ? "Schedule New Appointment"
              : mode === "edit"
              ? "Review Appointment Details"
              : "Manage Appointments"
          }
        />

        <Box>
          {mode === "display" ? (
            <div
              className="border-2 mr-12 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
              onClick={handleAddMore}
            >
              Schedule Appointment
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

      {mode === "add" ? (
        <AppointmentsForm setModeToDisplay={handleCancel} userId={userId} userToken={userToken} />
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
            <AppointmentsForm 
              setModeToDisplay={handleCancel} 
              userId={userId} 
              userToken={userToken} 
              editData={editData} 
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
    </Box>
  );
}

export default Index;
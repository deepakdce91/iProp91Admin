import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { TbCircleDotFilled } from "react-icons/tb";

import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import AppointmentsForm from "../../../components/frontendPreview/AppointmentsForm";
import { formatDate } from "../../../MyFunctions";
import { FaEye } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import MarkUnreadModal from "../../../components/ui/MarkUnreadModal";
import DeleteModal from "../../../components/ui/DeleteModal";

function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");
  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [deleteIsViewed, setDeleteIsViewed] = useState();

  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [unreadId, setUnreadId] = useState();

  const columns = [
    {
      field: "isViewed",
      headerName: "",
      flex: 0.2,
      renderCell: (params) => {
        if (params.row.isViewed === "no") {
          return <TbCircleDotFilled className="text-green-400" />;
        } else if (params.row.isViewed === "red") {
          return <TbCircleDotFilled className="text-red-400" />;
        } else {
          return (
            <TbCircleDotFilled
              onClick={() => {
                handleMarkUnread(params.row._id);
              }}
              className="text-gray-400 cursor-pointer"
            />
          );
        }
      },
    },
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
      width: 150,
      renderCell: (params) => (
        <Box>
          {/* <IconButton
            onClick={() => {
              handleShowDetails(params.row);

              if (params.row.isViewed !== "yes") {
                toggleAppointmentViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newAppointments");
                }
              }
            }}
            // color="primary"
            className="text-grey-400"
          >
            <VisibilityIcon />
          </IconButton> */}

          <IconButton
            onClick={() => {
              handleEdit(params.row);

              if (params.row.isViewed !== "yes") {
                toggleAppointmentViewed(params.row._id, "yes");
                if (params.row.isViewed === "no") {
                  decreaseCounter(userId, userToken, "newAppointments");
                }
              }
            }}
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => handleDelete(params.row._id, params.row.isViewed)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const toggleAppointmentViewed = async (id, to) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${
          to === "yes"
            ? "setAppointmentViewed"
            : to === "red"
            ? "setAppointmentViewedRed"
            : "setAppointmentNotViewed"
        }/${id}?userId=${userId}`,
        {}, // empty body since we're only updating isViewed to "yes"
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          fetchAllAppointments(userId, userToken);
          setRefetchNotification();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error.");
      });
  };

  const decreaseCounter = async (userId, userToken, type) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/decreaseCounter?userId=${userId}`,

        {
          type,
        },
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setRefetchNotification(); //reset value on sidebar
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const fetchAppointment = async (id) => {
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/fetchAppointment/${id}?userId=${userId}`,
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
        toast.error("Error fetching appointment details.");
      });
  };

  const fetchAllAppointments = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/fetchAllAppointments?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
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

  const deleteAppointmentById = async (id, myIsViewed) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/deleteAppointment/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Appointment deleted!");
          if (myIsViewed === "no") {
            decreaseCounter(userId, userToken, "newAppointments");
          }
          fetchAllAppointments(userId, userToken);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
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
    setRefetchNotification();
  };

  // Click handler for the edit button
  const handleEdit = (data) => {
    setEditData(data);
    setMode("edit");
  };

  // Click handler for the delete button
  const handleDelete = (id, isViewed) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteIsViewed(isViewed);
  };

  const handleShowDetails = (data) => {
    setEditData(data);
    setMode("showDetails");
  };

  const handleMarkUnread = (id) => {
    setShowUnreadModal(true);
    setUnreadId(id);
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
        <AppointmentsForm
          setModeToDisplay={handleCancel}
          userId={userId}
          userToken={userToken}
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

      {showDeleteModal === true && deleteId && (
        <DeleteModal
          handleDelete={() => {
            deleteAppointmentById(deleteId, deleteIsViewed);
          }}
          closeModal={() => {
            setShowDeleteModal(false);
          }}
        />
      )}

      {showUnreadModal === true && unreadId && (
        <MarkUnreadModal
          handleMarkUnread={() => {
            toggleAppointmentViewed(unreadId, "red");
          }}
          closeModal={() => {
            setShowUnreadModal(false);
          }}
        />
      )}
    </Box>
  );
}

export default Index;

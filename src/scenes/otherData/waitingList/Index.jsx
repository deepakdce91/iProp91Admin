import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import { formatDate } from "../../../MyFunctions";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { jwtDecode } from "jwt-decode";
import DeleteModal from "../../../components/ui/DeleteModal";
import ViewWaitingListModal from "./WaitingListModal";

function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");
  const [data, setData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState();

  const columns = [
    {
      field: "serial",
      headerName: "No.",
      width: 70,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1, // Start numbering from 1
    },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
    },
    {
      field: "mobile",
      headerName: "Mobile",
      width: 120,
    },
    {
      field: "state",
      headerName: "State",
      width: 120,
    },
    {
      field: "city",
      headerName: "City",
      width: 120,
    },
    {
      field: "builder",
      headerName: "Builder",
      width: 150,
    },
    {
      field: "project",
      headerName: "Project",
      width: 150,
    },
    {
      field: "tower",
      headerName: "Tower",
      width: 100,
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
    },
    {
      field: "createdAt",
      headerName: "Added at",
      width: 150,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleViewDetails(params.row)}
            className="text-grey-400"
          >
            <VisibilityIcon />
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

  // Fetch all waiting list entries
  const fetchAllWaitingListEntries = async (userId, userToken) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/waitingList/fetchAll?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching waiting list entries:", error);
      toast.error("Failed to fetch waiting list entries.");
    }
  };

  // Delete a waiting list entry by ID
  const deleteWaitingListEntryById = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/waitingList/delete/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
      toast.success("Waiting list entry deleted successfully!");
      fetchAllWaitingListEntries(userId, userToken); // Refresh the data
    } catch (error) {
      console.error("Error deleting waiting list entry:", error);
      toast.error("Failed to delete waiting list entry.");
    }
  };

  // Handle view details
  const handleViewDetails = (data) => {
    setViewData(data);
    setShowViewModal(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    deleteWaitingListEntryById(deleteId);
    setShowDeleteModal(false);
  };

  // Close modals
  const closeModals = () => {
    setShowDeleteModal(false);
    setShowViewModal(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        fetchAllWaitingListEntries(decoded.userId, token);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Waiting List" subtitle="Manage Waiting List entries here" />
      </Box>

      {/* DATA GRID */}
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <DeleteModal
          handleDelete={confirmDelete}
          closeModal={closeModals}
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && viewData && (
        <ViewWaitingListModal
          data={viewData}
          closeModal={closeModals}
        />
      )}
    </Box>
  );
}

export default Index;
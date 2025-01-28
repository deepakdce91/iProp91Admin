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
import ViewBuyQueryModal from "../../../components/ui/BuyQueryModal";

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
      field: "city",
      headerName: "City",
      width: 120,
    },
    {
      field: "officeLocation",
      headerName: "Office Location",
      width: 180,
    },
    {
      field: "kidsSchoolLocation",
      headerName: "Kids School Location",
      width: 180,
    },
    {
      field: "medicalAssistanceRequired",
      headerName: "Medical Assistance",
      width: 70,
    },
    {
      field: "budget",
      headerName: "Budget",
      width: 100,
    },
    {
      field: "type",
      headerName: "Type",
      width: 100,
    },
    {
      field: "constructionStatus",
      headerName: "Construction Status",
      width: 120,
    },
    {
      field: "createdAt",
      headerName: "Received at",
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

  // Fetch all buy queries
  const fetchAllBuyQueries = async (userId, userToken) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/buyQueries/fetchAllBuyQueries?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching buy queries:", error);
      toast.error("Failed to fetch buy queries.");
    }
  };

  // Delete a buy query by ID
  const deleteBuyQueryById = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/buyQueries/deleteBuyQuery/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
      toast.success("Buy Query deleted successfully!");
      fetchAllBuyQueries(userId, userToken); // Refresh the data
    } catch (error) {
      console.error("Error deleting buy query:", error);
      toast.error("Failed to delete buy query.");
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
    deleteBuyQueryById(deleteId);
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
        fetchAllBuyQueries(decoded.userId, token);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Buy Queries" subtitle="Manage Buy Queries here" />
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
        <ViewBuyQueryModal
          data={viewData}
          closeModal={closeModals}
        />
      )}
    </Box>
  );
}

export default Index;
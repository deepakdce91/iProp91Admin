import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import { formatDate } from "../../../MyFunctions";
import { jwtDecode } from "jwt-decode";

function RewardsLedger() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"

  // Define the columns for the DataGrid
  const columns = [
    {
      field: "serial",
      headerName: "No.",
      width: 45,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1,
    },
    {
      field: "userId",
      headerName: "User ID",
      width: 220,
      cellClassName: "name-column--cell",
    },
    {
      field: "rewardId",
      headerName: "Reward ID",
      width: 220,
    },
    {
      field: "date",
      headerName: "Transaction Date",
      width: 180,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "amount",
      headerName: "Amount",
      headerAlign: "right",
      align: "right",
      width: 100,
    },
    {
      field: "transactionType",
      headerName: "Type",
      width: 120,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case 'earned':
            color = colors.greenAccent[400];
            break;
          case 'redeemed':
            color = colors.redAccent[400];
            break;
          case 'expired':
            color = colors.grey[400];
            break;
          case 'adjusted':
            color = colors.blueAccent[400];
            break;
          default:
            color = colors.grey[100];
        }
        return (
          <Box
            width="80%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            bgcolor={color}
            borderRadius="4px"
          >
            {params.value}
          </Box>
        );
      }
    },
    {
      field: "purpose",
      headerName: "Purpose",
      width: 180,
    },
    {
      field: "comments",
      headerName: "Comments",
      width: 280,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case 'completed':
            color = colors.greenAccent[400];
            break;
          case 'pending':
            color = colors.yellowAccent ? colors.yellowAccent[400] : "#FFC107";
            break;
          case 'cancelled':
            color = colors.redAccent[400];
            break;
          default:
            color = colors.grey[100];
        }
        return (
          <Box
            width="80%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            bgcolor={color}
            borderRadius="4px"
          >
            {params.value}
          </Box>
        );
      }
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "action", 
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleViewDetails(params.row)}
            className="text-grey-400"
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Fetch all transactions from the rewards ledger
  const fetchAllTransactions = (userId, userToken) => {
    setIsLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/rewardsLedger/getAllTransactions?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to fetch transaction data");
        setIsLoading(false);
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
        fetchAllTransactions(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
      toast.error("Authentication error");
    }
  }, []);

  // Handle viewing transaction details
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setViewMode("detail");
  };

  // Handle back to list view
  const handleBackToList = () => {
    setSelectedTransaction(null);
    setViewMode("list");
  };

  // Detail view component
  const TransactionDetail = ({ transaction }) => {
    return (
      <Box
        mt="20px"
        p="20px"
        bgcolor={colors.primary[400]}
        borderRadius="8px"
      >
        <Box display="flex" justifyContent="space-between" mb="20px">
          <Box>
            <h2 className="text-xl font-bold">Transaction Details</h2>
          </Box>
          <div
            className="border-2 border-red-600 rounded-lg px-3 py-2 text-red-400 cursor-pointer hover:bg-red-600 hover:text-red-200"
            onClick={handleBackToList}
          >
            Back to List
          </div>
        </Box>

        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="20px">
          <Box>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="mb-2">
              <span className="font-semibold">Transaction ID: </span>
              <span>{transaction._id}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">User ID: </span>
              <span>{transaction.userId}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Reward ID: </span>
              <span>{transaction.rewardId}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Transaction Date: </span>
              <span>{formatDate(transaction.date)}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Created At: </span>
              <span>{formatDate(transaction.createdAt)}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Updated At: </span>
              <span>{formatDate(transaction.updatedAt)}</span>
            </div>
          </Box>

          <Box>
            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
            <div className="mb-2">
              <span className="font-semibold">Amount: </span>
              <span>{transaction.amount}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Transaction Type: </span>
              <span className={`px-2 py-1 rounded ${
                transaction.transactionType === 'earned' ? 'bg-green-600' : 
                transaction.transactionType === 'redeemed' ? 'bg-red-600' : 
                transaction.transactionType === 'expired' ? 'bg-gray-600' : 'bg-blue-600'
              }`}>
                {transaction.transactionType}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status: </span>
              <span className={`px-2 py-1 rounded ${
                transaction.status === 'completed' ? 'bg-green-600' : 
                transaction.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                {transaction.status}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Purpose: </span>
              <span>{transaction.purpose}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Transaction Reference: </span>
              <span>{transaction.transactionReference}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Notes: </span>
              <span>{transaction.notes || "N/A"}</span>
            </div>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Rewards Ledger"
          subtitle={viewMode === "list" ? "Transaction history for all rewards" : "Transaction Details"}
        />
      </Box>

      {/* Content based on view mode */}
      {viewMode === "detail" && selectedTransaction ? (
        <TransactionDetail transaction={selectedTransaction} />
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
            loading={isLoading}
            disableSelectionOnClick
          />
        </Box>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default RewardsLedger;
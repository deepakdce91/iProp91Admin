import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import ProjectsDataMasterForm from "../../../components/general/projectsDataMaster/ProjectsDataMasterForm";
import { formatDate } from "../../../MyFunctions";
import { jwtDecode } from "jwt-decode";
import { TbCircleDotFilled } from "react-icons/tb";
import DeleteModal from "../../../components/ui/DeleteModal";
import MarkUnreadModal from "../../../components/ui/MarkUnreadModal";
import * as XLSX from 'xlsx';


function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display"); //display add edit showDetails
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [deleteIsViewed, setDeleteIsViewed] = useState();

  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [unreadId, setUnreadId] = useState();

  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Function to extract filename from URL
  const getFilenameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'file';
      return filename;
    } catch (e) {
      return 'file';
    }
  };

  // Function to convert URL to document schema
  const convertUrlToDocument = (url) => {
    return {
      name: getFilenameFromUrl(url),
      path: url,
      addedBy: "admin"
    };
  };

  // Function to process media fields
  const processMediaField = (value) => {
    if (!value) return [];
    
    try {
      // If it's already a JSON string, parse it
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(url => typeof url === 'string' ? convertUrlToDocument(url) : url);
        } else if (typeof parsed === 'object') {
          return [parsed];
        }
      }
      
      // If it's a comma-separated string of URLs
      if (typeof value === 'string' && value.includes(',')) {
        return value.split(',')
          .map(url => url.trim())
          .filter(url => url)
          .map(url => convertUrlToDocument(url));
      }
      
      // If it's a single URL string
      if (typeof value === 'string' && value.trim()) {
        return [convertUrlToDocument(value.trim())];
      }
      
      return [];
    } catch (e) {
      console.error('Error processing media field:', e);
      return [];
    }
  };

  // Function to process coordinates field
  const processCoordinatesField = (value) => {
    if (!value) return [0, 0]; // Default coordinates
    
    try {
      // If it's already a JSON string, parse it
      if (typeof value === 'string' && value.startsWith('[')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length === 2) {
          return [Number(parsed[0]), Number(parsed[1])];
        }
      }
      
      // If it's a comma-separated string
      if (typeof value === 'string' && value.includes(',')) {
        const parts = value.split(',').map(part => parseFloat(part.trim())).filter(num => !isNaN(num));
        if (parts.length === 2) {
          return parts;
        }
      }
      
      // If it's invalid or missing, return default
      return [0, 0];
    } catch (e) {
      console.error('Error processing coordinates field:', e);
      return [0, 0];
    }
  };

  // Function to process array fields (comma-separated values)
  const processArrayField = (value) => {
    if (!value) return [];
    
    try {
      // If it's already a JSON string, parse it
      if (typeof value === 'string' && value.startsWith('[')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      
      // If it's a comma-separated string
      if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map(item => item.trim()).filter(item => item);
      }
      
      // If it's a single value
      if (typeof value === 'string' && value.trim()) {
        return [value.trim()];
      }
      
      return [];
    } catch (e) {
      console.error('Error processing array field:', e);
      return [];
    }
  };

  // Function to map Excel columns to schema fields
  const mapRowToSchema = (row, headers) => {
    const mappedData = {};
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
      if (row[index] !== undefined && row[index] !== '') {
        const value = row[index].toString().trim();
        
        // Handle coordinates field
        if (normalizedHeader === 'coordinates') {
          mappedData['coordinates'] = processCoordinatesField(value);
        }
        // Handle media fields
        else if (['images', 'videos', 'floorplan'].includes(normalizedHeader)) {
          mappedData[normalizedHeader] = processMediaField(value);
        }
        // Handle array fields
        else if ([
          'appartmenttype', 'appartmentsubtype', 'features', 'amenities', 
          'commercialhubs', 'hospitals', 'hotels', 'shoppingcentres', 
          'transportationhubs', 'educationalinstitutions'
        ].includes(normalizedHeader)) {
          mappedData[normalizedHeader === 'appartmenttype' ? 'appartmentType' : 
                     normalizedHeader === 'appartmentsubtype' ? 'appartmentSubType' :
                     normalizedHeader === 'commercialhubs' ? 'commercialHubs' :
                     normalizedHeader === 'shoppingcentres' ? 'shoppingCentres' :
                     normalizedHeader === 'transportationhubs' ? 'transportationHubs' :
                     normalizedHeader === 'educationalinstitutions' ? 'educationalInstitutions' :
                     normalizedHeader] = processArrayField(value);
        }
        // Handle boolean fields
        else if (['istitledeedverified', 'enable'].includes(normalizedHeader)) {
          const fieldName = normalizedHeader === 'istitledeedverified' ? 'isTitleDeedVerified' : 'enable';
          mappedData[fieldName] = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' ? 
                                  (normalizedHeader === 'istitledeedverified' ? 'yes' : 'true') : 
                                  (normalizedHeader === 'istitledeedverified' ? 'no' : 'false');
        }
        // Handle camelCase conversions
        else if (normalizedHeader === 'propertyid') {
          mappedData['propertyId'] = value;
        }
        else if (normalizedHeader === 'listingid') {
          mappedData['listingId'] = value;
        }
        else if (normalizedHeader === 'housenumber') {
          mappedData['houseNumber'] = value;
        }
        else if (normalizedHeader === 'floornumber') {
          mappedData['floorNumber'] = value;
        }
        else if (normalizedHeader === 'availablefor') {
          mappedData['availableFor'] = value;
        }
        else if (normalizedHeader === 'minimumprice') {
          mappedData['minimumPrice'] = value;
        }
        else if (normalizedHeader === 'maximumprice') {
          mappedData['maximumPrice'] = value;
        }
        else if (normalizedHeader === 'numberoffloors') {
          mappedData['numberOfFloors'] = value;
        }
        else if (normalizedHeader === 'numberofbedrooms') {
          mappedData['numberOfBedrooms'] = value;
        }
        else if (normalizedHeader === 'numberofbathrooms') {
          mappedData['numberOfBathrooms'] = value;
        }
        else if (normalizedHeader === 'numberofwashrooms') {
          mappedData['numberOfWashrooms'] = value;
        }
        else if (normalizedHeader === 'numberofparkings') {
          mappedData['numberOfParkings'] = value;
        }
        // Handle direct mapping fields
        else {
          const directMappings = {
            'state': 'state',
            'city': 'city',
            'builder': 'builder',
            'project': 'project',
            'tower': 'tower',
            'unit': 'unit',
            'size': 'size',
            'overview': 'overview',
            'address': 'address',
            'sector': 'sector',
            'pincode': 'pincode',
            'status': 'status',
            'type': 'type',
            'category': 'category',
            'bhk': 'bhk'
          };
          
          if (directMappings[normalizedHeader]) {
            mappedData[directMappings[normalizedHeader]] = value;
          }
        }
      }
    });
    return mappedData;
  };

  // Function to validate required fields
  const validateRow = (row, headers) => {
    const requiredFields = ['state', 'city', 'builder', 'project'];
    const mappedHeaders = headers.map(h => h.toLowerCase());
    
    for (let field of requiredFields) {
      const index = mappedHeaders.indexOf(field);
      if (index === -1 || !row[index]) {
        return false;
      }
    }
    return true;
  };

  // Function to download dummy Excel template
  const downloadDummyExcel = () => {
    // Define all accepted headers for the upload feature based on PDM schema
    const headers = [
      // Required fields
      'State',
      'City',
      'Builder',
      'Project',
      
      // Basic property details
      'PropertyId',
      'ListingId',
      'Coordinates',
      'HouseNumber',
      'FloorNumber',
      'Tower',
      'Unit',
      'Size',
      'Overview',
      'Address',
      'Sector',
      'Pincode',
      'Status',
      'Type',
      'AvailableFor',
      'Category',
      'MinimumPrice',
      'MaximumPrice',
      'BHK',
      'NumberOfFloors',
      'NumberOfBedrooms',
      'NumberOfBathrooms',
      'NumberOfWashrooms',
      'NumberOfParkings',
      'IsTitleDeedVerified',
      
      // Array fields (comma-separated values)
      'AppartmentType',
      'AppartmentSubType',
      'Features',
      'Amenities',
      'CommercialHubs',
      'Hospitals',
      'Hotels',
      'ShoppingCentres',
      'TransportationHubs',
      'EducationalInstitutions',
      
      // Media fields
      'Images',
      'Videos',
      'FloorPlan',
      
      // Settings
      'Enable'
    ];

    // Create sample data rows to show format
    const sampleData = [
      [
        // Required fields
        'Maharashtra',
        'Mumbai',
        'ABC Builders',
        'Dream Heights',
        
        // Basic property details
        'PROP001',
        'none',
        '[19.0760, 72.8777]',
        '101',
        '10',
        'Tower A',
        'A-101',
        '1200 sq ft',
        'Luxury 2BHK apartment with modern amenities and beautiful city views',
        '123 Sample Street, Andheri West, Mumbai',
        'Andheri West',
        '400053',
        'Under Construction',
        'Residential',
        'sale',
        'new_projects',
        '5000000',
        '5500000',
        '2BHK',
        '20',
        '2',
        '2',
        '1',
        '1',
        'yes',
        
        // Array fields (comma-separated)
        'Luxury,Premium',
        'High-rise,Modern',
        'Balcony,Modern Kitchen,Spacious Rooms',
        'Swimming Pool,Gym,Garden,Security,Lift',
        'BKC,Lower Parel,Powai',
        'Kokilaben Hospital,Nanavati Hospital',
        'JW Marriott,Taj Hotel',
        'Phoenix Mills,Palladium Mall',
        'Andheri Station,Airport',
        'IIT Bombay,NMIMS',
        
        // Media fields
        'https://example.com/image1.jpg,https://example.com/image2.jpg',
        'https://example.com/video1.mp4',
        'https://example.com/floorplan1.pdf',
        
        // Settings
        'true'
      ],
      [
        // Required fields
        'Karnataka',
        'Bangalore',
        'XYZ Developers',
        'Tech Park Residency',
        
        // Basic property details
        'PROP002',
        'none',
        '[12.9716, 77.5946]',
        '201',
        '2',
        'Block B',
        'B-201',
        '2000 sq ft',
        'Spacious 3BHK villa in prime location with garden and parking',
        '456 Tech Street, Electronic City, Bangalore',
        'Electronic City',
        '560100',
        'Ready to Move',
        'Residential',
        'both',
        'verified_owner',
        '8000000',
        '8500000',
        '3BHK',
        '2',
        '3',
        '3',
        '2',
        '2',
        'no',
        
        // Array fields (comma-separated)
        'Villa,Independent',
        'Duplex,Garden Facing',
        'Garden,Parking,Terrace,Study Room',
        'Clubhouse,Security,Power Backup,Water Supply',
        'Electronic City,Silk Board,Koramangala',
        'Manipal Hospital,Apollo Hospital',
        'Taj Yeshwantpur,Sheraton Hotel',
        'Forum Mall,Brigade Road',
        'Electronic City Metro,Silk Board',
        'IISc,Christ University',
        
        // Media fields
        'https://example.com/image3.jpg,https://example.com/image4.jpg',
        '',
        'https://example.com/floorplan2.pdf',
        
        // Settings
        'true'
      ]
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [headers, ...sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    const columnWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects Template');

    // Generate and download the file
    const fileName = `Projects_Data_Master_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success('Dummy Excel template downloaded successfully!');
  };

  // Function to handle file upload
  // Function to handle file upload with transpose support
 // Function to handle file upload with transpose support and multiple sheets
// Function to handle file upload with transpose support and partial uploads
// Function to handle file upload with transpose support and multiple sheets
// Function to handle file upload with transpose support and multiple sheets
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  setIsUploading(true);
  setUploadError("");

  // Show uploading toast
  const uploadingToastId = toast.info("Uploading Excel file...", {
    autoClose: false,
    closeOnClick: false,
    closeButton: false
  });

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Dismiss uploading toast and show processing toast
        toast.dismiss(uploadingToastId);
        const processingToastId = toast.info("Processing Excel data...", {
          autoClose: false,
          closeOnClick: false,
          closeButton: false
        });

        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let totalSuccessCount = 0;
        let totalErrorCount = 0;
        let totalSkippedCount = 0;
        let processedSheets = 0;

        // Process all sheets in the workbook
        for (const sheetName of workbook.SheetNames) {
          console.log(`Processing sheet: ${sheetName}`);
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 1) {
            console.log(`Skipping empty sheet: ${sheetName}`);
            continue;
          }

          // Define expected headers for validation (more flexible matching)
          const expectedHeaders = [
            'state', 'city', 'builder', 'project', 'propertyid', 'listingid', 'coordinates',
            'housenumber', 'floornumber', 'tower', 'unit', 'size', 'overview', 'address',
            'sector', 'pincode', 'status', 'type', 'availablefor', 'category', 'minimumprice',
            'maximumprice', 'bhk', 'numberoffloors', 'numberofbedrooms', 'numberofbathrooms',
            'numberofwashrooms', 'numberofparkings', 'istitledeedverified', 'appartmenttype',
            'appartmentsubtype', 'features', 'amenities', 'commercialhubs', 'hospitals',
            'hotels', 'shoppingcentres', 'transportationhubs', 'educationalinstitutions',
            'images', 'videos', 'floorplan', 'enable'
          ];

          // Helper function for flexible header matching
          const normalizeHeader = (header) => {
            if (!header) return '';
            return header.toString().toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[-_]/g, '')
              .replace(/[^a-z0-9]/g, '');
          };

          let headers, rows, isTransposed = false;

          // Check if headers are in first row (normal format)
          const firstRowHeaders = jsonData[0] ? jsonData[0].map(header => normalizeHeader(header)) : [];
          const firstRowMatches = firstRowHeaders.filter(header => 
            header && expectedHeaders.some(expected => {
              const normalizedExpected = normalizeHeader(expected);
              return normalizedExpected.includes(header) || header.includes(normalizedExpected);
            })
          ).length;

          // Check if headers are in first column (transposed format)
          const firstColumnHeaders = jsonData.map(row => normalizeHeader(row[0] || ''));
          const firstColumnMatches = firstColumnHeaders.filter(header => 
            header && expectedHeaders.some(expected => {
              const normalizedExpected = normalizeHeader(expected);
              return normalizedExpected.includes(header) || header.includes(normalizedExpected);
            })
          ).length;

          // More lenient detection - only need at least 1 matching header
          if (firstColumnMatches > firstRowMatches && firstColumnMatches >= 1) {
            // Transposed format - headers in first column
            isTransposed = true;
            headers = jsonData.map(row => row[0] || '');
            
            // Transform data: each column (except first) becomes a row
            rows = [];
            const numColumns = Math.max(...jsonData.map(row => row.length), 1);
            
            for (let colIndex = 1; colIndex < numColumns; colIndex++) {
              const row = [];
              for (let rowIndex = 0; rowIndex < jsonData.length; rowIndex++) {
                row.push(jsonData[rowIndex][colIndex] || '');
              }
              // Add all rows, even if they seem empty - we'll handle defaults
              rows.push(row);
            }
            
            console.log(`Sheet ${sheetName}: Detected transposed format with ${firstColumnMatches} matching headers`);
          } else if (firstRowMatches >= 1 || jsonData.length > 0) {
            // Normal format - headers in first row, or no clear headers but has data
            if (firstRowMatches >= 1) {
              headers = jsonData[0];
              rows = jsonData.slice(1);
              console.log(`Sheet ${sheetName}: Detected normal format with ${firstRowMatches} matching headers`);
            } else {
              // No clear headers detected, treat first row as data
              headers = [];
              rows = jsonData;
              console.log(`Sheet ${sheetName}: No clear headers detected, processing all rows as data`);
            }
          } else {
            console.log(`Sheet ${sheetName}: No data found, skipping`);
            continue;
          }

          if (rows.length === 0) {
            console.log(`Sheet ${sheetName}: No data rows found`);
            continue;
          }

          let successCount = 0;
          let errorCount = 0;
          let skippedCount = 0;

          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            
            // Skip completely empty rows
            if (row.every(cell => !cell || cell.toString().trim() === '')) {
              skippedCount++;
              continue;
            }

            const mappedData = mapRowToSchemaVeryLenient(row, headers);
            
            // Always add default values for required fields if missing
            if (!mappedData.state) mappedData.state = "None";
            if (!mappedData.city) mappedData.city = "None";
            if (!mappedData.builder) mappedData.builder = "None";
            if (!mappedData.project) mappedData.project = "None";

            try {
              await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/addProject?userId=${userId}`,
                mappedData,
                {
                  headers: {
                    "auth-token": userToken,
                  }
                }
              );
              successCount++;
            } catch (error) {
              errorCount++;
              console.error(`Error adding row ${rowIndex + 1} from sheet ${sheetName}:`, error);
            }
          }

          totalSuccessCount += successCount;
          totalErrorCount += errorCount;
          totalSkippedCount += skippedCount;
          processedSheets++;

          console.log(`Sheet ${sheetName} processed: ${successCount} success, ${errorCount} errors, ${skippedCount} skipped`);
        }

        // Dismiss processing toast
        toast.dismiss(processingToastId);

        // Provide detailed feedback for all sheets
        if (totalSuccessCount > 0) {
          const message = `Successfully added ${totalSuccessCount} projects from ${processedSheets} sheet(s)`;
          toast.success(message);
          setRefetchNotification();
          fetchAllProjectsDataMaster(userId, userToken);
        }
        
        if (totalErrorCount > 0) {
          toast.warning(`${totalErrorCount} projects failed to upload due to server errors`);
        }

        if (totalSkippedCount > 0) {
          toast.info(`${totalSkippedCount} rows were skipped (empty rows)`);
        }

        if (totalSuccessCount === 0 && totalErrorCount === 0 && totalSkippedCount === 0) {
          toast.info("No valid data found to process in any sheet");
        }

        if (processedSheets === 0) {
          toast.warning("No sheets with data found in the Excel file");
        }

      } catch (processingError) {
        // Dismiss any active toasts
        toast.dismiss();
        console.error("Error processing Excel data:", processingError);
        setUploadError("Error processing Excel data: " + processingError.message);
        toast.error("Error processing Excel data");
      }
    };

    reader.onerror = () => {
      // Dismiss uploading toast on file read error
      toast.dismiss(uploadingToastId);
      toast.error("Error reading file");
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    // Dismiss any active toasts
    toast.dismiss();
    console.error("Error processing file:", error);
    setUploadError("Error processing file: " + error.message);
    toast.error("Error processing file");
  } finally {
    setIsUploading(false);
    event.target.value = null; // Reset file input
  }
};

// Updated mapping function - very lenient field matching with inclusion-based matching
const mapRowToSchemaVeryLenient = (row, headers) => {
  const mappedData = {};
  
  const normalizeHeader = (header) => {
    if (!header) return '';
    return header.toString().toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Flexible field mapping with multiple possible matches using inclusion
  const fieldMappings = {
    // Basic required fields
    'state': ['state', 'statename', 'st'],
    'city': ['city', 'cityname', 'town'],
    'builder': ['builder', 'buildername', 'developer', 'dev'],
    'project': ['project', 'projectname', 'proj'],
    
    // Property details with flexible matching
    'propertyId': ['propertyid', 'propid', 'property', 'pid', 'id'],
    'listingId': ['listingid', 'listing', 'lid', 'list'],
    'coordinates': ['coordinates', 'coord', 'location', 'latlng', 'lat', 'lng'],
    'houseNumber': ['housenumber', 'houseno', 'house', 'unitno', 'no'],
    'floorNumber': ['floornumber', 'floor', 'floorno'],
    'tower': ['tower', 'block', 'building', 'bldg'],
    'unit': ['unit', 'apartment', 'flat', 'apt'],
    'size': ['size', 'area', 'sqft', 'squarefeet', 'sq'],
    'overview': ['overview', 'description', 'desc', 'details'],
    'address': ['address', 'fulladdress', 'location', 'addr'],
    'sector': ['sector', 'area', 'locality', 'zone'],
    'pincode': ['pincode', 'pin', 'zipcode', 'postalcode', 'zip'],
    'status': ['status', 'projectstatus', 'state'],
    'type': ['type', 'propertytype', 'proptype'],
    'availableFor': ['availablefor', 'available', 'purpose', 'for'],
    'category': ['category', 'cat', 'categ'],
    'minimumPrice': ['minimumprice', 'minprice', 'startingprice', 'min', 'start'],
    'maximumPrice': ['maximumprice', 'maxprice', 'endingprice', 'max', 'end'],
    'bhk': ['bhk', 'bedroom', 'bedrooms', 'bed'],
    'numberOfFloors': ['numberoffloors', 'floors', 'totalfloors', 'flr'],
    'numberOfBedrooms': ['numberofbedrooms', 'bedrooms', 'beds', 'bed'],
    'numberOfBathrooms': ['numberofbathrooms', 'bathrooms', 'baths', 'bath'],
    'numberOfWashrooms': ['numberofwashrooms', 'washrooms', 'wash'],
    'numberOfParkings': ['numberofparkings', 'parkings', 'parking', 'park'],
    'isTitleDeedVerified': ['istitledeedverified', 'titleverified', 'verified', 'title'],
    
    // Array fields
    'appartmentType': ['appartmenttype', 'apartmenttype', 'propertysubtype', 'apptype'],
    'appartmentSubType': ['appartmentsubtype', 'apartmentsubtype', 'subtype'],
    'features': ['features', 'feature', 'feat'],
    'amenities': ['amenities', 'amenity', 'amen'],
    'commercialHubs': ['commercialhubs', 'commercial', 'businesshubs', 'business'],
    'hospitals': ['hospitals', 'hospital', 'medical', 'health'],
    'hotels': ['hotels', 'hotel', 'hospitality'],
    'shoppingCentres': ['shoppingcentres', 'shoppingcenters', 'malls', 'shopping', 'mall'],
    'transportationHubs': ['transportationhubs', 'transport', 'metro', 'station', 'transit'],
    'educationalInstitutions': ['educationalinstitutions', 'education', 'schools', 'colleges', 'school', 'college'],
    
    // Media fields
    'images': ['images', 'image', 'photos', 'pictures', 'pic', 'img'],
    'videos': ['videos', 'video', 'vid'],
    'floorPlan': ['floorplan', 'floorplans', 'plan', 'layout'],
    
    // Settings
    'enable': ['enable', 'enabled', 'active', 'status', 'show']
  };

  // If no headers provided, try to match based on position or treat as generic data
  if (!headers || headers.length === 0) {
    // Fallback: map first few columns to basic fields
    const defaultMapping = ['state', 'city', 'builder', 'project', 'propertyId', 'type', 'bhk', 'minimumPrice'];
    row.forEach((value, index) => {
      if (index < defaultMapping.length && value && value.toString().trim()) {
        mappedData[defaultMapping[index]] = value.toString().trim();
      }
    });
    return mappedData;
  }

  headers.forEach((header, index) => {
    if (row[index] === undefined || row[index] === '') return;
    
    const normalizedHeader = normalizeHeader(header);
    const value = row[index].toString().trim();
    
    if (!normalizedHeader || !value) return;

    // Find matching field using inclusion-based matching
    let matchedField = null;
    let bestMatchScore = 0;
    
    for (const [schemaField, possibleHeaders] of Object.entries(fieldMappings)) {
      for (const possible of possibleHeaders) {
        const normalizedPossible = normalizeHeader(possible);
        let score = 0;
        
        // Perfect match
        if (normalizedPossible === normalizedHeader) {
          score = 100;
        }
        // Header includes possible or vice versa
        else if (normalizedHeader.includes(normalizedPossible)) {
          score = 80;
        }
        else if (normalizedPossible.includes(normalizedHeader)) {
          score = 70;
        }
        // Partial overlap
        else if (normalizedHeader.length > 2 && normalizedPossible.length > 2) {
          const overlap = [...normalizedHeader].filter(char => normalizedPossible.includes(char)).length;
          if (overlap > Math.min(normalizedHeader.length, normalizedPossible.length) * 0.6) {
            score = 50;
          }
        }
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          matchedField = schemaField;
        }
      }
    }
    
    // Also try direct partial matching if no field mapping worked
    if (!matchedField || bestMatchScore < 50) {
      for (const [schemaField] of Object.entries(fieldMappings)) {
        const normalizedSchema = normalizeHeader(schemaField);
        if (normalizedHeader.includes(normalizedSchema) || normalizedSchema.includes(normalizedHeader)) {
          if (!matchedField) {
            matchedField = schemaField;
            break;
          }
        }
      }
    }
    
    if (!matchedField) {
      console.log(`Could not match field: ${header} (normalized: ${normalizedHeader})`);
      return;
    }
    
    try {
      // Apply appropriate processing based on field type
      if (matchedField === 'coordinates') {
        mappedData[matchedField] = processCoordinatesField(value);
      } else if (['images', 'videos', 'floorPlan'].includes(matchedField)) {
        mappedData[matchedField] = processMediaField(value);
      } else if ([
        'appartmentType', 'appartmentSubType', 'features', 'amenities', 
        'commercialHubs', 'hospitals', 'hotels', 'shoppingCentres', 
        'transportationHubs', 'educationalInstitutions'
      ].includes(matchedField)) {
        mappedData[matchedField] = processArrayField(value);
      } else if (['isTitleDeedVerified', 'enable'].includes(matchedField)) {
        if (matchedField === 'isTitleDeedVerified') {
          mappedData[matchedField] = ['yes', 'true', '1', 'verified'].includes(value.toLowerCase()) ? 'yes' : 'no';
        } else {
          mappedData[matchedField] = ['yes', 'true', '1', 'active', 'enabled'].includes(value.toLowerCase()) ? 'true' : 'false';
        }
      } else {
        // Direct mapping for simple fields
        mappedData[matchedField] = value;
      }
      
      console.log(`Mapped ${header} -> ${matchedField}: ${value}`);
    } catch (error) {
      console.error(`Error processing field ${matchedField}:`, error);
      // Skip this field if processing fails
    }
  });
  
  return mappedData;
};

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
          return <TbCircleDotFilled onClick={()=>{
            handleMarkUnread(params.row._id);
          }} className="text-gray-400 cursor-pointer" />;
        }
      },
    },

    { field: "_id", headerName: "ID",  width: 100 },
    {
      field: "propertyId",
      headerName: "Property Id",
      width: 100,
      cellClassName: "name-column--cell",
    },
    {
      field: "state",
      headerName: "State",
      width: 180,
    },
    {
      field: "city",
      headerName: "City",
      width: 180,
    },
    {
      field: "pincode",
      headerName: "Pincode",
      width: 180,
    },
    
    {
      field: "builder",
      headerName: "Builder",
      width: 180,
    },
    {
      field: "project",
      headerName: "Project",
      width: 180,
    },
    {
      field: "type",
      headerName: "Type",
      width: 180,
    },
    {
      field: "category",
      headerName: "Category",
      width: 180,
    },
    {
      field: "bhk",
      headerName: "Bhk",
      width: 180,
    }, 
    {
      field: "status",
      headerName: "Status",
      width: 150,
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
    },
    {
      field: "minimumPrice",
      headerName: "Min Price",
      width: 160,
    },
    {
      field: "listingId",
      headerName: "From Listings",
      valueGetter: (params) => {
        if(params.value !== "none"){
          return `Yes (${params.value})`;
        }else{
          return "No"
        }

      },
      width: 180,
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
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton 
            onClick={() => {
              handleShowDetails(params.row);

              if (params.row.isViewed !== "yes") {
                toggleProjectDataMasterViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newProjectsDataMasters");
                }
              }
            }}
            // color="primary"
            className="text-grey-400"
          >
            <VisibilityIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              handleEdit(params.row);

              if (params.row.isViewed !== "yes") {
                toggleProjectDataMasterViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newProjectsDataMasters");
                }}

            }}
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => handleDelete(params.row._id,params.row.isViewed)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

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

  const fetchAllProjectsDataMaster = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/fetchAllProjects?userId=${userId}`,
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
      });
  };

  const deleteProjectsMasterById = async (id, myIsViewed) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/deleteProject/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Project deleted!");
          if(myIsViewed === "no"){
            decreaseCounter(userId, userToken, "newProjectsDataMasters");
          }
          setDeleteId();
          fetchAllProjectsDataMaster(userId, userToken);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  // useeffecttt
  useEffect(() => {
    try {
      // getting userId and userToken
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        fetchAllProjectsDataMaster(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    setMode("display");
    setEditData();
    fetchAllProjectsDataMaster(userId, userToken);
    setRefetchNotification();
  };

  // Click handler for the edit button
  const handleEdit = (data) => {
    // fetchProperty(id);
    setEditData(data);
    setMode("edit");
  };

  // to show the details of property
  const handleShowDetails = (data) => {
    setEditData(data);
    setMode("showDetails");
  };

  const setModeToDisplay = () => {
    setMode("display");
    setEditData();
    setRefetchNotification();
    fetchAllProjectsDataMaster(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id,isViewed) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteIsViewed(isViewed);
  };

  const handleMarkUnread = (id) => {
    setShowUnreadModal(true);
    setUnreadId(id);
  };

  const toggleProjectDataMasterViewed = async (id, to) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/${
          to === "yes"
            ? "setProjectsMasterViewed"
            : to === "red"
            ? "setProjectsMasterViewedRed"
            : "setProjectsMasterNotViewed"
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
          fetchAllProjectsDataMaster(userId, userToken);
          setRefetchNotification();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error.");
      });
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Projects Data Master"
          subtitle={
            mode === "add"
              ? "Add Projects Data Master"
              : mode === "edit"
              ? "Edit Projects Data Master"
              : mode === "showDetails"
              ? "See property details"
              : "Manage Projects Data Master here"
          }
        />

        <Box display="flex" gap={2}>
          {mode === "display" && (
            <>
              <div className="flex items-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-upload"
                  disabled={isUploading}
                />
                <label 
                  htmlFor="excel-upload" 
                  className={`border-2 border-green-600 rounded-lg px-3 py-2 text-green-400 cursor-pointer hover:bg-green-600 hover:text-green-200 flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <UploadFileIcon />
                  {isUploading ? 'Uploading...' : 'Upload Excel'}
                </label>
              </div>
              
              <div 
                className="border-2 border-purple-600 rounded-lg px-3 py-2 text-purple-400 cursor-pointer hover:bg-purple-600 hover:text-purple-200 flex items-center gap-2"
                onClick={downloadDummyExcel}
              >
                <DownloadIcon />
                Download Template
              </div>
            </>
          )}
          
          {mode === "display" ? (
            <div
              className="border-2 mr-12 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
              onClick={handleAddMore}
            >
              Add more
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

      

      {uploadError && (
        <div className="text-red-500 mt-2">{uploadError}</div>
      )}

      {/* Render form or DataGrid based on mode */}
      {1 === 1 && (
        <>
          {mode === "add" ? (
            <ProjectsDataMasterForm
              setModeToDisplay={setModeToDisplay}
              userId={userId}
              userToken={userToken}
            />
          ) : mode === "edit" ? (
            editData && (
              <>
                <ProjectsDataMasterForm
                  userId={userId}
                  userToken={userToken}
                  editData={editData}
                  setModeToDisplay={setModeToDisplay}
                />
              </>
            )
          ) : mode === "showDetails" ? (
            editData && (
              <>
                <ProjectsDataMasterForm
                  displayMode={true}
                  editData={editData}
                />
              </>
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
                disableExtendRowFullWidth={true}
                scrollbarSize={10}
              />
            </Box>
          )}
        </>
      )}
      {showDeleteModal === true && deleteId && (
        <DeleteModal
          handleDelete={() => {
            deleteProjectsMasterById(deleteId, deleteIsViewed);
          }}
          closeModal={() => {
            setShowDeleteModal(false);
          }}
        />
      )}

      {showUnreadModal === true && unreadId && (
        <MarkUnreadModal
          handleMarkUnread={() => {
            toggleProjectDataMasterViewed(unreadId, "red");
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
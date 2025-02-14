import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Paper,
  Grid,
  Chip,
  Box,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { jwtDecode } from 'jwt-decode';
import AccordionCustomIcon from '../ui/Accordion';

const ViewProperties = ({ data }) => {
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  const [listingsData, setListingsData] = useState([]);

  useEffect(() => {
    try {
      const token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);

        fetchAllListings(decoded.userId, token);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  // useEffect(() => {
  //   if (userId && userToken) {
      
  //   }
  // }, [userId, userToken]);

  const fetchAllListings = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/listings/fetchalllistings?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setListingsData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'under-construction':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getListingDetails = (propertyId) => {
    return listingsData.find(listing => listing.propertyId === propertyId);
  };

  const renderListingDetails = (listing) => {
    if (!listing) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <h3 className='text-xl font-semibold my-3 mb-0'>
                    Listing Details
                  </h3>
        <Grid container spacing={3}>
        
          {listing.sellDetails && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium' }}>
                  For Sale
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">Unit Number</Typography>
                  <Typography>{listing.sellDetails.unitNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Expected Price</Typography>
                  <Typography>{listing.sellDetails.expectedPrice}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Property Type</Typography>
                  <Typography sx={{ textTransform: 'capitalize' }}>{listing.sellDetails.type}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Details</Typography>
                  <Typography>
                    {listing.sellDetails.numberOfBedrooms} BHK | 
                    {listing.sellDetails.numberOfWashrooms} Bath | 
                    {listing.sellDetails.numberOfParkings} Parking
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          
          {listing.rentDetails && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium' }}>
                  For Rent
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">Available From</Typography>
                  <Typography>{listing.rentDetails.availableFrom}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Expected Rent</Typography>
                  <Typography>{listing.rentDetails.expectedRent}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Security Deposit</Typography>
                  <Typography>{listing.rentDetails.securityDeposit}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Furnished Status</Typography>
                  <Typography sx={{ textTransform: 'capitalize' }}>{listing.rentDetails.furnishedStatus}</Typography>
                </Box>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                icon={<HomeIcon />}
                label={listing.isPublished === "yes" ? "Published" : "Not Published"}
                color={listing.isPublished === "yes" ? "success" : "default"}
                size="small"
              />
              <Chip 
                icon={<CurrencyRupeeIcon />}
                label={listing.isActive === "true" ? "Active" : "Inactive"}
                color={listing.isActive === "true" ? "success" : "default"}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 2 }}>
      {data.length > 0 && data.map((property, index) => {
        const listingDetails = getListingDetails(property._id);
        
        return (
          <Accordion 
            key={property._id}
            sx={{
              mb: 2,
              '&:before': {
                display: 'none',
              },
              boxShadow: 1,
              borderRadius: 1,
              '&:first-of-type': {
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              },
              '&:last-of-type': {
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApartmentIcon color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {property.customerName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={property.applicationStatus}
                  color={getStatusColor(property.applicationStatus)}
                  size="small"
                />
                <Chip 
                  label={property.status}
                  color={getStatusColor(property.status)}
                  size="small"
                />
                {listingDetails && (
                  <Chip 
                    label="Listed"
                    color="info"
                    size="small"
                  />
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <LocationOnIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Location
                        </Typography>
                        <Typography>
                          {property.houseNumber}, {property.tower}, {property.city}, {property.state}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Customer Details
                        </Typography>
                        <Typography>{property.customerName}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <PhoneIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography>{property.customerNumber}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Property Details
                      </Typography>
                      <Typography>Size: {property.size} units</Typography>
                      <Typography>Nature: {property.nature}</Typography>
                      <Typography>Classification: {property.classification}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Project Info
                      </Typography>
                      <Typography>Builder: {property.builder}</Typography>
                      <Typography>Project: {property.project}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <CalendarTodayIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Dates
                        </Typography>
                        <Typography>Created: {formatDate(property.createdAt)}</Typography>
                        <Typography>Updated: {formatDate(property.updatedAt)}</Typography>
                      </Box>
                    </Box>
                  </Box> 
                </Grid>

                {listingDetails && (
                  <Grid item xs={12}>
                    {renderListingDetails(listingDetails)}
                  </Grid>
                )}

                <Grid item xs={12}>
                  
                  <AccordionCustomIcon 
                    userId={userId}
                    userToken={userToken}
                    propertyId={property._id}
                    safeData={property}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default ViewProperties;
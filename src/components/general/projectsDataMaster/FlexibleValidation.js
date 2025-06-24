// Enhanced field mapping with flexible matching
const createFlexibleFieldMapper = () => {
    // Define field mappings with multiple possible variations
    const fieldMappings = {
      // Basic Information
      thumbnail: ['thumbnail', 'thumb', 'image', 'main_image', 'cover_image'],
      propertyId: ['propertyId', 'property_id', 'prop_id', 'id', 'property_identifier'],
      listingId: ['listingId', 'listing_id', 'list_id', 'listing_identifier'],
      state: ['state', 'state_name', 'province'],
      city: ['city', 'city_name', 'location'],
      builder: ['builder', 'builder_name', 'developer', 'constructor'],
      project: ['project', 'project_name', 'project_title'],
      
      // Property Details
      overview: ['overview', 'description', 'summary', 'details', 'about'],
      address: ['address', 'full_address', 'location_address', 'street_address'],
      sector: ['sector', 'area', 'zone', 'district'],
      pincode: ['pincode', 'pin_code', 'postal_code', 'zip_code', 'zip'],
      status: ['status', 'project_status', 'construction_status'],
      type: ['type', 'property_type', 'category_type'],
      availableFor: ['availableFor', 'available_for', 'availability', 'purpose'],
      category: ['category', 'project_category', 'type_category'],
      
      // Pricing
      minimumPrice: ['minimumPrice', 'minimum_price', 'min_price', 'price_from', 'starting_price'],
      maximumPrice: ['maximumPrice', 'maximum_price', 'max_price', 'price_to', 'ending_price'],
      bhk: ['bhk', 'bedrooms', 'bedroom_count', 'room_config'],
      
      // Coordinates
      latitude: ['latitude', 'lat', 'geo_lat', 'coordinate_lat'],
      longitude: ['longitude', 'lng', 'lon', 'geo_lng', 'coordinate_lng'],
      
      // Unit Details
      houseNumber: ['houseNumber', 'house_number', 'unit_number', 'flat_number'],
      floorNumber: ['floorNumber', 'floor_number', 'floor', 'level'],
      tower: ['tower', 'tower_name', 'building', 'block'],
      unit: ['unit', 'unit_name', 'apartment_unit'],
      size: ['size', 'area', 'sq_ft', 'square_feet', 'built_up_area'],
      
      // Counts
      numberOfFloors: ['numberOfFloors', 'number_of_floors', 'floors', 'total_floors'],
      numberOfBedrooms: ['numberOfBedrooms', 'number_of_bedrooms', 'bedrooms', 'bedroom_count'],
      numberOfBathrooms: ['numberOfBathrooms', 'number_of_bathrooms', 'bathrooms', 'bathroom_count'],
      numberOfParkings: ['numberOfParkings', 'number_of_parkings', 'parking', 'parking_spaces'],
      
      // Verification
      isTitleDeedVerified: ['isTitleDeedVerified', 'title_deed_verified', 'verified', 'deed_verified'],
      
      // Arrays - these will be handled specially
      appartmentType: ['appartmentType', 'apartment_type', 'unit_type', 'property_subtype'],
      appartmentSubType: ['appartmentSubType', 'apartment_sub_type', 'unit_subtype'],
      features: ['features', 'property_features', 'amenities_features'],
      amenities: ['amenities', 'facilities', 'property_amenities'],
      commercialHubs: ['commercialHubs', 'commercial_hubs', 'business_centers', 'commercial_areas'],
      hospitals: ['hospitals', 'medical_facilities', 'healthcare'],
      hotels: ['hotels', 'hospitality', 'accommodation'],
      shoppingCentres: ['shoppingCentres', 'shopping_centres', 'malls', 'shopping_areas'],
      transportationHubs: ['transportationHubs', 'transportation_hubs', 'transport', 'connectivity'],
      educationalInstitutions: ['educationalInstitutions', 'educational_institutions', 'schools', 'education'],
      
      // File arrays
      images: ['images', 'photos', 'pictures', 'gallery'],
      videos: ['videos', 'video_tour', 'media'],
      floorPlan: ['floorPlan', 'floor_plan', 'layout', 'blueprint'],
      
      // Status fields
      enable: ['enable', 'enabled', 'active', 'status'],
      isViewed: ['isViewed', 'is_viewed', 'viewed', 'view_status']
    };
  
    // Create reverse mapping for quick lookup
    const reverseMapping = {};
    Object.entries(fieldMappings).forEach(([targetField, variations]) => {
      variations.forEach(variation => {
        reverseMapping[variation.toLowerCase()] = targetField;
      });
    });
  
    return { fieldMappings, reverseMapping };
  };
  
  // Flexible field matcher function
  const findMatchingField = (inputField, reverseMapping) => {
    const normalizedInput = inputField.toLowerCase().trim();
    
    // Direct match
    if (reverseMapping[normalizedInput]) {
      return reverseMapping[normalizedInput];
    }
    
    // Fuzzy matching - remove underscores, spaces, and check
    const cleanInput = normalizedInput.replace(/[_\s-]/g, '');
    for (const [key, value] of Object.entries(reverseMapping)) {
      const cleanKey = key.replace(/[_\s-]/g, '');
      if (cleanKey === cleanInput) {
        return value;
      }
    }
    
    // Partial matching - check if input contains or is contained in mapped fields
    for (const [key, value] of Object.entries(reverseMapping)) {
      if (key.includes(normalizedInput) || normalizedInput.includes(key)) {
        if (Math.abs(key.length - normalizedInput.length) <= 3) { // Allow some length difference
          return value;
        }
      }
    }
    
    return null; // No match found
  };
  
  // Enhanced data processing function
  const processTransposedData = (transposedData, existingData = {}) => {
    const { reverseMapping } = createFlexibleFieldMapper();
    const processedData = { ...existingData };
    const skippedFields = [];
    const processedFields = [];
    
    // Arrays that need special handling
    const arrayFields = [
      'appartmentType', 'appartmentSubType', 'features', 'amenities',
      'commercialHubs', 'hospitals', 'hotels', 'shoppingCentres',
      'transportationHubs', 'educationalInstitutions', 'images', 'videos', 'floorPlan'
    ];
    
    Object.entries(transposedData).forEach(([inputField, value]) => {
      const matchedField = findMatchingField(inputField, reverseMapping);
      
      if (!matchedField) {
        skippedFields.push(inputField);
        return;
      }
      
      // Skip if value is empty, null, or undefined
      if (value === null || value === undefined || value === '') {
        skippedFields.push(`${inputField} (empty value)`);
        return;
      }
      
      try {
        // Handle array fields
        if (arrayFields.includes(matchedField)) {
          if (Array.isArray(value)) {
            processedData[matchedField] = value.filter(item => item !== null && item !== undefined && item !== '');
          } else if (typeof value === 'string') {
            // Try to parse comma-separated values or JSON
            let parsedArray = [];
            try {
              parsedArray = JSON.parse(value);
            } catch {
              parsedArray = value.split(',').map(item => item.trim()).filter(item => item);
            }
            processedData[matchedField] = parsedArray;
          } else {
            processedData[matchedField] = [value];
          }
        }
        // Handle coordinate fields specially
        else if (matchedField === 'latitude' || matchedField === 'longitude') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            processedData[matchedField] = numValue.toString();
          } else {
            skippedFields.push(`${inputField} (invalid coordinate)`);
            return;
          }
        }
        // Handle boolean-like fields
        else if (['enable', 'isTitleDeedVerified', 'isViewed'].includes(matchedField)) {
          if (typeof value === 'boolean') {
            processedData[matchedField] = value.toString();
          } else if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            if (['true', 'yes', '1', 'enabled', 'active'].includes(lowerValue)) {
              processedData[matchedField] = 'true';
            } else if (['false', 'no', '0', 'disabled', 'inactive'].includes(lowerValue)) {
              processedData[matchedField] = 'false';
            } else {
              processedData[matchedField] = value;
            }
          } else {
            processedData[matchedField] = value.toString();
          }
        }
        // Handle file objects (thumbnail, images, etc.)
        else if (matchedField === 'thumbnail' && typeof value === 'object' && value.path) {
          processedData[matchedField] = value;
        }
        // Handle regular string fields
        else {
          processedData[matchedField] = typeof value === 'string' ? value : value.toString();
        }
        
        processedFields.push(`${inputField} → ${matchedField}`);
      } catch (error) {
        skippedFields.push(`${inputField} (processing error: ${error.message})`);
      }
    });
    
    return {
      processedData,
      processedFields,
      skippedFields,
      summary: {
        total: Object.keys(transposedData).length,
        processed: processedFields.length,
        skipped: skippedFields.length
      }
    };
  };
  
  // Enhanced initialization function for the component
  const enhancedInitializeEditData = async (data, setAddData, fetchFunctions) => {
    if (!data) return { success: false, message: 'No data provided' };
  
    try {
      console.log('Processing edit data with flexible validation:', data);
      
      // Process the data with flexible validation
      const { processedData, processedFields, skippedFields, summary } = processTransposedData(data);
      
      console.log('Processing Summary:', summary);
      console.log('Processed Fields:', processedFields);
      console.log('Skipped Fields:', skippedFields);
      
      // Set the processed data
      setAddData(processedData);
      
      // Handle dependent data fetching
      if (processedData.state && fetchFunctions) {
        const { fetchAllStates, fetchCitiesByState, fetchBuildersByCity, fetchProjectByBuilder } = fetchFunctions;
        
        const statesData = await fetchAllStates();
        const stateItem = statesData.find(state => state.name === processedData.state);
        
        if (stateItem && processedData.city) {
          await fetchCitiesByState(stateItem.iso2);
          
          if (processedData.builder) {
            await fetchBuildersByCity(processedData.city);
            
            if (processedData.project) {
              await fetchProjectByBuilder(processedData.builder);
            }
          }
        }
      }
      
      return {
        success: true,
        message: `Successfully processed ${summary.processed} fields, skipped ${summary.skipped} fields`,
        details: {
          processedFields,
          skippedFields,
          summary
        }
      };
    } catch (error) {
      console.error('Error in enhanced initialization:', error);
      return {
        success: false,
        message: `Error processing data: ${error.message}`
      };
    }
  };
  
  // Usage example with toast notifications
  const handleFlexibleDataImport = async (importedData, setAddData, fetchFunctions, toast) => {
    const result = await enhancedInitializeEditData(importedData, setAddData, fetchFunctions);
    
    if (result.success) {
      toast.success(result.message);
      
      // Show detailed summary if needed
      if (result.details.skippedFields.length > 0) {
        console.log('Fields that were skipped:', result.details.skippedFields);
        toast.info(`${result.details.summary.skipped} fields were skipped due to no match or invalid data`);
      }
    } else {
      toast.error(result.message);
    }
    
    return result;
  };
  
  // Export the functions for use
  export {
    createFlexibleFieldMapper,
    findMatchingField,
    processTransposedData,
    enhancedInitializeEditData,
    handleFlexibleDataImport
  };
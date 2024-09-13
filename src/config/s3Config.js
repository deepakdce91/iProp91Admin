import { S3Client } from '@aws-sdk/client-s3';

// Creating the S3 client instance using Supabase's storage endpoint
const client = new S3Client({
  forcePathStyle: true, // Required for Supabase S3 compatibility
  region: 'ap-south-1', 
  endpoint: process.env.REACT_APP_SUPABASE_ENDPOINT, 
  credentials: {
    accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID, 
    secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY, 
  },
});

export { client };

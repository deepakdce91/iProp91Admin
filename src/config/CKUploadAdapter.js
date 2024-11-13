import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../config/s3Config";



class MyUploadAdapter {
  constructor(loader, supabaseClient) {
    this.loader = loader;
    this.supabaseClient = supabaseClient;
  }

  // Start the upload process
  async upload() {
    try {
      const file = await this.loader.file;
      const url = await this.uploadToSupabase(file);
      return { default: url };
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  // Handle the actual upload
  async uploadToSupabase(file) {
    const filePath = `uploads/${file.name.replace(/\s+/g,"")}`;

    // Ensure bucket name is defined
    const bucketName = process.env.REACT_APP_LIBRARY_BUCKET;
    try {
      const uploadParams = {
        Bucket: bucketName,
        Key: filePath,
        Body: file, // The file content
        ContentType: file.type, // The MIME type of the file
      };
      const command = await new PutObjectCommand(uploadParams);
      let success = await client.send(command);
      if (success) {
        // Retrieve the public URL
        const {data: publicData } = await this.supabaseClient.storage
          .from(bucketName)
          .getPublicUrl(filePath);

          // console.log(publicData)

        if (!publicData) {
          throw new Error("Failed to retrieve public URL after upload.");
        }

        return publicData.publicUrl;
      }
      return;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  // Aborts the upload process
  abort() {
    // Logic to handle aborts if needed
  }
}

export default MyUploadAdapter;

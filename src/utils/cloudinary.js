import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnClaudinary = async(localpath)=>{
    try {
        if(!localpath)
        {
            return null;
        }
        const response= await cloudinary.uploader.upload(localpath, {resource_type: 'auto'});
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlink(localpath)
        return response;
    } catch (err) {
        console.log("Error uploading file: ", err)
        fs.unlink(localpath)
        return;
    }
}
const deleteOnCloudinary= async(publicId, resourceType)=>
{
    try {
        const result = await cloudinary.api.delete_resources(publicId, { resource_type: resourceType });
        console.log('Deletion result:', result)
    } catch (error) {
        console.error('Error deleting old Avatar:', error);
    }
}
export {uploadOnClaudinary, deleteOnCloudinary}
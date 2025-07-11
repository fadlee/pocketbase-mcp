import type PocketBase from 'pocketbase';
import type { ToolHandler, UploadFileArgs, DownloadFileArgs, UploadFileFromUrlArgs } from '../../types/index.js';
import { createTextResponse, createJsonResponse } from '../../utils/response.js';
import { handlePocketBaseError } from '../../utils/errors.js';

export function createUploadFileHandler(pb: PocketBase): ToolHandler {
  return async (args: UploadFileArgs) => {
    try {
      const { collection, recordId, fileField, fileContent, fileName } = args;
      
      // Create a Blob from the file content string
      const blob = new Blob([fileContent]);
      
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append(fileField, blob, fileName);
      
      // Update the record with the file
      const record = await pb.collection(collection).update(recordId, formData);
      
      return createJsonResponse({
        success: true,
        message: `File '${fileName}' uploaded successfully to record ${recordId}`,
        record
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("upload file", error);
    }
  };
}

export function createDownloadFileHandler(pb: PocketBase): ToolHandler {
  return async (args: DownloadFileArgs) => {
    try {
      const { collection, recordId, fileField } = args;
      
      // Fetch the record to get the filename associated with the file field
      const record = await pb.collection(collection).getOne(recordId);
      
      // Ensure the file field exists and has a value
      const fileName = record[fileField];
      if (!fileName || typeof fileName !== 'string') {
        throw new Error(`File field '${fileField}' not found or empty on record ${recordId}`);
      }
      
      // Get the file URL using the filename from the record
      const fileUrl = pb.files.getUrl(record, fileName);
      
      return createJsonResponse({
        success: true,
        fileName,
        fileUrl,
        message: `Download URL for ${fileName}: ${fileUrl}`
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("get download URL", error);
    }
  };
}

export function createUploadFileFromUrlHandler(pb: PocketBase): ToolHandler {
  return async (args: UploadFileFromUrlArgs) => {
    try {
      const { collection, recordId, fileField, url, fileName } = args;
      
      // Download the file from the URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download file from URL: ${response.status} ${response.statusText}`);
      }
      
      // Get the file content as ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Determine the filename
      let finalFileName = fileName;
      if (!finalFileName) {
        // Extract filename from URL
        const urlPath = new URL(url).pathname;
        finalFileName = urlPath.split('/').pop() || 'downloaded-file';
        
        // If no extension, try to get from Content-Type header
        if (!finalFileName.includes('.')) {
          const contentType = response.headers.get('content-type');
          if (contentType) {
            const extension = getExtensionFromMimeType(contentType);
            if (extension) {
              finalFileName += `.${extension}`;
            }
          }
        }
      }
      
      // Create a Blob from the downloaded content
      const blob = new Blob([arrayBuffer]);
      
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append(fileField, blob, finalFileName);
      
      // Update the record with the file
      const record = await pb.collection(collection).update(recordId, formData);
      
      return createJsonResponse({
        success: true,
        message: `File '${finalFileName}' uploaded successfully from URL to record ${recordId}`,
        fileName: finalFileName,
        sourceUrl: url,
        record
      });
    } catch (error: unknown) {
      throw handlePocketBaseError("upload file from URL", error);
    }
  };
}

// Helper function to get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string | null {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/json': 'json',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/x-zip-compressed': 'zip',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav'
  };
  
  return mimeToExt[mimeType.toLowerCase()] || null;
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '../axios';

// Query keys
export const contentKeys = {
    all: ['contents'],
    lists: () => [...contentKeys.all, 'list'],
    list: (filters) => [...contentKeys.lists(), { ...filters }],
    details: () => [...contentKeys.all, 'detail'],
    detail: (id) => [...contentKeys.details(), id],
    totalSize: () => [...contentKeys.all, 'total-size'],
    sizeByType: () => [...contentKeys.all, 'size-by-type'],
};

/**
 * Upload content to the server
 * @route POST /api/content
 * @param {Object} formData - The content data to be uploaded
 * @param {string} formData.name - The name of the content
 * @param {('image'|'video'|'text')} formData.type - The type of the content
 * @param {File} formData.file - The file to be uploaded
 * @param {Object} [formData.metadata] - Additional metadata about the content
 * @param {string} [formData.metadata.size] - The size of the content
 * @param {string} [formData.metadata.format] - The format of the content
 * @param {string} [formData.metadata.resolution] - The resolution of the content (if applicable)
 * @returns {Promise<Object>} Response object
 * @returns {string} response.status - Status of the request ("success" or "error")
 * @returns {Object} response.data - The data object containing the uploaded content details
 * @returns {Object} response.data.content - The uploaded content object
 * @returns {string} response.data.content._id - Unique identifier of the content
 * @returns {string} response.data.content.name - Name of the content
 * @returns {('image'|'video'|'text')} response.data.content.type - Type of content
 * @returns {string} response.data.content.url - URL to access the content
 * @returns {string} response.data.content.duration - Duration of the content
 * @returns {Object} response.data.content.metadata - Additional metadata
 * @returns {string} response.data.content.metadata.size - Size of the content
 * @returns {string} response.data.content.metadata.format - Format of the content
 * @returns {string} response.data.content.metadata.resolution - Resolution if applicable
 * @returns {Object} response.data.content.createdBy - User who created the content
 * @returns {string} response.data.content.createdBy.username - Username of creator
 * @returns {string} response.data.content.createdBy.email - Email of creator
 *
 * @example
 * const formData = new FormData();
 * formData.append('name', 'My Image');
 * formData.append('type', 'image');
 * formData.append('file', fileInputElement.files[0]);
 * formData.append('metadata', JSON.stringify({ size: '2MB', format: 'jpg' }));
 *
 * const response = await uploadContent(formData);
 * // Response structure:
 * // {
 * //     "status": "success",
 * //     "data": {
 * //         "content": {
 * //             "_id": "...",
 * //             "name": "...",
 * //             "type": "image|video|text",
 * //             "url": "...",
 * //             "duration": "...",
 * //             "metadata": {
 * //                 "size": "...",
 * //                 "format": "...",
 * //                 "resolution": "..."
 * //             },
 * //             "createdBy": {
 * //                 "username": "...",
 * //                 "email": "..."
 * //             }
 * //         }
 * //     }
 * // }
 */
export const uploadContent = async (formData) => {
    const response = await instance.post('/content', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Fetch list of all contents
 * @route GET /api/content
 * @returns {Promise<Object>} Response object
 * @returns {string} response.status - Status of the request ("success" or "error")
 * @returns {Object} response.data - The data object containing content list
 * @returns {Array<Object>} response.data.contents - Array of content objects
 * @returns {Object} content - Individual content item
 * @returns {string} content._id - Unique identifier of the content
 * @returns {string} content.name - Name of the content
 * @returns {('image'|'video'|'text')} content.type - Type of content
 * @returns {string} content.url - URL to access the content
 * @returns {string} content.duration - Duration of the content
 * @returns {Object} content.metadata - Additional metadata
 * @returns {string} content.metadata.size - Size of the content
 * @returns {string} content.metadata.format - Format of the content
 * @returns {string} content.metadata.resolution - Resolution if applicable
 * @returns {Object} content.createdBy - User who created the content
 * @returns {string} content.createdBy.username - Username of creator
 * @returns {string} content.createdBy.email - Email of creator
 *
 * @example
 * const response = await getContentList();
 * // Response structure:
 * // {
 * //     "status": "success",
 * //     "data": {
 * //         "contents": [
 * //             {
 * //                 "_id": "...",
 * //                 "name": "...",
 * //                 "type": "image|video|text",
 * //                 "url": "...",
 * //                 "duration": "...",
 * //                 "metadata": {
 * //                     "size": "...",
 * //                     "format": "...",
 * //                     "resolution": "..."
 * //                 },
 * //                 "createdBy": {
 * //                     "username": "...",
 * //                     "email": "..."
 * //                 }
 * //             }
 * //         ]
 * //     }
 * // }
 */
export const getContentList = async () => {
    const response = await instance.get('/content');
    return response.data;
};

// GET list contents
export const useContents = (filters = {}) => {
    // Remove empty filters
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''));

    return useQuery({
        queryKey: contentKeys.list(cleanFilters),
        queryFn: async () => {
            const response = await instance.get('/content', {
                params: cleanFilters,
            });
            return response.data;
        },
    });
};

// Upload content
export const useUploadContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            const response = await instance.post('/content', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
        },
    });
};

// Upload content
export const useUploadContentText = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await instance.post('/content/text', {
                type: 'text',
                ...data,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
        },
    });
};

/**
 * Delete content from the server
 * @route DELETE /api/content/:id
 * @param {string} contentId - The ID of the content to delete
 * @returns {Promise<Object>} Response object
 * @returns {string} response.status - Status of the request ("success" or "error")
 * @returns {string} response.message - Success or error message
 *
 * @example
 * const deleteContentMutation = useDeleteContent();
 *
 * // Delete a single content
 * try {
 *   await deleteContentMutation.mutateAsync(contentId);
 *   // Content deleted successfully
 * } catch (error) {
 *   // Handle error
 * }
 *
 * // Delete multiple contents
 * try {
 *   await Promise.all(contentIds.map(id => deleteContentMutation.mutateAsync(id)));
 *   // All contents deleted successfully
 * } catch (error) {
 *   // Handle error
 * }
 *
 * // Response structure:
 * // Success:
 * // {
 * //     "status": "success",
 * //     "message": "Content deleted successfully"
 * // }
 * // Error:
 * // {
 * //     "status": "error",
 * //     "message": "Content not found"
 * // }
 */
export const useDeleteContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contentId) => {
            const response = await instance.delete(`/content/${contentId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate contents query to refetch
            queryClient.invalidateQueries(contentKeys.lists());
        },
    });
};

/**
 * Get total size of all content in the system
 * @route GET /api/content/total-size
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Status of the request (true/false)
 * @returns {Object} response.data - The data object containing size information
 * @returns {number} response.data.totalSize - Total size in bytes
 * @returns {number} response.data.totalSizeMB - Total size in megabytes
 *
 * @example
 * const { data } = useTotalContentSize();
 *
 * // Response structure:
 * // {
 * //     "success": true,
 * //     "data": {
 * //         "totalSize": 298986,    // size in bytes
 * //         "totalSizeMB": 0.29     // size in MB
 * //     }
 * // }
 */
export const useTotalContentSize = () => {
    return useQuery({
        queryKey: contentKeys.totalSize(),
        queryFn: async () => {
            const response = await instance.get('/content/total-size');
            return response.data;
        },
    });
};

/**
 * Get content size breakdown by type
 * @route GET /api/content/size-by-type
 * @returns {Promise<Object>} Response object
 * @returns {string} response.status - Status of the request ("success")
 * @returns {Array<Object>} response.data - Array of size information by content type
 * @returns {string} response.data[].type - Content type (image/video/text)
 * @returns {number} response.data[].totalSize - Total size in bytes
 * @returns {string} response.data[].sizeInMB - Total size in MB formatted string
 * @returns {number} response.data[].count - Number of items of this type
 *
 * @example
 * const { data } = useContentSizeByType();
 *
 * // Response structure:
 * // {
 * //     "status": "success",
 * //     "data": [
 * //         {
 * //             "type": "image",
 * //             "totalSize": 298986,
 * //             "sizeInMB": "0.29",
 * //             "count": 1
 * //         },
 * //         {
 * //             "type": "video",
 * //             "totalSize": 0,
 * //             "sizeInMB": "0.00",
 * //             "count": 0
 * //         },
 * //         {
 * //             "type": "text",
 * //             "totalSize": 0,
 * //             "sizeInMB": "0.00",
 * //             "count": 0
 * //         }
 * //     ]
 * // }
 */
export const useContentSizeByType = () => {
    return useQuery({
        queryKey: contentKeys.sizeByType(),
        queryFn: async () => {
            const response = await instance.get('/content/size-by-type');
            return response.data;
        },
    });
};

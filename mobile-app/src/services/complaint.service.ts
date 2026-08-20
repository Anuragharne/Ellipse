import { api } from './api';

export interface CreateComplaintParams {
  photoUri: string;
  latitude: number;
  longitude: number;
  compassHeading?: number;
}

export class ComplaintService {
  static async submitComplaint(params: CreateComplaintParams) {
    const formData = new FormData();
    
    // Append photo
    const filename = params.photoUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    
    formData.append('photo', {
      uri: params.photoUri,
      name: filename,
      type,
    } as any);

    // Append metadata
    formData.append('latitude', params.latitude.toString());
    formData.append('longitude', params.longitude.toString());
    
    if (params.compassHeading !== undefined) {
      formData.append('compassHeading', params.compassHeading.toString());
    }

    const response = await api.post('/citizen/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}

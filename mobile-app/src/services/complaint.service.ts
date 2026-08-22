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

  static async getNearbyComplaints() {
    const response = await api.get('/citizen/complaints/nearby');
    return response.data;
  }

  static async getMyComplaints() {
    const response = await api.get('/citizen/complaints');
    return response.data;
  }

  static async getComplaintById(id: string) {
    const response = await api.get(`/citizen/complaints/${id}`);
    return response.data;
  }

  // --- Crew Endpoints ---

  static async getDispatchedComplaints() {
    const response = await api.get('/crew/complaints');
    return response.data;
  }

  static async getCrewComplaintById(id: string) {
    const response = await api.get(`/crew/complaints/${id}`);
    return response.data;
  }

  static async resolveComplaint(id: string, photoUri: string, ppeConfirmed: boolean) {
    const formData = new FormData();
    
    const filename = photoUri.split('/').pop() || 'after_photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    
    formData.append('afterPhoto', {
      uri: photoUri,
      name: filename,
      type,
    } as any);

    formData.append('ppeConfirmed', ppeConfirmed.toString());

    const response = await api.patch(`/crew/complaints/${id}/resolve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}

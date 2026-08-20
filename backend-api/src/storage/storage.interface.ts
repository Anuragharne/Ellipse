export interface IStorageService {
  uploadPhoto(file: Buffer, filename: string): Promise<string>; // Returns public URL
  getSignedUrl(path: string): Promise<string>;
}

import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { IStorageService } from './storage.interface';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService implements IStorageService, OnModuleInit {
  private supabase: SupabaseClient;
  private readonly BUCKET_NAME = 'complaint-photos';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Key must be defined in .env');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onModuleInit() {
    const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
    if (!listError) {
      const exists = buckets.find(b => b.name === this.BUCKET_NAME);
      if (!exists) {
        await this.supabase.storage.createBucket(this.BUCKET_NAME, { public: true });
      }
    }
  }

  async uploadPhoto(file: Buffer, filename: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filename, file, {
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new InternalServerErrorException('Failed to upload photo');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(path, 3600); // 1 hour

    if (error) {
      console.error('Supabase signed URL error:', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }

    return data.signedUrl;
  }
}

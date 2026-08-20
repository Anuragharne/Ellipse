import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    @InjectQueue('ai_processing') private aiQueue: Queue,
  ) {}

  async submit(userId: string, dto: CreateComplaintDto, file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('Photo is required');
    }

    // 1. Upload photo to Supabase Storage
    const filename = `${userId}/${uuidv4()}.jpg`;
    const photoUrl = await this.storage.uploadPhoto(file.buffer, filename);

    // 2. Save complaint in DB
    // We use a raw SQL insert if we want to set the PostGIS Geography column directly.
    // Or we create the record first, then update the geography column.
    
    const complaint = await this.prisma.complaint.create({
      data: {
        citizenId: userId,
        rawImageUrl: photoUrl,
        latitude: dto.latitude,
        longitude: dto.longitude,
        compassHeading: dto.compassHeading,
      },
    });

    // Update the PostGIS geography column (Prisma doesn't support writing to it natively during create)
    await this.prisma.$executeRawUnsafe(
      `UPDATE complaints SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
      dto.longitude, dto.latitude, complaint.id
    );

    // 3. Enqueue to BullMQ for AI processing
    await this.aiQueue.add('process_waste_image', {
      complaint_id: complaint.id,
      image_url: photoUrl,
    });

    return {
      message: 'Complaint submitted successfully',
      complaint,
    };
  }

  async findByUser(userId: string) {
    return this.prisma.complaint.findMany({
      where: { citizenId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        aiAnalysis: true,
      },
    });
  }
}

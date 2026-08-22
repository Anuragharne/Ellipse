import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EventsGateway } from '../internal/events.gateway';

@Injectable()
export class CrewService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private eventsGateway: EventsGateway,
  ) {}

  async getDispatchedComplaints() {
    return this.prisma.complaint.findMany({
      where: {
        status: 'DISPATCHED',
      },
      include: {
        aiAnalysis: true,
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getComplaintById(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: { aiAnalysis: true }
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  async resolveComplaint(id: string, file: Express.Multer.File, ppeConfirmed: boolean) {
    if (!ppeConfirmed) {
      throw new BadRequestException('PPE checklist must be confirmed to resolve a complaint.');
    }
    if (!file) {
      throw new BadRequestException('After photo is required to resolve a complaint.');
    }

    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    if (complaint.status !== 'DISPATCHED') {
      throw new BadRequestException('Only dispatched complaints can be resolved.');
    }

    // Upload 'after' photo
    const afterPhotoUrl = await this.storage.uploadPhoto(file.buffer, `after_${id}_${file.originalname}`);

    // Update Complaint status
    const updatedComplaint = await this.prisma.complaint.update({
      where: { id },
      data: {
        status: 'RESOLVED',
      },
      include: { aiAnalysis: true }
    });

    // Create or update DispatchOrder (since we haven't strictly created it on dispatch for MVP)
    await this.prisma.dispatchOrder.upsert({
      where: { complaintId: id },
      create: {
        complaintId: id,
        vehicle: 'MINI_TRUCK', // fallback default
        afterPhotoUrl,
        resolvedAt: new Date(),
        ppeRequired: { confirmed: true }
      },
      update: {
        afterPhotoUrl,
        resolvedAt: new Date(),
        ppeRequired: { confirmed: true }
      }
    });

    // Broadcast update so Dashboard and Citizen app update instantly
    this.eventsGateway.broadcastComplaintTriaged(id, {
      status: updatedComplaint.status,
      aiAnalysis: updatedComplaint.aiAnalysis,
    });

    return updatedComplaint;
  }
}

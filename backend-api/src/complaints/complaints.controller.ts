import { Controller, Post, Get, Body, UseGuards, UseInterceptors, UploadedFile, Request, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { AntiFraudInterceptor } from '../common/guards/anti-fraud.guard';

@Controller('api/v1/citizen/complaints')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@Roles('CITIZEN')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'), AntiFraudInterceptor)
  submit(
    @Request() req: any,
    @Body() dto: CreateComplaintDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.complaintsService.submit(req.user.id, dto, file);
  }

  @Get()
  findByUser(@Request() req: any) {
    return this.complaintsService.findByUser(req.user.id);
  }

  @Get('nearby')
  findNearby() {
    return this.complaintsService.findNearby(); // Temporary MVP: returns all active complaints
  }

  @Get(':id')
  findById(@Request() req: any, @Param('id') id: string) {
    return this.complaintsService.findById(id, req.user.id);
  }
}

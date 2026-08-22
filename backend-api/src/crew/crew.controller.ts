import { Controller, Get, Patch, Param, Body, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrewService } from './crew.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/crew/complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('FIELD_CREW')
export class CrewController {
  constructor(private readonly crewService: CrewService) {}

  @Get()
  getDispatchedComplaints(@Request() req: any) {
    // For MVP, we return all dispatched complaints.
    // Later we can filter by req.user.id if we implement strict assignment.
    return this.crewService.getDispatchedComplaints();
  }

  @Get(':id')
  getComplaintById(@Param('id') id: string) {
    return this.crewService.getComplaintById(id);
  }

  @Patch(':id/resolve')
  @UseInterceptors(FileInterceptor('afterPhoto'))
  resolveComplaint(
    @Param('id') id: string,
    @Body('ppeConfirmed') ppeConfirmed: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.crewService.resolveComplaint(id, file, ppeConfirmed === 'true');
  }
}

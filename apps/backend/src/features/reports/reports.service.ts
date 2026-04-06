import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        photoUrl: dto.photoUrl,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        photoUrl: true,
        status: true,
        triageStatus: true,
        createdAt: true,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        location: true,
        status: true,
        triageStatus: true,
        aiUrgency: true,
        createdAt: true,
      },
    });
  }
}

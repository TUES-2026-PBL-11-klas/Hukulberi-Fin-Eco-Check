import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Config } from './schemas/config.entity';
import { FeatureFlag } from './schemas/feature-flag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Config, FeatureFlag])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

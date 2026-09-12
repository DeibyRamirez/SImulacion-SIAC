import { Module } from '@nestjs/common';
import { VigenciasController } from './vigencias.controller';
import { VigenciasService } from './vigencias.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [VigenciasController],
  providers: [VigenciasService],
  exports: [VigenciasService],
})
export class VigenciasModule {}

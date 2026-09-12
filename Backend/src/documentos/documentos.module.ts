import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { EvidenciaRepositorio } from './evidencia.repositorio';

@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService, EvidenciaRepositorio],
  exports: [DocumentosService, EvidenciaRepositorio],
})
export class DocumentosModule {}

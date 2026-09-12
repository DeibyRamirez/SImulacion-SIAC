import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EstadoEvidencia, RolUsuario } from '@prisma/client';
import { EvidenciaRepositorio } from '../documentos/evidencia.repositorio';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { DictaminarDto } from './dto/dictaminar.dto';

@Injectable()
export class AprobacionService {
  constructor(
    private readonly evidenciaRepo: EvidenciaRepositorio,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async dictaminar(
    evidenciaId: string,
    dto: DictaminarDto,
    revisor: { id: string; rol: RolUsuario },
  ) {
    if (revisor.rol !== RolUsuario.Revisor && revisor.rol !== RolUsuario.Administrador) {
      throw new ForbiddenException('Solo revisores pueden dictaminar evidencias.');
    }

    if (
      dto.estado !== EstadoEvidencia.Validado &&
      dto.estado !== EstadoEvidencia.Rechazado
    ) {
      throw new BadRequestException('El dictamen debe ser Validado o Rechazado.');
    }

    const evidencia = await this.evidenciaRepo.buscarPorId(evidenciaId);
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada.');

    if (evidencia.estado !== EstadoEvidencia.Borrador && evidencia.estado !== EstadoEvidencia.EnRevision) {
      throw new BadRequestException('Solo se pueden dictaminar evidencias en borrador o en revisión.');
    }

    const actualizada = await this.evidenciaRepo.actualizar(evidenciaId, {
      estado: dto.estado,
      observaciones: dto.observaciones,
    });

    await this.evidenciaRepo.registrarHistorial(
      evidenciaId,
      dto.estado,
      dto.observaciones,
      revisor.id,
    );

    const mensaje =
      dto.estado === EstadoEvidencia.Validado
        ? `Tu evidencia "${evidencia.nombre}" fue aprobada.`
        : `Tu evidencia "${evidencia.nombre}" fue rechazada: ${dto.observaciones ?? 'Sin observaciones.'}`;

    await this.notificaciones.crear(evidencia.autorId, mensaje, 'dictamen');

    return actualizada;
  }

  async listarPendientes() {
    const [datos, total] = await this.evidenciaRepo.listar({
      estado: EstadoEvidencia.Borrador,
      limite: 100,
    });
    return { datos, total };
  }
}

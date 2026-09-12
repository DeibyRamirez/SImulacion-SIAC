import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { RolUsuario, EstadoEvidencia } from '@prisma/client';
import { EvidenciaRepositorio, FiltrosEvidencia } from './evidencia.repositorio';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';
import { CrearEvidenciaDto, ActualizarEvidenciaDto } from './dto/evidencia.dto';

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const TAMANO_MAXIMO = 20 * 1024 * 1024; // 20 MB

interface UsuarioToken {
  id: string;
  rol: RolUsuario;
}

@Injectable()
export class DocumentosService {
  constructor(
    private readonly evidenciaRepo: EvidenciaRepositorio,
    private readonly almacenamiento: AlmacenamientoService,
  ) {}

  async crearConArchivo(
    dto: CrearEvidenciaDto,
    archivo: Express.Multer.File,
    usuario: UsuarioToken,
  ) {
    this.validarArchivo(archivo);

    const { clave } = await this.almacenamiento.subirArchivo(
      archivo.buffer,
      archivo.originalname,
    );

    const evidencia = await this.evidenciaRepo.crear({
      nombre: dto.nombre,
      programa: { connect: { id: dto.programaId } },
      periodo: dto.periodo,
      factor: dto.factor,
      indicador: dto.indicador,
      autor: { connect: { id: usuario.id } },
      nombreArchivo: archivo.originalname,
      rutaArchivo: clave,
      mimeType: archivo.mimetype,
      tamanoBytes: archivo.size,
      responsable: dto.responsable,
      estado: EstadoEvidencia.Borrador,
    });

    await this.evidenciaRepo.registrarHistorial(
      evidencia.id,
      EstadoEvidencia.Borrador,
      'Evidencia cargada',
      usuario.id,
    );

    return evidencia;
  }

  async listar(usuario: UsuarioToken, filtros: FiltrosEvidencia) {
    const filtrosAplicados = { ...filtros };

    if (usuario.rol === RolUsuario.Cargador) {
      filtrosAplicados.autorId = usuario.id;
    }

    if (usuario.rol === RolUsuario.Administrador) {
      filtrosAplicados.soloValidados = true;
    }

    const [datos, total] = await this.evidenciaRepo.listar(filtrosAplicados);
    return {
      datos,
      total,
      pagina: filtros.pagina ?? 1,
      limite: filtros.limite ?? 20,
    };
  }

  async obtenerPorId(id: string, usuario: UsuarioToken) {
    const evidencia = await this.evidenciaRepo.buscarPorId(id);
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada.');

    this.verificarAccesoLectura(evidencia, usuario);
    return evidencia;
  }

  async actualizar(id: string, dto: ActualizarEvidenciaDto, usuario: UsuarioToken) {
    const evidencia = await this.obtenerPorId(id, usuario);
    this.verificarEdicion(evidencia, usuario);

    return this.evidenciaRepo.actualizar(id, dto);
  }

  async eliminar(id: string, usuario: UsuarioToken) {
    const evidencia = await this.obtenerPorId(id, usuario);
    this.verificarEdicion(evidencia, usuario);

    if (evidencia.rutaArchivo) {
      await this.almacenamiento.eliminarArchivo(evidencia.rutaArchivo);
    }

    return this.evidenciaRepo.eliminar(id);
  }

  async descargarArchivo(id: string, usuario: UsuarioToken) {
    const evidencia = await this.obtenerPorId(id, usuario);
    if (!evidencia.rutaArchivo) {
      throw new NotFoundException('Archivo no disponible.');
    }

    const buffer = await this.almacenamiento.obtenerBuffer(evidencia.rutaArchivo);
    return { buffer, nombreArchivo: evidencia.nombreArchivo, mimeType: evidencia.mimeType };
  }

  private validarArchivo(archivo: Express.Multer.File) {
    if (!archivo) throw new BadRequestException('Se requiere un archivo.');
    if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
      throw new BadRequestException('Solo se permiten archivos PDF o Excel.');
    }
    if (archivo.size > TAMANO_MAXIMO) {
      throw new BadRequestException('El archivo supera el tamaño máximo de 20 MB.');
    }
  }

  private verificarAccesoLectura(
    evidencia: { estado: EstadoEvidencia; autorId: string },
    usuario: UsuarioToken,
  ) {
    if (usuario.rol === RolUsuario.Administrador && evidencia.estado !== EstadoEvidencia.Validado) {
      throw new ForbiddenException('Solo puede ver evidencias validadas.');
    }
    if (usuario.rol === RolUsuario.Cargador && evidencia.autorId !== usuario.id) {
      throw new ForbiddenException('No tiene acceso a esta evidencia.');
    }
  }

  private verificarEdicion(
    evidencia: { estado: EstadoEvidencia; autorId: string },
    usuario: UsuarioToken,
  ) {
    if (evidencia.estado === EstadoEvidencia.Validado) {
      throw new ForbiddenException('No se puede modificar una evidencia validada.');
    }
    if (usuario.rol === RolUsuario.Cargador && evidencia.autorId !== usuario.id) {
      throw new ForbiddenException('Solo puede editar sus propias evidencias.');
    }
    if (usuario.rol === RolUsuario.Administrador) {
      throw new ForbiddenException('El administrador no edita evidencias.');
    }
  }
}

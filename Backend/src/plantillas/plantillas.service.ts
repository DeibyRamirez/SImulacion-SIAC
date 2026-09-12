import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { PlantillaRepositorio } from './plantilla.repositorio';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';
import { CrearPlantillaDto, ActualizarPlantillaDto } from './dto/plantilla.dto';

@Injectable()
export class PlantillasService {
  constructor(
    private readonly plantillaRepo: PlantillaRepositorio,
    private readonly almacenamiento: AlmacenamientoService,
  ) {}

  listar(rol: RolUsuario) {
    const soloVigentes = rol === RolUsuario.Cargador;
    return this.plantillaRepo.listar(soloVigentes);
  }

  async crear(dto: CrearPlantillaDto, archivo?: Express.Multer.File) {
    let rutaArchivo: string | undefined;
    let nombreArchivo: string | undefined;

    if (archivo) {
      const resultado = await this.almacenamiento.subirArchivo(
        archivo.buffer,
        archivo.originalname,
        'plantillas',
      );
      rutaArchivo = resultado.clave;
      nombreArchivo = archivo.originalname;
    }

    await this.plantillaRepo.marcarAnterioresNoVigentes(dto.factor);

    return this.plantillaRepo.crear({
      ...dto,
      vigente: true,
      nombreArchivo,
      rutaArchivo,
    });
  }

  async actualizar(id: string, dto: ActualizarPlantillaDto, rol: RolUsuario) {
    if (rol === RolUsuario.Cargador) {
      throw new ForbiddenException('Los cargadores no pueden editar plantillas.');
    }

    const plantilla = await this.plantillaRepo.buscarPorId(id);
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada.');

    return this.plantillaRepo.actualizar(id, dto);
  }

  async eliminar(id: string, rol: RolUsuario) {
    if (rol !== RolUsuario.Administrador) {
      throw new ForbiddenException('Solo el administrador puede eliminar plantillas.');
    }

    const plantilla = await this.plantillaRepo.buscarPorId(id);
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada.');

    if (plantilla.rutaArchivo) {
      await this.almacenamiento.eliminarArchivo(plantilla.rutaArchivo);
    }

    return this.plantillaRepo.eliminar(id);
  }

  async descargar(id: string) {
    const plantilla = await this.plantillaRepo.buscarPorId(id);
    if (!plantilla?.rutaArchivo) {
      throw new NotFoundException('Archivo de plantilla no disponible.');
    }

    const buffer = await this.almacenamiento.obtenerBuffer(plantilla.rutaArchivo);
    return { buffer, nombreArchivo: plantilla.nombreArchivo ?? `${plantilla.nombre}.${plantilla.formato.toLowerCase()}` };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RolUsuario, EstadoEvidencia } from '@prisma/client';
import { DocumentosService } from './documentos.service';
import { CrearEvidenciaDto, ActualizarEvidenciaDto, FiltrosEvidenciaDto } from './dto/evidencia.dto';
import { Roles, RolesGuard } from '../common/guards/roles.guard';

@Controller('evidencias')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @Roles(RolUsuario.Cargador)
  @UseInterceptors(FileInterceptor('archivo'))
  crear(
    @Body() dto: CrearEvidenciaDto,
    @UploadedFile() archivo: Express.Multer.File,
    @Request() req: { user: { id: string; rol: RolUsuario } },
  ) {
    return this.documentosService.crearConArchivo(dto, archivo, req.user);
  }

  @Get()
  listar(
    @Query() query: FiltrosEvidenciaDto,
    @Request() req: { user: { id: string; rol: RolUsuario } },
  ) {
    return this.documentosService.listar(req.user, {
      programaId: query.programaId,
      periodo: query.periodo,
      factor: query.factor,
      indicador: query.indicador,
      estado: query.estado as EstadoEvidencia | undefined,
      busqueda: query.busqueda,
      pagina: query.pagina ? parseInt(query.pagina, 10) : 1,
      limite: query.limite ? parseInt(query.limite, 10) : 20,
    });
  }

  @Get(':id')
  obtener(
    @Param('id') id: string,
    @Request() req: { user: { id: string; rol: RolUsuario } },
  ) {
    return this.documentosService.obtenerPorId(id, req.user);
  }

  @Get(':id/descargar')
  async descargar(
    @Param('id') id: string,
    @Request() req: { user: { id: string; rol: RolUsuario } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, nombreArchivo, mimeType } =
      await this.documentosService.descargarArchivo(id, req.user);

    res.set({
      'Content-Type': mimeType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
    });

    return new StreamableFile(buffer);
  }

  @Patch(':id')
  @Roles(RolUsuario.Cargador)
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarEvidenciaDto,
    @Request() req: { user: { id: string; rol: RolUsuario } },
  ) {
    return this.documentosService.actualizar(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(RolUsuario.Cargador)
  eliminar(
    @Param('id') id: string,
    @Request() req: { user: { id: string; rol: RolUsuario } },
  ) {
    return this.documentosService.eliminar(id, req.user);
  }
}

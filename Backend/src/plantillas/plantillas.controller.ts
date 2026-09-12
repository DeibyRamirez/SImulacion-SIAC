import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { RolUsuario } from '@prisma/client';
import { PlantillasService } from './plantillas.service';
import { CrearPlantillaDto, ActualizarPlantillaDto } from './dto/plantilla.dto';
import { Roles, RolesGuard } from '../common/guards/roles.guard';

@Controller('plantillas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PlantillasController {
  constructor(private readonly plantillasService: PlantillasService) {}

  @Get()
  listar(@Request() req: { user: { rol: RolUsuario } }) {
    return this.plantillasService.listar(req.user.rol);
  }

  @Post()
  @Roles(RolUsuario.Administrador, RolUsuario.Revisor)
  @UseInterceptors(FileInterceptor('archivo'))
  crear(
    @Body() dto: CrearPlantillaDto,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    return this.plantillasService.crear(dto, archivo);
  }

  @Patch(':id')
  @Roles(RolUsuario.Administrador, RolUsuario.Revisor)
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarPlantillaDto,
    @Request() req: { user: { rol: RolUsuario } },
  ) {
    return this.plantillasService.actualizar(id, dto, req.user.rol);
  }

  @Delete(':id')
  @Roles(RolUsuario.Administrador)
  eliminar(
    @Param('id') id: string,
    @Request() req: { user: { rol: RolUsuario } },
  ) {
    return this.plantillasService.eliminar(id, req.user.rol);
  }

  @Get(':id/descargar')
  async descargar(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { buffer, nombreArchivo } = await this.plantillasService.descargar(id);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
    });
    return new StreamableFile(buffer);
  }
}

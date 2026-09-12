import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { DocumentosModule } from './documentos/documentos.module';
import { PlantillasModule } from './plantillas/plantillas.module';
import { ProgramasModule } from './programas/programas.module';
import { BusquedaModule } from './busqueda/busqueda.module';
import { AprobacionModule } from './aprobacion/aprobacion.module';
import { VigenciasModule } from './vigencias/vigencias.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { PowerBiModule } from './powerbi/powerbi.module';
import { AlmacenamientoModule } from './almacenamiento/almacenamiento.module';
import { EstructuraModule } from './estructura/estructura.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AlmacenamientoModule,
    AuthModule,
    UsuariosModule,
    DocumentosModule,
    PlantillasModule,
    ProgramasModule,
    BusquedaModule,
    AprobacionModule,
    VigenciasModule,
    NotificacionesModule,
    PowerBiModule,
    EstructuraModule,
  ],
})
export class AppModule {}

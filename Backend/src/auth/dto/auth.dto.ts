import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class IniciarSesionDto {
  @IsEmail()
  @IsNotEmpty()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  contrasena!: string;
}

export class RespuestaAuthDto {
  token!: string;
  usuario!: {
    id: string;
    nombre: string;
    correo: string;
    rol: RolUsuario;
  };
}

export class ActualizarRolDto {
  @IsEnum(RolUsuario)
  rol!: RolUsuario;
}

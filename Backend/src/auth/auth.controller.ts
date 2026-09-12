import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IniciarSesionDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  iniciarSesion(@Body() dto: IniciarSesionDto) {
    return this.authService.iniciarSesion(dto);
  }

  @Get('perfil')
  @UseGuards(AuthGuard('jwt'))
  obtenerPerfil(@Request() req: { user: unknown }) {
    return req.user;
  }
}

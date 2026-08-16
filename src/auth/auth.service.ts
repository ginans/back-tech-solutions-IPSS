import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });

    if (existing) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const claveCifrada = await bcrypt.hash(dto.clave, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        correo: dto.correo,
        clave: claveCifrada,
      },
    });

    delete (usuario as Partial<typeof usuario> & { clave?: string }).clave;

    return {
      message: 'Usuario registrado exitosamente',
      usuario,
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const claveValida = await bcrypt.compare(dto.clave, usuario.clave);

    if (!claveValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuario.id, correo: usuario.correo };

    return {
      message: 'Inicio de sesión exitoso',
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    };
  }
}

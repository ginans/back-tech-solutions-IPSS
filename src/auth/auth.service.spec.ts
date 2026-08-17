import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    usuario: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe crear un usuario con la clave cifrada', async () => {
      const dto = {
        nombre: 'Juan Pérez',
        correo: 'juan@correo.com',
        clave: 'secreto123',
      };

      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.usuario.create.mockImplementation(async ({ data }) => ({
        id: 1,
        ...data,
      }));

      const result = await service.register(dto);

      expect(prisma.usuario.create).toHaveBeenCalled();
      const created = prisma.usuario.create.mock.calls[0][0].data;
      expect(created.clave).not.toBe(dto.clave);
      expect(await bcrypt.compare(dto.clave, created.clave)).toBe(true);
      expect(result.usuario.clave).toBeUndefined();
      expect(result.message).toBe('Usuario registrado exitosamente');
    });

    it('debe lanzar conflicto si el correo ya existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        correo: 'juan@correo.com',
      });

      await expect(
        service.register({
          nombre: 'Juan',
          correo: 'juan@correo.com',
          clave: 'secreto123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debe retornar un JWT si las credenciales son correctas', async () => {
      const claveCifrada = await bcrypt.hash('secreto123', 10);

      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Juan Pérez',
        correo: 'juan@correo.com',
        clave: claveCifrada,
      });
      jwtService.signAsync.mockResolvedValue('token-123');

      const result = await service.login({
        correo: 'juan@correo.com',
        clave: 'secreto123',
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        correo: 'juan@correo.com',
      });
      expect(result.access_token).toBe('token-123');
      expect(result.usuario.clave).toBeUndefined();
    });

    it('debe rechazar credenciales inválidas', async () => {
      const claveCifrada = await bcrypt.hash('otra-clave', 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        correo: 'juan@correo.com',
        clave: claveCifrada,
      });

      await expect(
        service.login({ correo: 'juan@correo.com', clave: 'incorrecta' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ correo: 'nadie@correo.com', clave: 'secreto123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
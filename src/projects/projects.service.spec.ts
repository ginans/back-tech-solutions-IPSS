import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: {
    proyecto: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const proyectoEjemplo = {
    id: 1,
    nombre: 'Sistema de Facturación',
    fechaInicio: new Date('2026-01-10'),
    estado: 'En progreso',
    responsable: 'María Pérez',
    monto: 2500000,
    createdBy: 1,
  };

  beforeEach(async () => {
    prisma = {
      proyecto: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('findAll', () => {
    it('debe listar solo los proyectos del usuario autenticado', async () => {
      prisma.proyecto.findMany.mockResolvedValue([proyectoEjemplo]);

      const result = await service.findAll(1);

      expect(prisma.proyecto.findMany).toHaveBeenCalledWith({
        where: { createdBy: 1 },
        orderBy: { id: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('debe crear un proyecto asignando createdBy al usuario', async () => {
      prisma.proyecto.create.mockResolvedValue(proyectoEjemplo);

      await service.create(1, {
        nombre: 'Sistema de Facturación',
        fechaInicio: '2026-01-10',
        estado: 'En progreso',
        responsable: 'María Pérez',
        monto: 2500000,
      });

      const data = prisma.proyecto.create.mock.calls[0][0].data;
      expect(data.createdBy).toBe(1);
      expect(data.nombre).toBe('Sistema de Facturación');
    });
  });

  describe('update/remove', () => {
    it('debe actualizar un proyecto correctamente retornando los campos actualizados', async () => {
      prisma.proyecto.findUnique.mockResolvedValue(proyectoEjemplo);
      const proyectoActualizado = { ...proyectoEjemplo, nombre: 'Sistema Modificado', monto: 3000000 };
      prisma.proyecto.update.mockResolvedValue(proyectoActualizado);

      const result = await service.update(1, 1, { nombre: 'Sistema Modificado', monto: 3000000 });

      expect(prisma.proyecto.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ nombre: 'Sistema Modificado', monto: 3000000 }),
      });
      expect(result).toEqual(proyectoActualizado);
    });

    it('debe eliminar un proyecto correctamente retornando void', async () => {
      prisma.proyecto.findUnique.mockResolvedValue(proyectoEjemplo);
      prisma.proyecto.delete.mockResolvedValue(proyectoEjemplo);

      await expect(service.remove(1, 1)).resolves.toBeUndefined();
      expect(prisma.proyecto.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('debe impedir modificar un proyecto de otro usuario', async () => {
      prisma.proyecto.findUnique.mockResolvedValue(proyectoEjemplo);

      await expect(
        service.update(1, 999, { nombre: 'Otro' }),
      ).rejects.toThrow(ForbiddenException);

      await expect(service.remove(1, 999)).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar not found si el proyecto no existe al consultar, actualizar o eliminar', async () => {
      prisma.proyecto.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99, 1)).rejects.toThrow(NotFoundException);
      await expect(service.update(99, 1, { nombre: 'Nuevo' })).rejects.toThrow(NotFoundException);
      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.proyecto.findMany({
      where: { createdBy: userId },
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.findOwned(id, userId);
  }

  async create(userId: number, dto: CreateProjectDto) {
    return this.prisma.proyecto.create({
      data: {
        nombre: dto.nombre,
        fechaInicio: new Date(dto.fechaInicio),
        estado: dto.estado,
        responsable: dto.responsable,
        monto: dto.monto,
        createdBy: userId,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateProjectDto) {
    await this.findOwned(id, userId);

    return this.prisma.proyecto.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        estado: dto.estado,
        responsable: dto.responsable,
        monto: dto.monto,
      },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOwned(id, userId);

    await this.prisma.proyecto.delete({ where: { id } });
  }

  private async findOwned(id: number, userId: number) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (proyecto.createdBy !== userId) {
      throw new ForbiddenException('No tienes permisos sobre este proyecto');
    }

    return proyecto;
  }
}

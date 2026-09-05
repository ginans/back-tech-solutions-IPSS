import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('proyectos')
@ApiBearerAuth()
@Controller('proyectos')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Búsqueda de todos los proyectos' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos obtenida correctamente' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.projectsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Búsqueda de un proyecto por su ID' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado con todos los campos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creación de un proyecto en la Base de Datos' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o campos requeridos vacíos' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un proyecto por su ID (HTTP PATCH)' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado con todos los campos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un proyecto por su ID (HTTP PUT)' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado con todos los campos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un proyecto por su ID' })
  @ApiResponse({ status: 204, description: 'Proyecto eliminado correctamente (respuesta vacía)' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.projectsService.remove(id, user.id);
  }
}


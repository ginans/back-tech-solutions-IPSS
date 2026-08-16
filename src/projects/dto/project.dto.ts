import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsDateString({}, { message: 'Fecha de inicio inválida' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicio: string;

  @IsString()
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado: string;

  @IsString()
  @IsNotEmpty({ message: 'El responsable es requerido' })
  responsable: string;

  @IsNumber({}, { message: 'El monto debe ser numérico' })
  @Min(0)
  @Type(() => Number)
  monto: number;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El monto debe ser numérico' })
  @Min(0)
  @Type(() => Number)
  monto?: number;
}
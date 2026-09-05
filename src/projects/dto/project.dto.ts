import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsDateString({}, { message: 'Fecha de inicio inválida' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicio: string;

  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado: string;

  @IsString({ message: 'El responsable debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El responsable es requerido' })
  responsable: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDefined({ message: 'El monto es requerido' })
  @IsNotEmpty({ message: 'El monto no debe estar vacío' })
  @IsNumber({}, { message: 'El monto debe ser numérico' })
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
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
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsNumber({}, { message: 'El monto debe ser numérico' })
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  @Type(() => Number)
  monto?: number;
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La clave es requerida' })
  @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
  clave: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La clave es requerida' })
  clave: string;
}

import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, ValidateIf } from 'class-validator';

export class SendOtpDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  phone?: string;
}

export class VerifyOtpDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ValidateIf((o) => !o.phone)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  phone?: string;
  
  @IsString()
  @Length(6, 6)
  otp: string;
}

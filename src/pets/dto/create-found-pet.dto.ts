import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, IsUrl, IsDateString } from 'class-validator';

export class CreateFoundPetDto {
    @IsString()
    @IsNotEmpty()
    species: string;

    @IsString()
    @IsOptional()
    breed?: string;

    @IsString()
    @IsNotEmpty()
    color: string;

    @IsString()
    @IsNotEmpty()
    size: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUrl()
    @IsOptional()
    photoUrl?: string;

    @IsString()
    @IsNotEmpty()
    finderName: string;

    @IsEmail()
    @IsNotEmpty()
    finderEmail: string;

    @IsString()
    @IsNotEmpty()
    finderPhone: string;

    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lon: number;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsDateString()
    @IsNotEmpty()
    foundDate: string;
}
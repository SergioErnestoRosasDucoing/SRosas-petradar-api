import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, IsUrl, IsDateString } from 'class-validator';

export class CreateLostPetDto {
    @IsString()
    @IsNotEmpty()
    name: string;

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
    ownerName: string;

    @IsEmail()
    @IsNotEmpty()
    ownerEmail: string;

    @IsString()
    @IsNotEmpty()
    ownerPhone: string;

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
    lostDate: string; 
}
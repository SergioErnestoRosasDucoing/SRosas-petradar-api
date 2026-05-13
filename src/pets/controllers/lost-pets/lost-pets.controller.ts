import { Body, Controller, Post, Get } from '@nestjs/common';
import { CreateLostPetDto } from 'src/pets/dto/create-lost-pet.dto';
import { PetsService } from 'src/pets/services/pets/pets.service';

@Controller('lost-pets')
export class LostPetsController {
    constructor(private readonly petsService: PetsService) {}

    @Post()
    async create(@Body() CreateLostPetDto : CreateLostPetDto) {
        return await this.petsService.createLostPet(CreateLostPetDto);
    }

    @Get()
    async findAll() {
        return await this.petsService.findAllLost();
    }
}
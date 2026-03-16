import { Body, Controller, Post } from '@nestjs/common';
import { CreateFoundPetDto } from 'src/pets/dto/create-found-pet.dto';
import { PetsService } from 'src/pets/services/pets/pets.service';

@Controller('found-pets')
export class FoundPetsController {
    constructor(private readonly petsService: PetsService) {}

    @Post()
    async create(@Body() createFoundPetDto: CreateFoundPetDto) {
        return await this.petsService.createFoundPet(createFoundPetDto);
    }
    
}

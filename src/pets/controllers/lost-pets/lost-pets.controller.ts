import { Body, Controller, Post } from '@nestjs/common';
import { CreateLostPetDto } from 'src/pets/dto/create-lost-pet.dto';
import { PetsService } from 'src/pets/services/pets/pets.service';

@Controller('lost-pets')
export class LostPetsController {
    constructor(private readonly petsService: PetsService) {}

    @Post()
    async create(@Body() CreateLostPetDto : CreateLostPetDto) {
        return await this.petsService.createLostPet(CreateLostPetDto);
    }
}

import { Module } from '@nestjs/common';
import { LostPetsController } from './controllers/lost-pets/lost-pets.controller';
import { FoundPetsController } from './controllers/found-pets/found-pets.controller';
import { PetsService } from './services/pets/pets.service';

@Module({
  controllers: [LostPetsController, FoundPetsController],
  providers: [PetsService]
})
export class PetsModule {}

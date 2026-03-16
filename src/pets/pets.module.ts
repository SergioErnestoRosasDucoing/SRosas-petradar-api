import { Module } from '@nestjs/common';
import { LostPetsController } from './controllers/lost-pets/lost-pets.controller';
import { FoundPetsController } from './controllers/found-pets/found-pets.controller';
import { PetsService } from './services/pets/pets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPet } from './entities/lost-pet.entity';
import { FoundPet } from './entities/found-pet.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([LostPet, FoundPet]),
    EmailModule
  ],
  controllers: [LostPetsController, FoundPetsController],
  providers: [PetsService],
  exports: [PetsService]
})
export class PetsModule {}

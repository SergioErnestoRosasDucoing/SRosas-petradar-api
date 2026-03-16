import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { generateMatchEmailTemplate } from 'src/email/utils/pet-email.template';
import { CreateFoundPetDto } from 'src/pets/dto/create-found-pet.dto';
import { CreateLostPetDto } from 'src/pets/dto/create-lost-pet.dto';
import { FoundPet } from 'src/pets/entities/found-pet.entity';
import { LostPet } from 'src/pets/entities/lost-pet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PetsService {
    constructor(
        @InjectRepository(LostPet)
        private readonly lostPetRepository: Repository<LostPet>,
        @InjectRepository(FoundPet)
        private readonly foundPetRepository: Repository<FoundPet>,
        private readonly emailService: EmailService
    ) {}

    async createLostPet(dto: CreateLostPetDto): Promise<LostPet> {
        const {
            lat,
            lon,
            lostDate,
            ...restOfData
        } = dto;

        const newLostPet = this.lostPetRepository.create({
            ...restOfData,
            lostDate: new Date(lostDate),
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        });

        return await this.lostPetRepository.save(newLostPet);
    }

    async createFoundPet(dto: CreateFoundPetDto): Promise<FoundPet> {
        const { lat, lon, foundDate, ...restOfData } = dto;
        const newFoundPet = this.foundPetRepository.create({
            ...restOfData,
            foundDate: new Date(foundDate),
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        });
        const savedFoundPet = await this.foundPetRepository.save(newFoundPet);

        // Búsqueda por radio (500 metros) usando PostGIS
        const matches = await this.lostPetRepository
            .createQueryBuilder('lost_pet')
            .where('lost_pet.is_active = true')
            .addSelect(`ST_Distance(lost_pet.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography)`, 'distance')
            .andWhere(
                `ST_DWithin(
                    lost_pet.location::geography,
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                    500
                )`, { lon: dto.lon, lat: dto.lat }
            )
            .orderBy('distance', 'ASC') 
            .getMany();

        console.log(`[PetsService] Se encontraron ${matches.length} posibles coincidencias a menos de 500m.`);

        for (const lostPet of matches) {
            const template = generateMatchEmailTemplate(lostPet, dto);
            await this.emailService.sendEmail({
                to: lostPet.ownerEmail,
                subject: `¡Posible coincidencia para ${lostPet.name} en PetRadar! 🐾`,
                htmlBody: template
            });
        }

        return savedFoundPet;
    }
    
}

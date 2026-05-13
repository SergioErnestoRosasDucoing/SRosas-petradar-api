import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { generateMatchEmailTemplate } from 'src/email/utils/pet-email.template';
import { CreateFoundPetDto } from 'src/pets/dto/create-found-pet.dto';
import { CreateLostPetDto } from 'src/pets/dto/create-lost-pet.dto';
import { FoundPet } from 'src/pets/entities/found-pet.entity';
import { LostPet } from 'src/pets/entities/lost-pet.entity';
import { Repository } from 'typeorm';
import { CacheService } from 'src/cache/cache.service';

const CACHE_KEY_ALL_LOST_PETS = "pets:lost:all";
const CACHE_KEY_ALL_FOUND_PETS = "pets:found:all";


@Injectable()
export class PetsService {
    constructor(
        @InjectRepository(LostPet)
        private readonly lostPetRepository: Repository<LostPet>,
        @InjectRepository(FoundPet)
        private readonly foundPetRepository: Repository<FoundPet>,
        private readonly emailService: EmailService,
        private readonly cacheService: CacheService
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

        const generatedLostPet = await this.lostPetRepository.save(newLostPet);
        await this.cacheService.delete(CACHE_KEY_ALL_LOST_PETS);
        
        return generatedLostPet;
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
        await this.cacheService.delete(CACHE_KEY_ALL_FOUND_PETS);

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

    async findAllLost(): Promise<LostPet[]> {
        try {
            console.log("[PetsService] Ejecutando query de todas las mascotas perdidas activas");

            const lostPetsObject = await this.cacheService.get<LostPet[]>(CACHE_KEY_ALL_LOST_PETS);

            if (lostPetsObject && lostPetsObject.length > 0) {
                console.log("[PetsService] Retornando mascotas perdidas desde REDIS ⚡");
                return lostPetsObject;
            }

            const result = await this.lostPetRepository.find({
                where: { isActive: true }, 
                order: { createdAt: 'DESC' }
            });
            
            console.log(`[PetsService] Se encontraron ${result.length} mascotas perdidas activas en BD`);
            await this.cacheService.set(CACHE_KEY_ALL_LOST_PETS, result);
            return result;

        } catch (error) {
            console.error("[PetsService] Ocurrio un error al querer traer las mascotas perdidas");
            console.error(error);
            return [];
        }
    }

    async findAllFound(): Promise<FoundPet[]> {
        try {
            console.log("[PetsService] Ejecutando query de todas las mascotas encontradas");

            const foundPetsObject = await this.cacheService.get<FoundPet[]>(CACHE_KEY_ALL_FOUND_PETS);

            if (foundPetsObject && foundPetsObject.length > 0) {
                console.log("[PetsService] Retornando mascotas encontradas desde REDIS ⚡");
                return foundPetsObject;
            }

            const result = await this.foundPetRepository.find({
                order: { createdAt: 'DESC' }
            });
            
            console.log(`[PetsService] Se encontraron ${result.length} mascotas encontradas en BD`);
            await this.cacheService.set(CACHE_KEY_ALL_FOUND_PETS, result);
            return result;

        } catch (error) {
            console.error("[PetsService] Ocurrio un error al querer traer las mascotas encontradas");
            console.error(error);
            return [];
        }
    }

    
}

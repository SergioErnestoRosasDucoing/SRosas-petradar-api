import { envs } from "src/config/envs";
import { LostPet } from "src/pets/entities/lost-pet.entity";
import { CreateFoundPetDto } from "src/pets/dto/create-found-pet.dto";

const speciesEmojiMap: Record<string, string> = {
    'perro': '🐶',
    'gato': '🐱',
    'ave': '🦜',
    'pajaro': '🦜',
    'conejo': '🐰',
    'tortuga': '🐢',
    'serpiente': '🐍',
    'hamster': '🐹',
    'huron': '🦦',
};

export const generateMapboxStaticImage = (
    lostLat: number, lostLon: number, 
    foundLat: number, foundLon: number
): string => {
    const accessToken = envs.MAPBOX_TOKEN;
    const width = 800;
    const height = 400;
    
    // pin rojo (l = lost), pin verde (f = found)
    const lostPin = `pin-s-l+e74c3c(${lostLon},${lostLat})`;
    const foundPin = `pin-s-f+2ecc71(${foundLon},${foundLat})`;
    
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lostPin},${foundPin}/auto/${width}x${height}?padding=50&access_token=${accessToken}`;
}

export const generateMatchEmailTemplate = (lostPet: LostPet, foundPet: CreateFoundPetDto): string => {
    const lostLon = lostPet.location.coordinates[0];
    const lostLat = lostPet.location.coordinates[1];
    
    const imageUrl = generateMapboxStaticImage(lostLat, lostLon, foundPet.lat, foundPet.lon);

    const speciesKey = foundPet.species.toLowerCase().trim(); 
    const speciesEmoji = speciesEmojiMap[speciesKey] || '🐾';

    return `
    <div style="margin:0;padding:0;background-color:#f4f7f6;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f6;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">
              
              <tr>
                <td style="background:linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);padding:40px 32px 30px;text-align:center;">
                  <p style="margin:0 0 10px;font-size:14px;color:#ffe3e3;text-transform:uppercase;letter-spacing:2px;font-weight:700;">¡Alerta PetRadar!</p>
                  <h1 style="margin:0;font-size:28px;color:#ffffff;font-weight:800;line-height:1.3;">¡Posible coincidencia para ${lostPet.name}! 🐾</h1>
                  <p style="margin:15px 0 0;font-size:16px;color:#ffffff;opacity:0.9;">Hola ${lostPet.ownerName}, alguien reportó una mascota a menos de 500m de donde se perdió ${lostPet.name}.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 32px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff5f5;border-left:4px solid #FF6B6B;border-radius:0 8px 8px 0;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <h3 style="margin:0 0 12px;color:#c0392b;font-size:16px;">${speciesEmoji} Detalles de la mascota encontrada</h3>
                        <p style="margin:0 0 6px;font-size:14px;color:#4a5568;"><strong>Especie:</strong> ${foundPet.species} ${foundPet.breed ? `(${foundPet.breed})` : ''}</p>
                        <p style="margin:0 0 6px;font-size:14px;color:#4a5568;"><strong>Color:</strong> ${foundPet.color}</p>
                        <p style="margin:0;font-size:14px;color:#4a5568;"><strong>Descripción:</strong> <em>"${foundPet.description}"</em></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 32px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-left:4px solid #2ecc71;border-radius:0 8px 8px 0;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <h3 style="margin:0 0 12px;color:#27ae60;font-size:16px;">👤 Datos de quien la encontró</h3>
                        <p style="margin:0 0 6px;font-size:14px;color:#4a5568;"><strong>Nombre:</strong> ${foundPet.finderName}</p>
                        <p style="margin:0 0 6px;font-size:14px;color:#4a5568;"><strong>Teléfono:</strong> <a href="tel:${foundPet.finderPhone}" style="color:#2ecc71;text-decoration:none;font-weight:bold;">${foundPet.finderPhone}</a></p>
                        <p style="margin:0;font-size:14px;color:#4a5568;"><strong>Email:</strong> <a href="mailto:${foundPet.finderEmail}" style="color:#2ecc71;text-decoration:none;">${foundPet.finderEmail}</a></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 32px;">
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
                </td>
              </tr>

              <tr>
                <td style="padding:24px 32px 0;text-align:center;">
                  <h3 style="margin:0 0 16px;color:#2d3748;font-size:18px;">📍 Mapa de coincidencia (Radio 500m)</h3>
                  <img src="${imageUrl}" width="496" style="width:100%;height:auto;border-radius:12px;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.1);" alt="Mapa de ubicaciones" />
                  
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                    <tr>
                      <td align="center" style="font-size:13px;color:#718096;background-color:#f7fafc;padding:10px;border-radius:8px;">
                        <span style="color:#e74c3c;font-weight:bold;">🔴 Punto de extravío</span> 
                        &nbsp;&nbsp;|&nbsp;&nbsp; 
                        <span style="color:#2ecc71;font-weight:bold;">🟢 Punto de hallazgo</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:32px;text-align:center;">
                  <p style="margin:0;font-size:13px;color:#a0aec0;line-height:1.5;">Este correo fue generado automáticamente por la API de PetRadar.<br>¡Esperamos que ${lostPet.name} vuelva a casa pronto! ❤️</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
    `;
};
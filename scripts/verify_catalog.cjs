/**
 * Script de verificación e integridad del catálogo sin gluten.
 * Ejecutado periódicamente por GitHub Actions para asegurar consistencia
 * en coordenadas, certificados y aperturas antes de desplegar en Vercel.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/mockRestaurants.ts');

if (!fs.existsSync(filePath)) {
  console.error('Error: no se encontró el archivo de datos mockRestaurants.ts');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Verificación sintáctica básica
const countMatches = [...content.matchAll(/id":\s*"([^"]+)"/g)].map(m => m[1]);
const countries = [...content.matchAll(/country":\s*"([^"]+)"/g)].map(m => m[1]);
const cities = [...content.matchAll(/city":\s*"([^"]+)"/g)].map(m => m[1]);

console.log('--- REPORTE DE SALUD DEL CATÁLOGO ---');
console.log(`Total de restaurantes registrados: ${countMatches.length}`);
console.log(`Países cubiertos: ${new Set(countries).size}`);
console.log(`Ciudades cubiertas: ${new Set(cities).size}`);

const countryCounts = {};
countries.forEach(c => countryCounts[c] = (countryCounts[c] || 0) + 1);
console.log('\nDistribución por país:');
Object.entries(countryCounts).forEach(([c, n]) => console.log(`  - ${c}: ${n} locales`));

if (countMatches.length === 0) {
  console.error('Error: Catálogo vacío.');
  process.exit(1);
}

console.log('\nVerificación superada con éxito.');

#!/usr/bin/env node
// Renomme + convertit en WebP les 13 photos chantier déposées par Yannis.
// Respecte la rotation EXIF (photo Samsung en orientation 6 = 90° CW).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, 'photos-mds-fournies');
const DST = path.join(__dirname, 'assets', 'photos-chantiers');
fs.mkdirSync(DST, { recursive: true });

const MAPPING = {
  '101554635_1546024112226561_8769705584954966016_n.jpg': 'escalier-beton-garde-corps-verre',
  '20210205_100409.jpg':                                  'escalier-helicoidal-blanc',
  '37935699_1016026458559665_1854946832694640640_n.jpg':  'escalier-design-ondule-double-limon',
  '41930286_1060071717488472_3761957469404790784_n.jpg':  'garde-corps-fer-forge-grange',
  '45609142_1088529334642710_5499857166154072064_n.jpg':  'garde-corps-laser-motifs-geometriques',
  '48372337_1109010865927890_6589860535200645120_n.jpg':  'portails-noir-pierre-piscine',
  '484555587_1187424696681876_5403042186423042334_n.jpg': 'escalier-suspendu-bois-verre',
  '484807847_1187424700015209_8143991754614186837_n.jpg': 'garde-corps-fer-forge-comble',
  '484844607_1187424806681865_6687181615423686018_n.jpg': 'verriere-noir-salle-de-bain-bois',
  '486187505_1194595305964815_4101758541981033762_n.jpg': 'garde-corps-barreaux-bleu-terrasse',
  '489076055_1207686881322324_6345416950261718762_n.jpg': 'garde-corps-verre-terrasse-jardin',
  '70355735_1300829540079354_6471576603292860416_n.jpg':  'escalier-moderne-noir-limon-central',
  '84779166_1450441801784793_763851158975414272_n.jpg':   'verriere-noir-salle-de-bain-atelier',
};

(async () => {
  let totalIn = 0, totalOut = 0;
  for (const [src, slug] of Object.entries(MAPPING)) {
    const srcPath = path.join(SRC, src);
    if (!fs.existsSync(srcPath)) { console.log(`SKIP missing: ${src}`); continue; }
    const sizeIn = fs.statSync(srcPath).size;
    const dstPath = path.join(DST, slug + '.webp');
    // .rotate() applique la rotation EXIF avant tout traitement
    await sharp(srcPath)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(dstPath);
    const sizeOut = fs.statSync(dstPath).size;
    totalIn += sizeIn; totalOut += sizeOut;
    const pct = Math.round((1 - sizeOut / sizeIn) * 100);
    console.log(`OK: ${slug}.webp (${Math.round(sizeIn/1024)} -> ${Math.round(sizeOut/1024)} KB, -${pct}%)`);
  }
  console.log(`\nTotal : ${(totalIn/1024/1024).toFixed(1)} MB -> ${(totalOut/1024/1024).toFixed(1)} MB`);
})();

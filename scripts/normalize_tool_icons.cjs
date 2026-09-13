const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

const filesToNormalize = [
  'sweet_macaron.png',
  'ui_timeline_sun_moon.png',
  'ui_fetal_heart_3d.png',
  'ui_fetal_brain_3d.png',
  'ui_hospital_bag_3d.png',
  'ui_birth_plan_scroll.png',
  'ui_doctor_prep_notebook.png',
  'ui_baby_name_blocks.png',
  'ui_nursing_dual_timer.png',
  'ui_white_noise_headphones.png',
  'ui_diaper_wet_drop.png',
  'ui_baby_letter_envelope.png',
  'ui_weight_bmi_gauge.png',
  'ui_diaper_dirty.png',
  'ui_baby_crib.png',
  'ui_baby_stroller.png',
];

async function normalizeIcon(filename) {
  const filePath = path.join(assetsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping (not found):', filename);
    return;
  }

  try {
    const { data: trimmedBuffer, info } = await sharp(filePath)
      .trim()
      .toBuffer({ resolveWithObject: true });

    const maxDim = Math.max(info.width, info.height);
    if (maxDim === 0) return;

    // Target visual size: 310px to match card_kick_counter and card_contractions
    const targetSize = 310;
    const scale = targetSize / maxDim;
    const newW = Math.max(1, Math.round(info.width * scale));
    const newH = Math.max(1, Math.round(info.height * scale));

    const resizedBuffer = await sharp(trimmedBuffer)
      .resize(newW, newH)
      .toBuffer();

    const finalBuffer = await sharp({
      create: {
        width: 384,
        height: 384,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{
        input: resizedBuffer,
        top: Math.round((384 - newH) / 2),
        left: Math.round((384 - newW) / 2)
      }])
      .png()
      .toBuffer();

    await fs.promises.writeFile(filePath, finalBuffer);
    console.log('Normalized ' + filename + ': ' + info.width + 'x' + info.height + ' -> ' + newW + 'x' + newH + ' on 384x384 canvas');
  } catch (err) {
    console.error('Error normalizing ' + filename + ':', err.message);
  }
}

async function run() {
  console.log('Starting icon normalization...');
  for (const file of filesToNormalize) {
    await normalizeIcon(file);
  }
  console.log('Done!');
}

run();

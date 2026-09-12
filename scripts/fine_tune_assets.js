const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function fineTune() {
  const srcPath = 'c:/Users/TP2/Documents/annelik/9ecb89ab-204a-429d-9c90-d826a5c37190.png';
  const outDir = path.join(__dirname, '..', 'assets', 'extracted');
  const img = await Jimp.read(srcPath);

  // In Phone 4 (Baby Tracking):
  // Let's crop the whole 4 buttons area:
  // x: 860, y: 260, w: 230, h: 210
  const actionsBox = img.clone().crop({ x: 860, y: 260, w: 230, h: 210 });
  await actionsBox.write(path.join(outDir, 'all_actions.png'));

  // Separate buttons accurately:
  // Row 1: Emzirme (x: 870, y: 268), Biberon (x: 983, y: 268)
  // Row 2: Uyku (x: 870, y: 368), Bez (x: 983, y: 368)
  // Let's crop each button (84x84):
  const btnNursing = img.clone().crop({ x: 872, y: 268, w: 86, h: 86 });
  await btnNursing.write(path.join(outDir, 'btn_nursing.png'));

  const btnBottle = img.clone().crop({ x: 985, y: 268, w: 86, h: 86 });
  await btnBottle.write(path.join(outDir, 'btn_bottle.png'));

  const btnSleep = img.clone().crop({ x: 872, y: 365, w: 86, h: 86 });
  await btnSleep.write(path.join(outDir, 'btn_sleep.png'));

  const btnDiaper = img.clone().crop({ x: 985, y: 365, w: 86, h: 86 });
  await btnDiaper.write(path.join(outDir, 'btn_diaper.png'));

  // In Phone 5 (Discover Categories):
  // Bebek bezi: x: 1145, y: 488, w: 98, h: 58
  const catDiaper = img.clone().crop({ x: 1145, y: 488, w: 98, h: 58 });
  await catDiaper.write(path.join(outDir, 'cat_diaper.png'));

  // Islak mendil: x: 1258, y: 488, w: 98, h: 58
  const catWipes = img.clone().crop({ x: 1258, y: 488, w: 98, h: 58 });
  await catWipes.write(path.join(outDir, 'cat_wipes.png'));

  // Beslenme (Bowl): x: 1145, y: 555, w: 98, h: 58
  const catBowl = img.clone().crop({ x: 1145, y: 555, w: 98, h: 58 });
  await catBowl.write(path.join(outDir, 'cat_bowl.png'));

  // Banyo (Soap): x: 1258, y: 555, w: 98, h: 58
  const catSoap = img.clone().crop({ x: 1258, y: 555, w: 98, h: 58 });
  await catSoap.write(path.join(outDir, 'cat_soap.png'));

  // Products:
  // Jar: x: 1150, y: 658, w: 104, h: 95
  const prodJar = img.clone().crop({ x: 1150, y: 658, w: 104, h: 95 });
  await prodJar.write(path.join(outDir, 'prod_jar.png'));

  // Wipes pack: x: 1260, y: 658, w: 104, h: 95
  const prodWipes = img.clone().crop({ x: 1260, y: 658, w: 104, h: 95 });
  await prodWipes.write(path.join(outDir, 'prod_wipes.png'));

  // Melon on Phone 2:
  // x: 318, y: 432, w: 60, h: 60
  const melon = img.clone().crop({ x: 318, y: 432, w: 60, h: 60 });
  await melon.write(path.join(outDir, 'fruit_melon.png'));

  // Topluluk Forum post photo on Phone 6:
  // x: 1590, y: 665, w: 60, h: 60
  const forumPhoto = img.clone().crop({ x: 1590, y: 665, w: 60, h: 60 });
  await forumPhoto.write(path.join(outDir, 'forum_photo.png'));

  // Postpartum Leaf icon:
  // x: 808, y: 715, w: 28, h: 28
  const leafIcon = img.clone().crop({ x: 808, y: 715, w: 28, h: 28 });
  await leafIcon.write(path.join(outDir, 'leaf_icon.png'));

  console.log('Fine-tuned extraction completed!');
}

fineTune().catch(console.error);

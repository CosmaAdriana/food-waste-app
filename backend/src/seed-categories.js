import prisma from './config/prisma.js';

const categories = [
  'Lactate',
  'Carne',
  'Pește',
  'Legume',
  'Fructe',
  'Pâine',
  'Dulciuri',
  'Băuturi',
  'Condimente',
  'Altele'
];

async function seedCategories() {
  console.log('Adăugare categorii...');

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    });
  }

  console.log('Categorii adăugate cu succes!');
  process.exit(0);
}

seedCategories().catch((error) => {
  console.error('Eroare la adăugare categorii:', error);
  process.exit(1);
});

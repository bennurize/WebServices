/* global db */
// Already enriched recipes, inserted by the MongoDB image on the first start
// of recipe-db (empty volume only). The owners are the user-db fixtures.

const ALICE = '665f00000000000000000001';
const BOB = '665f00000000000000000002';
const CHLOE = '665f00000000000000000003';
const HOUR = 3600 * 1000;

function recipe(hoursAgo, ownerId, title, ingredients, steps, description) {
  const date = new Date(Date.now() - hoursAgo * HOUR);

  return {
    createdAt: date,
    description,
    ingredients,
    ownerId,
    status: 'done',
    steps,
    title,
    updatedAt: date,
  };
}

db.getSiblingDB('recipes').recipes.insertMany([
  recipe(
    1,
    ALICE,
    'Tarte aux pommes',
    ['pommes', 'pâte brisée', 'sucre', 'beurre'],
    [
      'Étaler la pâte',
      'Disposer les pommes en rosace',
      'Cuire 35 min à 180 °C',
    ],
    'Une tarte fondante aux pommes caramélisées, sur une pâte croustillante. Le dessert des dimanches en famille.',
  ),
  recipe(
    3,
    BOB,
    'Ratatouille',
    ['courgettes', 'aubergines', 'poivrons', 'tomates', 'herbes de Provence'],
    [
      'Couper les légumes en dés',
      'Les faire revenir séparément',
      'Mijoter 45 min',
    ],
    'Les légumes du soleil mijotés doucement aux herbes de Provence. Encore meilleure réchauffée le lendemain.',
  ),
  recipe(
    6,
    CHLOE,
    'Velouté de potimarron',
    ['potimarron', 'oignon', 'bouillon de légumes', 'crème'],
    [
      'Couper le potimarron',
      'Cuire 25 min dans le bouillon',
      'Mixer avec la crème',
    ],
    'Un velouté doux et réconfortant, à la couleur orangée des soirées d’automne.',
  ),
  recipe(
    24,
    ALICE,
    'Crêpes',
    ['farine', 'oeufs', 'lait', 'beurre fondu'],
    [
      'Mélanger farine et oeufs',
      'Ajouter le lait petit à petit',
      'Cuire à la poêle',
    ],
    'Des crêpes fines et légères, à garnir de sucre, de confiture ou de chocolat.',
  ),
  recipe(
    48,
    BOB,
    'Risotto aux champignons',
    [
      'riz arborio',
      'champignons de Paris',
      'parmesan',
      'bouillon',
      'vin blanc',
    ],
    [
      'Nacrer le riz',
      'Mouiller au bouillon louche par louche',
      'Ajouter champignons et parmesan',
    ],
    'Un risotto crémeux aux champignons poêlés, relevé de parmesan. Patience et cuillère en bois de rigueur.',
  ),
]);

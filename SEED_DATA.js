// Apps Script Helper - Run this in Apps Script Console to seed initial data
// Copy and paste this code into Apps Script Editor and run seedInitialData()

function seedInitialData() {
  // Seed Creators
  const creatorsSheet = getSheet_('Creators');
  
  const creators = [
    {
      name: 'Cook with Kaju',
      avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
      bio: '🥘 Dil se banao, maze se khao!',
      youtubeUrl: 'https://youtube.com/@cookwithkaju',
      instagramUrl: 'https://instagram.com/cookwithkaju',
      facebookUrl: 'https://facebook.com/cookwithkaju',
      threadsUrl: 'https://threads.net/@cookwithkaju',
    },
    {
      name: 'Chef Maria',
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
      bio: 'Baking and desserts are my love language.',
      youtubeUrl: 'https://youtube.com/chefmaria',
      instagramUrl: 'https://instagram.com/chefmaria',
      facebookUrl: '',
      threadsUrl: '',
    },
    {
      name: 'Healthy Eats',
      avatarUrl: 'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=400&h=400&fit=crop',
      bio: 'Wholesome, nutritious, and delicious recipes.',
      youtubeUrl: 'https://youtube.com/healthyeats',
      instagramUrl: 'https://instagram.com/healthyeats',
      facebookUrl: 'https://facebook.com/healthyeats',
      threadsUrl: 'https://threads.net/@healthyeats',
    }
  ];

  // Get existing creator IDs to avoid duplicates
  const existingRows = creatorsSheet.getDataRange().getValues();
  const now = Date.now();
  
  creators.forEach(creator => {
    const exists = existingRows.slice(1).some(row => String(row[1]).toLowerCase() === creator.name.toLowerCase());
    if (!exists) {
      creatorsSheet.appendRow([
        Utilities.getUuid(),
        creator.name,
        creator.avatarUrl,
        creator.bio,
        creator.youtubeUrl,
        creator.instagramUrl,
        creator.facebookUrl,
        creator.threadsUrl,
        '',
        now,
        now,
      ]);
    }
  });

  Logger.log(`✅ ${creators.length} creators seeded`);

  // Seed Recipes
  const recipesSheet = getSheet_('Recipes');
  const creatorsData = getCreators_();
  
  // Get first creator ID for linking recipes
  const firstCreatorId = creatorsData.length > 0 ? creatorsData[0].id : '';

  const recipes = [
    {
      title: 'Mango Summer Shake',
      category: 'Shakes',
      description: 'A refreshing tropical blend perfect for hot summer days.',
      ingredients: JSON.stringify(['1 ripe mango', '1 cup milk', '2 tbsp honey', 'Ice cubes']),
      steps: JSON.stringify(['Peel and chop mango', 'Blend all ingredients', 'Serve chilled']),
      imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=400&h=400&fit=crop',
      featured: true,
    },
    {
      title: 'Healthy Buddha Bowl',
      category: 'Healthy',
      description: 'A nutrient-dense bowl filled with fresh vegetables and grains.',
      ingredients: JSON.stringify(['Quinoa', 'Avocado', 'Chickpeas', 'Spinach', 'Tahini dressing']),
      steps: JSON.stringify(['Cook quinoa', 'Assemble bowl', 'Drizzle with tahini']),
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&h=400&fit=crop',
      featured: true,
    },
    {
      title: 'Crispy Avocado Toast',
      category: 'Healthy',
      description: 'The golden classic for a perfect breakfast or brunch.',
      ingredients: JSON.stringify(['Sourdough bread', 'Ripe avocado', 'Chili flakes', 'Lemon', 'Poached egg']),
      steps: JSON.stringify(['Toast the bread', 'Mash avocado with lemon and salt', 'Spread on toast', 'Top with egg and chili']),
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400&h=400&fit=crop',
      featured: true,
    },
    {
      title: 'Blueberry Cheesecake',
      category: 'Desserts',
      description: 'Creamy, rich, and topped with a fresh blueberry compote.',
      ingredients: JSON.stringify(['Cream cheese', 'Graham crackers', 'Sugar', 'Blueberries', 'Butter']),
      steps: JSON.stringify(['Make the crust', 'Mix cream cheese filling', 'Bake and chill', 'Add blueberry topping']),
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&h=400&fit=crop',
      featured: false,
    },
    {
      title: 'Classic Cheeseburger',
      category: 'Fast Food',
      description: 'Juicy beef patty with melted cheddar and fresh toppings.',
      ingredients: JSON.stringify(['Beef patty', 'Cheddar cheese', 'Brioche bun', 'Lettuce', 'Tomato']),
      steps: JSON.stringify(['Grill the patty', 'Toast buns', 'Assemble with toppings', 'Serve with fries']),
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&h=400&fit=crop',
      featured: false,
    },
    {
      title: 'Indian Butter Chicken',
      category: 'Traditional',
      description: 'A creamy, rich tomato-based curry with tender pieces of chicken.',
      ingredients: JSON.stringify(['Chicken breast', 'Tomato puree', 'Butter', 'Cream', 'Garam masala']),
      steps: JSON.stringify(['Marinate chicken', 'Sauté in spices', 'Simmer in tomato gravy', 'Finish with cream']),
      imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&h=400&fit=crop',
      featured: true,
    }
  ];

  const existingRecipeRows = recipesSheet.getDataRange().getValues();

  recipes.forEach(recipe => {
    const exists = existingRecipeRows.slice(1).some(row => String(row[1]).toLowerCase() === recipe.title.toLowerCase());
    if (!exists && firstCreatorId) {
      const slug = slugify_(recipe.title);
      recipesSheet.appendRow([
        Utilities.getUuid(),
        recipe.title,
        slug,
        recipe.category,
        recipe.description,
        recipe.ingredients,
        recipe.steps,
        recipe.imageUrl,
        0, // likes
        recipe.featured ? 'true' : 'false',
        firstCreatorId,
        now,
        now,
      ]);
    }
  });

  Logger.log(`✅ ${recipes.length} recipes seeded`);
  Logger.log('✅ Initial data seeding complete!');
}

// Helper function to get a sheet
function getSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('Missing sheet: ' + name);
  }
  return sheet;
}

// Copy getCreators_ and slugify_ from Code.gs for this to work in standalone script

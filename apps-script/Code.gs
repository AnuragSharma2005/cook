const SHEETS = {
  USERS: 'Users',
  SESSIONS: 'Sessions',
  POSTS: 'Posts',
  CREATORS: 'Creators',
  RECIPES: 'Recipes',
};

const HEADERS = {
  USERS: ['id', 'email', 'passwordHash', 'role', 'name', 'avatarUrl', 'bio', 'youtubeUrl', 'instagramUrl', 'facebookUrl', 'threadsUrl', 'twitterUrl', 'isActive', 'createdAt', 'updatedAt'],
  SESSIONS: ['token', 'userId', 'createdAt', 'expiresAt'],
  POSTS: ['id', 'userId', 'title', 'content', 'imageUrl', 'status', 'createdAt', 'updatedAt'],
  CREATORS: ['id', 'name', 'avatarUrl', 'bio', 'youtubeUrl', 'instagramUrl', 'facebookUrl', 'threadsUrl', 'twitterUrl', 'createdAt', 'updatedAt'],
  RECIPES: ['id', 'title', 'slug', 'category', 'description', 'ingredients', 'steps', 'imageUrl', 'likes', 'featured', 'creatorId', 'createdAt', 'updatedAt'],
};

function doGet() {
  return jsonResponse_({ ok: true, data: { service: 'cook-with-kaju-app-script', status: 'ok' } });
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action;

    ensureSetup_();

    switch (action) {
      case 'login':
        return handleLogin_(params);
      case 'me':
        return handleMe_(params);
      case 'logout':
        return handleLogout_(params);
      case 'listCollaborators':
        return handleListCollaborators_(params);
      case 'createCollaborator':
        return handleCreateCollaborator_(params);
      case 'updateCollaborator':
        return handleUpdateCollaborator_(params);
      case 'listMyPosts':
        return handleListMyPosts_(params);
      case 'savePost':
        return handleSavePost_(params);
      case 'listCreators':
        return handleListCreators_(params);
      case 'createCreator':
        return handleCreateCreator_(params);
      case 'updateCreator':
        return handleUpdateCreator_(params);
      case 'listRecipes':
        return handleListRecipes_(params);
      case 'adjustRecipeLikes':
        return handleAdjustRecipeLikes_(params);
      case 'createRecipe':
        return handleCreateRecipe_(params);
      case 'updateRecipe':
        return handleUpdateRecipe_(params);
      default:
        throw new Error('Unknown action: ' + action);
    }
  } catch (error) {
    return jsonResponse_({ ok: false, error: error && error.message ? error.message : 'Unexpected error' });
  }
}

function ensureSetup_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.entries(HEADERS).forEach(([sheetName, headers]) => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
  });

  seedAdminIfNeeded_();
}

function seedAdminIfNeeded_() {
  const adminEmail = getProperty_('ADMIN_EMAIL') || 'admin@cookwithkaju.com';
  const adminPassword = getProperty_('ADMIN_PASSWORD') || 'change-me-now';
  const adminName = getProperty_('ADMIN_NAME') || 'Main Admin';

  const usersSheet = getSheet_(SHEETS.USERS);
  const rows = usersSheet.getDataRange().getValues();
  const existingAdmin = rows.slice(1).some((row) => String(row[1]).toLowerCase() === adminEmail.toLowerCase());
  if (existingAdmin) return;

  usersSheet.appendRow([
    Utilities.getUuid(),
    adminEmail,
    hashPassword_(adminPassword),
    'admin',
    adminName,
    '',
    'Primary administrator for Cook With Kaju.',
    '',
    '',
    '',
    '',
    '',
    'true',
    Date.now(),
    Date.now(),
  ]);
}

function handleLogin_(params) {
  const email = normalizeEmail_(params.email);
  const password = String(params.password || '');
  const user = findUserByEmail_(email);

  if (!user) {
    throw new Error('Invalid login. Only admin-created accounts can sign in.');
  }

  if (String(user.isActive) !== 'true') {
    throw new Error('This account is disabled.');
  }

  if (user.passwordHash !== hashPassword_(password)) {
    throw new Error('Invalid login. Only admin-created accounts can sign in.');
  }

  const token = Utilities.getUuid();
  const session = {
    token,
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };

  appendRow_(SHEETS.SESSIONS, [session.token, session.userId, session.createdAt, session.expiresAt]);

  return jsonResponse_({ ok: true, data: { token, user: sanitizeUser_(user), role: user.role } });
}

function handleMe_(params) {
  const session = getSessionByToken_(String(params.token || ''));
  if (!session) {
    throw new Error('Invalid session.');
  }

  const user = findUserById_(session.userId);
  if (!user || String(user.isActive) !== 'true') {
    throw new Error('Invalid session.');
  }

  return jsonResponse_({ ok: true, data: { token: session.token, user: sanitizeUser_(user) } });
}

function handleLogout_(params) {
  const token = String(params.token || '');
  deleteSessionByToken_(token);
  return jsonResponse_({ ok: true, data: { success: true } });
}

function handleListCollaborators_(params) {
  const admin = requireAdmin_(String(params.token || ''));
  if (!admin) {
    throw new Error('Admin access required.');
  }

  // Return accounts that are collaborators OR creators (unified model)
  const collaborators = getUsers_().filter((user) => String(user.role) === 'collaborator' || String(user.role) === 'creator');
  return jsonResponse_({ ok: true, data: collaborators.map(sanitizeUser_) });
}

function handleCreateCollaborator_(params) {
  requireAdmin_(String(params.token || ''));

  const email = normalizeEmail_(params.email);
  if (!email) throw new Error('Email is required.');
  if (findUserByEmail_(email)) throw new Error('This email already exists.');

  const password = String(params.password || '');
  if (!password) throw new Error('Password is required.');

  const now = Date.now();
  const user = {
    id: Utilities.getUuid(),
    email,
    passwordHash: hashPassword_(password),
    // Treat admin-created collaborator accounts as creators by default
    role: String(params.role || 'creator'),
    name: String(params.name || '').trim() || email.split('@')[0],
    avatarUrl: String(params.avatarUrl || ''),
    bio: String(params.bio || ''),
    youtubeUrl: String(params.youtubeUrl || ''),
    instagramUrl: String(params.instagramUrl || ''),
    facebookUrl: String(params.facebookUrl || ''),
    threadsUrl: String(params.threadsUrl || ''),
    twitterUrl: String(params.twitterUrl || ''),
    isActive: String(params.isActive || 'true') === 'true' ? 'true' : 'false',
    createdAt: now,
    updatedAt: now,
  };

  appendRow_(SHEETS.USERS, [
    user.id,
    user.email,
    user.passwordHash,
    user.role,
    user.name,
    user.avatarUrl,
    user.bio,
    user.youtubeUrl,
    user.instagramUrl,
    user.facebookUrl,
    user.threadsUrl,
    user.twitterUrl,
    user.isActive,
    user.createdAt,
    user.updatedAt,
  ]);

  // Also create a corresponding Creator entry so collaborators can appear as creators on the site
  try {
    appendRow_(SHEETS.CREATORS, [
      user.id,
      user.name,
      user.avatarUrl,
      user.bio,
      user.youtubeUrl,
      user.instagramUrl,
      user.facebookUrl,
      user.threadsUrl,
      user.twitterUrl,
      user.createdAt,
      user.updatedAt,
    ]);
  } catch (e) {
    // Don't fail collaborator creation if creators sheet append fails; log for debugging
    Logger.log('Failed to create linked creator for user ' + user.id + ': ' + (e && e.message ? e.message : e));
  }

  return jsonResponse_({ ok: true, data: sanitizeUser_(user) });
}

function handleUpdateCollaborator_(params) {
  const currentUser = requireAnyAuthenticatedUser_(String(params.token || ''));
  if (!currentUser) {
    throw new Error('Login required.');
  }

  const targetId = String(params.id || currentUser.id);
  if (currentUser.role !== 'admin' && currentUser.id !== targetId) {
    throw new Error('You can only update your own profile.');
  }

  const usersSheet = getSheet_(SHEETS.USERS);
  const rows = usersSheet.getDataRange().getValues();
  const header = rows.shift();
  const rowIndex = rows.findIndex((row) => String(row[0]) === targetId);
  if (rowIndex === -1) {
    throw new Error('User not found.');
  }

  const rowNumber = rowIndex + 2;
  const existing = rows[rowIndex];
  const updated = {
    id: existing[0],
    email: String(params.email || existing[1]).trim().toLowerCase(),
    passwordHash: existing[2],
    role: existing[3],
    name: String(params.name || existing[4]).trim() || existing[4],
    avatarUrl: String(params.avatarUrl || existing[5] || ''),
    bio: String(params.bio || existing[6] || ''),
    youtubeUrl: String(params.youtubeUrl || existing[7] || ''),
    instagramUrl: String(params.instagramUrl || existing[8] || ''),
    facebookUrl: String(params.facebookUrl || existing[9] || ''),
    threadsUrl: String(params.threadsUrl || existing[10] || ''),
    twitterUrl: String(params.twitterUrl || existing[11] || ''),
    isActive: String(typeof params.isActive === 'undefined' ? existing[12] : params.isActive) === 'true' ? 'true' : 'false',
    createdAt: existing[13],
    updatedAt: Date.now(),
  };

  usersSheet.getRange(rowNumber, 1, 1, header.length).setValues([[
    updated.id,
    updated.email,
    updated.passwordHash,
    updated.role,
    updated.name,
    updated.avatarUrl,
    updated.bio,
    updated.youtubeUrl,
    updated.instagramUrl,
    updated.facebookUrl,
    updated.threadsUrl,
    updated.twitterUrl,
    updated.isActive,
    updated.createdAt,
    updated.updatedAt,
  ]]);

  return jsonResponse_({ ok: true, data: sanitizeUser_(updated) });
}

function handleListMyPosts_(params) {
  const user = requireAnyAuthenticatedUser_(String(params.token || ''));
  if (!user) {
    throw new Error('Login required.');
  }

  const posts = getPosts_().filter((post) => post.userId === user.id);
  return jsonResponse_({ ok: true, data: posts });
}

function handleSavePost_(params) {
  const user = requireAnyAuthenticatedUser_(String(params.token || ''));
  if (!user) {
    throw new Error('Login required.');
  }

  const postsSheet = getSheet_(SHEETS.POSTS);
  const rows = postsSheet.getDataRange().getValues();
  const header = rows.shift();
  const now = Date.now();
  const postId = String(params.id || Utilities.getUuid());
  const existingIndex = rows.findIndex((row) => String(row[0]) === postId && String(row[1]) === user.id);

  const post = {
    id: postId,
    userId: user.id,
    title: String(params.title || '').trim(),
    content: String(params.content || '').trim(),
    imageUrl: String(params.imageUrl || '').trim(),
    status: String(params.status || 'published') === 'draft' ? 'draft' : 'published',
    createdAt: now,
    updatedAt: now,
  };

  if (!post.title || !post.content) {
    throw new Error('Title and content are required.');
  }

  if (existingIndex === -1) {
    appendRow_(SHEETS.POSTS, [post.id, post.userId, post.title, post.content, post.imageUrl, post.status, post.createdAt, post.updatedAt]);
  } else {
    const rowNumber = existingIndex + 2;
    const existing = rows[existingIndex];
    postsSheet.getRange(rowNumber, 1, 1, header.length).setValues([[
      post.id,
      post.userId,
      post.title,
      post.content,
      post.imageUrl,
      post.status,
      existing[6],
      post.updatedAt,
    ]]);
  }

  return jsonResponse_({ ok: true, data: post });
}

function handleListCreators_(params) {
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize || 12)));
  const creators = getCreators_();
  const paginated = paginateItems_(creators, page, pageSize);
  return jsonResponse_({ ok: true, data: paginated });
}

function handleCreateCreator_(params) {
  requireAdmin_(String(params.token || ''));

  const now = Date.now();
  const creator = {
    id: Utilities.getUuid(),
    name: String(params.name || '').trim() || 'Unnamed Creator',
    avatarUrl: String(params.avatarUrl || ''),
    bio: String(params.bio || ''),
    youtubeUrl: String(params.youtubeUrl || ''),
    instagramUrl: String(params.instagramUrl || ''),
    facebookUrl: String(params.facebookUrl || ''),
    threadsUrl: String(params.threadsUrl || ''),
    twitterUrl: String(params.twitterUrl || ''),
    createdAt: now,
    updatedAt: now,
  };

  appendRow_(SHEETS.CREATORS, [
    creator.id,
    creator.name,
    creator.avatarUrl,
    creator.bio,
    creator.youtubeUrl,
    creator.instagramUrl,
    creator.facebookUrl,
    creator.threadsUrl,
    creator.twitterUrl,
    creator.createdAt,
    creator.updatedAt,
  ]);

  return jsonResponse_({ ok: true, data: creator });
}

function getCreators_() {
  // Prefer 'creator' users from the Users sheet (unified model), but also include
  // legacy rows from the Creators sheet that don't have a matching user id.
  const users = getUsers_();
  const userCreators = users
    .filter((u) => String(u.role) === 'creator')
    .map((u) => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl || '',
      bio: u.bio || '',
      youtubeUrl: u.youtubeUrl || '',
      instagramUrl: u.instagramUrl || '',
      facebookUrl: u.facebookUrl || '',
      threadsUrl: u.threadsUrl || '',
      twitterUrl: u.twitterUrl || '',
    }));

  const sheetCreators = readSheetObjects_(SHEETS.CREATORS).map((c) => ({
    id: c.id,
    name: c.name,
    avatarUrl: c.avatarUrl || '',
    bio: c.bio || '',
    youtubeUrl: c.youtubeUrl || '',
    instagramUrl: c.instagramUrl || '',
    facebookUrl: c.facebookUrl || '',
    threadsUrl: c.threadsUrl || '',
    twitterUrl: c.twitterUrl || '',
  }));

  // Merge: include sheet creators only if their id is not present in userCreators
  const existingIds = userCreators.map((c) => String(c.id));
  const merged = userCreators.concat(sheetCreators.filter((c) => !existingIds.includes(String(c.id))));
  return merged;
}

function getRecipes_() {
  return readSheetObjects_(SHEETS.RECIPES).map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    category: recipe.category,
    description: recipe.description || '',
    ingredients: parseArray_(recipe.ingredients),
    steps: parseArray_(recipe.steps),
    imageUrl: recipe.imageUrl || '',
    likes: Number(recipe.likes) || 0,
    featured: String(recipe.featured) === 'true',
    creatorId: recipe.creatorId || '',
    createdAt: Number(recipe.createdAt) || Date.now(),
  }));
}

function slugify_(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArray_(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [String(value)];
  } catch {
    return String(value).split('\n').filter(item => item.trim());
  }
}

function handleUpdateCreator_(params) {
  requireAdmin_(String(params.token || ''));

  const creatorsSheet = getSheet_(SHEETS.CREATORS);
  const rows = creatorsSheet.getDataRange().getValues();
  const header = rows.shift();
  const creatorId = String(params.id || '');
  const rowIndex = rows.findIndex((row) => String(row[0]) === creatorId);

  if (rowIndex === -1) {
    throw new Error('Creator not found.');
  }

  const rowNumber = rowIndex + 2;
  const existing = rows[rowIndex];
  const now = Date.now();

  const updated = {
    id: existing[0],
    name: String(params.name || existing[1]).trim() || existing[1],
    avatarUrl: String(params.avatarUrl || existing[2] || ''),
    bio: String(params.bio || existing[3] || ''),
    youtubeUrl: String(params.youtubeUrl || existing[4] || ''),
    instagramUrl: String(params.instagramUrl || existing[5] || ''),
    facebookUrl: String(params.facebookUrl || existing[6] || ''),
    threadsUrl: String(params.threadsUrl || existing[7] || ''),
    twitterUrl: String(params.twitterUrl || existing[8] || ''),
    createdAt: existing[9],
    updatedAt: now,
  };

  creatorsSheet.getRange(rowNumber, 1, 1, header.length).setValues([[
    updated.id,
    updated.name,
    updated.avatarUrl,
    updated.bio,
    updated.youtubeUrl,
    updated.instagramUrl,
    updated.facebookUrl,
    updated.threadsUrl,
    updated.twitterUrl,
    updated.createdAt,
    updated.updatedAt,
  ]]);

  return jsonResponse_({ ok: true, data: updated });
}

function handleListRecipes_(params) {
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.min(1000, Math.max(1, Number(params.pageSize || 12)));
  const recipes = getRecipes_().sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  const paginated = paginateItems_(recipes, page, pageSize);
  return jsonResponse_({ ok: true, data: paginated });
}

function handleAdjustRecipeLikes_(params) {
  const recipeId = String(params.id || '');
  const delta = Number(params.delta || 0);

  if (!recipeId) {
    throw new Error('Recipe id is required.');
  }

  if (![-1, 1].includes(delta)) {
    throw new Error('Delta must be 1 or -1.');
  }

  const recipesSheet = getSheet_(SHEETS.RECIPES);
  const rows = recipesSheet.getDataRange().getValues();
  const header = rows.shift();
  const rowIndex = rows.findIndex((row) => String(row[0]) === recipeId);

  if (rowIndex === -1) {
    throw new Error('Recipe not found.');
  }

  const rowNumber = rowIndex + 2;
  const existing = rows[rowIndex];
  const nextLikes = Math.max(0, (Number(existing[8]) || 0) + delta);

  recipesSheet.getRange(rowNumber, 1, 1, header.length).setValues([[
    existing[0],
    existing[1],
    existing[2],
    existing[3],
    existing[4],
    existing[5],
    existing[6],
    existing[7],
    nextLikes,
    existing[9],
    existing[10],
    existing[11],
    Date.now(),
  ]]);

  return jsonResponse_({ ok: true, data: { id: recipeId, likes: nextLikes } });
}

function handleCreateRecipe_(params) {
  // Allow authenticated creators (or admin) to create recipes from their account.
  const user = requireAnyAuthenticatedUser_(String(params.token || ''));
  if (!user) throw new Error('Login required.');
  if (!(user.role === 'creator' || user.role === 'admin')) {
    throw new Error('Only creators can create recipes.');
  }

  const now = Date.now();
  const recipe = {
    id: Utilities.getUuid(),
    title: String(params.title || '').trim() || 'Untitled Recipe',
    slug: String(params.slug || slugify_(String(params.title || ''))),
    category: String(params.category || 'Other'),
    description: String(params.description || ''),
    ingredients: String(params.ingredients || ''),
    steps: String(params.steps || ''),
    imageUrl: String(params.imageUrl || ''),
    likes: Number(params.likes || 0),
    featured: String(params.featured || 'false') === 'true' ? 'true' : 'false',
    // default to the authenticated user's id if not provided
    creatorId: String(params.creatorId || user.id),
    createdAt: now,
    updatedAt: now,
  };

  appendRow_(SHEETS.RECIPES, [
    recipe.id,
    recipe.title,
    recipe.slug,
    recipe.category,
    recipe.description,
    recipe.ingredients,
    recipe.steps,
    recipe.imageUrl,
    recipe.likes,
    recipe.featured,
    recipe.creatorId,
    recipe.createdAt,
    recipe.updatedAt,
  ]);

  return jsonResponse_({ ok: true, data: recipe });
}

function handleUpdateRecipe_(params) {
  // Allow admin or the recipe's creator to update a recipe.
  const user = requireAnyAuthenticatedUser_(String(params.token || ''));
  if (!user) throw new Error('Login required.');

  const recipesSheet = getSheet_(SHEETS.RECIPES);
  const rows = recipesSheet.getDataRange().getValues();
  const header = rows.shift();
  const recipeId = String(params.id || '');
  const rowIndex = rows.findIndex((row) => String(row[0]) === recipeId);

  if (rowIndex === -1) {
    throw new Error('Recipe not found.');
  }

  const existing = rows[rowIndex];
  const existingCreatorId = String(existing[10] || '');
  if (!(user.role === 'admin' || user.id === existingCreatorId)) {
    throw new Error('You can only update recipes you own, unless you are an admin.');
  }
  const rowNumber = rowIndex + 2;
  const now = Date.now();

  const updated = {
    id: existing[0],
    title: String(params.title || existing[1]).trim() || existing[1],
    slug: String(params.slug || existing[2]),
    category: String(params.category || existing[3]),
    description: String(params.description || existing[4] || ''),
    ingredients: String(params.ingredients || existing[5] || ''),
    steps: String(params.steps || existing[6] || ''),
    imageUrl: String(params.imageUrl || existing[7] || ''),
    likes: Number(params.likes !== undefined ? params.likes : existing[8]),
    featured: String(typeof params.featured === 'undefined' ? existing[9] : params.featured) === 'true' ? 'true' : 'false',
    creatorId: String(params.creatorId || existing[10] || ''),
    createdAt: existing[11],
    updatedAt: now,
  };

  recipesSheet.getRange(rowNumber, 1, 1, header.length).setValues([[
    updated.id,
    updated.title,
    updated.slug,
    updated.category,
    updated.description,
    updated.ingredients,
    updated.steps,
    updated.imageUrl,
    updated.likes,
    updated.featured,
    updated.creatorId,
    updated.createdAt,
    updated.updatedAt,
  ]]);

  return jsonResponse_({ ok: true, data: updated });
}

function requireAdmin_(token) {
  const user = requireAnyAuthenticatedUser_(token);
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required.');
  }

  return user;
}

function requireAnyAuthenticatedUser_(token) {
  const session = getSessionByToken_(token);
  if (!session) return null;

  const user = findUserById_(session.userId);
  if (!user || String(user.isActive) !== 'true') return null;

  return user;
}

function getUsers_() {
  return readSheetObjects_(SHEETS.USERS);
}

function getPosts_() {
  return readSheetObjects_(SHEETS.POSTS);
}

function findUserByEmail_(email) {
  return getUsers_().find((user) => String(user.email).toLowerCase() === email);
}

function findUserById_(id) {
  return getUsers_().find((user) => String(user.id) === String(id));
}

function getSessionByToken_(token) {
  return readSheetObjects_(SHEETS.SESSIONS).find((session) => String(session.token) === token && Number(session.expiresAt) > Date.now());
}

function deleteSessionByToken_(token) {
  const sheet = getSheet_(SHEETS.SESSIONS);
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1);
  const index = rows.findIndex((row) => String(row[0]) === token);
  if (index === -1) return;
  sheet.deleteRow(index + 2);
}

function sanitizeUser_(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl || '',
    bio: user.bio || '',
    youtubeUrl: user.youtubeUrl || '',
    instagramUrl: user.instagramUrl || '',
    facebookUrl: user.facebookUrl || '',
    threadsUrl: user.threadsUrl || '',
    twitterUrl: user.twitterUrl || '',
    isActive: String(user.isActive) === 'true',
    createdAt: Number(user.createdAt) || Date.now(),
    updatedAt: Number(user.updatedAt) || Date.now(),
  };
}

function readSheetObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  return values.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[String(header)] = row[index];
    });
    return item;
  });
}

function appendRow_(sheetName, row) {
  getSheet_(sheetName).appendRow(row);
}

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('Missing sheet: ' + name);
  }
  return sheet;
}

function hashPassword_(password) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8);
  return bytes.map((byte) => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0')).join('');
}

function normalizeEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

function getProperty_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function configureAdminSeed() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    ADMIN_EMAIL: 'admin@cookwithkaju.com',
    ADMIN_PASSWORD: 'change-me-now',
    ADMIN_NAME: 'Main Admin'
  }, true);

  ensureSetup_();
  Logger.log('Admin seed configured and setup ensured.');
}

function verifyAdminSeed() {
  const email = 'admin@cookwithkaju.com';
  const user = findUserByEmail_(email);
  if (!user) {
    Logger.log('Admin not found for: ' + email);
    return;
  }

  Logger.log(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    isActive: user.isActive
  }));
}

function paginateItems_(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    page: currentPage,
    pageSize,
    total,
    totalPages,
  };
}
# Sheet Data Integration Guide

## Overview
All creators, recipes, and other content is now fetched from Google Sheets instead of hardcoded demo data. The website syncs automatically with your sheet data.

## Getting Started

### 1. Access Admin Dashboard
- Go to `/admin` on your website
- Login with admin credentials (admin@cookwithkaju.com by default)

### 2. Manage Creators
1. Click the **"Creators"** tab
2. Fill in the creator form:
   - **Name** (required): Creator's display name
   - **Bio**: Short description
   - **Avatar URL**: Link to creator's image
   - **Social URLs**: YouTube, Instagram, Facebook, Threads, Twitter
3. Click **"Add Creator"**
4. Creator appears instantly in the app under the Creators page and homepage

### 3. Manage Recipes
1. Click the **"Recipes"** tab
2. Fill in the recipe form:
   - **Title** (required): Recipe name
   - **Category**: Type of recipe (e.g., "Healthy", "Desserts", "Traditional")
   - **Creator**: Select which creator this recipe belongs to
   - **Description**: Recipe overview
   - **Image URL**: Link to recipe image
   - **Ingredients**: One per line (or as JSON array)
   - **Steps**: One per line (or as JSON array)
   - **Featured**: Check if this is a featured recipe
3. Click **"Add Recipe"**
4. Recipe appears on homepage and can be viewed with full details

### 4. Data Structure in Google Sheets

#### Creators Sheet
Columns: `id`, `name`, `avatarUrl`, `bio`, `youtubeUrl`, `instagramUrl`, `facebookUrl`, `threadsUrl`, `twitterUrl`, `createdAt`, `updatedAt`

#### Recipes Sheet
Columns: `id`, `title`, `slug`, `category`, `description`, `ingredients`, `steps`, `imageUrl`, `likes`, `featured`, `creatorId`, `createdAt`, `updatedAt`

### 5. How Data Syncing Works

- **First Load**: Website fetches all data from sheets on page load
- **Caching**: Data is cached locally for 5 minutes to avoid excessive API calls
- **Real-time Updates**: After adding new creators/recipes, click refresh to see updates immediately
- **Fallback**: If sheets are unavailable, website uses cached data

## Features

✅ **Add Creators** - Create new content creators with social media links
✅ **Add Recipes** - Upload recipes with ingredients, steps, and images
✅ **Real-time Sync** - Changes appear instantly on the website
✅ **Admin Controlled** - Only admins can modify content
✅ **Multiple Creators** - Each recipe links to a specific creator
✅ **Featured Recipes** - Mark recipes as featured for homepage highlighting
✅ **Auto Slug Generation** - Recipe URLs are auto-generated from titles

## Troubleshooting

**Issue**: Creator/Recipe not appearing
- **Solution**: Refresh the page or clear browser cache

**Issue**: Getting "Admin access required" error
- **Solution**: Make sure you're logged in with an admin account

**Issue**: Unable to add creator/recipe
- **Solution**: Check all required fields are filled (marked with *)

**Issue**: Data seems outdated
- **Solution**: Wait 5 minutes for cache to expire or refresh manually

## Example Data

### Example Creator
```
Name: Chef Maria
Bio: Baking and desserts are my love language.
Avatar URL: https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop
Instagram: https://instagram.com/chefmaria
YouTube: https://youtube.com/chefmaria
```

### Example Recipe
```
Title: Chocolate Chip Cookies
Category: Desserts
Creator: Chef Maria
Description: Soft and chewy cookies with chocolate chips
Image URL: https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop
Ingredients:
- 2 cups flour
- 1 cup butter
- 1 cup chocolate chips
- 2 eggs
- 1 tsp vanilla extract

Steps:
- Mix butter and sugar
- Add eggs and vanilla
- Mix in flour
- Fold in chocolate chips
- Bake at 350°F for 12 minutes
```

## Next Steps

1. Open Admin Dashboard at `/admin`
2. Add your first creator
3. Add recipes linked to that creator
4. Visit `/creators` page to see all creators
5. Visit homepage to see featured recipes

Happy cooking! 🍳

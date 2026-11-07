import { shopflowDb } from './src/db/database.ts';

const email = 'ra2826572@gmail.com';
const profile = shopflowDb.getProfileByEmail(email);

if (profile) {
  const shop = profile.shop_id 
    ? shopflowDb.getShopById(profile.shop_id) 
    : shopflowDb.getShopByOwnerId(profile.id);

  const response = {
    success: true,
    user: {
      id: profile.id,
      role: profile.role,
      shop_id: shop ? shop.id : null,
      shopName: shop ? shop.name : '',
      needsShopSetup: !shop
    },
    shop: shop || null
  };
  console.log(JSON.stringify(response, null, 2));
} else {
  console.log(JSON.stringify({ success: false, error: 'Not found' }));
}

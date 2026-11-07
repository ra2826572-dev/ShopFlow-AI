import express from 'express';
import { shopflowDb } from './src/db/database.ts';

// Simulate profile fetch
const email = 'ra2826572@gmail.com';
const profile = shopflowDb.getProfileByEmail(email);
console.log('Profile:', profile);
if (profile) {
  const shop = profile.shop_id 
    ? shopflowDb.getShopById(profile.shop_id) 
    : shopflowDb.getShopByOwnerId(profile.id);
  console.log('Shop:', shop);
}

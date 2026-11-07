import { shopflowDb } from "./src/db/database.ts";

const result = shopflowDb.registerNewUser({
  firstName: 'Rizwan',
  lastName: 'Ahmad',
  email: 'ra2826572@gmail.com',
  userId: 'f29cbfaa-6273-418b-a2ac-b180e4213202' // From user screenshot
});

console.log('Result:', result);

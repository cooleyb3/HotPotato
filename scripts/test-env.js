require('dotenv').config();

console.log('Testing environment variables:');
console.log('PRIVATE_KEY exists:', !!process.env.PRIVATE_KEY);
console.log('PRIVATE_KEY length:', process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
console.log('BASE_RPC_URL:', process.env.BASE_RPC_URL);
console.log('BASESCAN_API_KEY exists:', !!process.env.BASESCAN_API_KEY);

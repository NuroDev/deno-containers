import { Client } from '@nurodev/containers';

const client = new Client();

const images = await client.images.list();
console.log(images);

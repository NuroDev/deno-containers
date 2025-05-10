import { Client } from '@nurodev/docker';

const client = new Client();

const images = await client.images.list();
console.log(images);

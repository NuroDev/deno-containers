import { ImageClient } from '~/image.ts';

import type { ClientOptions } from '~/base.ts';

/**
 * @todo Add documentation
 */
export class Client {
	/**
	 * @todo Add documentation
	 */
	public images: ImageClient;

	constructor(options: ClientOptions = {}) {
		this.images = new ImageClient(options);
	}
}

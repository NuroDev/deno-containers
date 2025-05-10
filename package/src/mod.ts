import { BaseClient } from '~/base.ts';
import { ImageClient } from './image/client.ts';

import type { ClientOptions } from '~/base.ts';

/**
 * @todo Add documentation
 */
export class Client extends BaseClient {
	/**
	 * @todo Add documentation
	 */
	public images: ImageClient;

	constructor(options: Partial<ClientOptions> = {}) {
		super(options);
		this.images = new ImageClient(options);
	}
}

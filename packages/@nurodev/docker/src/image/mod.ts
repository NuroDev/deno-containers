import { BaseClient } from '~/base.ts';

import type { ImageList } from '~/image/types.ts';

/**
 * @todo Add documentation
 */
export class ImageClient extends BaseClient {
	/**
	 * @todo Add documentation
	 */
	public async list(): Promise<ImageList> {
		// TODO(@nurodev): Add `!response.ok` check.
		const response = await this.get('/images/json');
		return await response.json();
	}
}

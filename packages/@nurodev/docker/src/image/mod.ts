import { BaseClient } from '~/base.ts';

import type { ImageList } from '~/image/types.ts';

/**
 * @todo Add documentation
 */
export class ImageClient extends BaseClient {
	/**
	 * @todo Add documentation
	 */
	public async inspect(name: string): Promise<unknown> {
		// TODO(@nurodev): Add `!response.ok` check.
		const response = await this.get(`/images/${name}/json`);
		return await response.json();
	}

	/**
	 * @todo Add documentation
	 */
	public async list(): Promise<ImageList> {
		// TODO(@nurodev): Add `!response.ok` check.
		const response = await this.get('/images/json');
		return await response.json();
	}

	/**
	 * @todo Add documentation
	 */
	public async pull(): Promise<unknown> {
		return Promise.resolve([]);
	}

	/**
	 * @todo Add documentation
	 */
	public async remove(): Promise<unknown> {
		return Promise.resolve([]);
	}
}

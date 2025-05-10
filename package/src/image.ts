import { BaseClient } from '~/base.ts';

/**
 * @todo Add documentation
 */
export class ImageClient extends BaseClient {
	/**
	 * @todo Add documentation
	 */
	public async list(): Promise<Array<unknown>> {
		// TODO(@nurodev): Add `!response.ok` check.
		const response = await this.get('/images/json');
		return await response.json();
	}
}

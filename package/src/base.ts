export type ClientOptions = object;

export class BaseClient {
	protected options: ClientOptions;

	constructor(options: ClientOptions) {
		this.options = options;
	}
}

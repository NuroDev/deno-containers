export type ClientOptions = {
	/**
	 * The Docker API version to use
	 *
	 * @default 'v1.41'
	 */
	apiVersion: string;

	/**
	 * The path to the Docker socket
	 *
	 * @default '/var/run/docker.sock'
	 */
	socket: string;
};

export class BaseClient {
	protected options: ClientOptions;

	constructor(options: Partial<ClientOptions>) {
		this.options = {
			apiVersion: options.apiVersion ?? 'v1.41',
			socket: options.socket ?? '/var/run/docker.sock',
		};
	}

	/**
	 * @todo Add documentation
	 */
	private async request(
		options: {
			endpoint: string;
			method: 'GET' | 'POST';
			body?: object;
		},
	): Promise<Response> {
		const url = `/${this.options.apiVersion}${options.endpoint}`;

		// Create a Unix socket connection
		const conn = await Deno.connect({
			path: this.options.socket,
			transport: 'unix',
		});

		try {
			// Build HTTP request
			let requestBody = '';
			if (options.body) {
				requestBody = JSON.stringify(options.body);
			}

			const httpRequest = [
				`${options.method} ${url} HTTP/1.1`,
				'Host: localhost',
				'Connection: close',
				'Content-Type: application/json',
			];

			if (requestBody) {
				httpRequest.push(
					`Content-Length: ${
						new TextEncoder().encode(requestBody).length
					}`,
				);
			}

			httpRequest.push('', ''); // Add empty lines to complete headers

			if (requestBody) {
				httpRequest.push(requestBody);
			}

			// Send the request
			const encoder = new TextEncoder();
			const requestData = encoder.encode(httpRequest.join('\r\n'));
			await conn.write(requestData);

			// Read the response
			const decoder = new TextDecoder();
			const buffer = new Uint8Array(10240); // 10KB buffer
			let rawResponse = '';

			while (true) {
				const bytesRead = await conn.read(buffer);
				if (bytesRead === null) break;

				rawResponse += decoder.decode(buffer.subarray(0, bytesRead));

				// Check if we've received the complete response
				if (
					rawResponse.includes('\r\n\r\n') &&
					(rawResponse.includes('Content-Length: 0') ||
						rawResponse.includes('\r\n0\r\n\r\n'))
				) {
					break;
				}
			}

			// Parse the HTTP response
			const [headersText, bodyText] = rawResponse.split('\r\n\r\n', 2);
			const headerLines = headersText.split('\r\n');
			const statusLine = headerLines[0];
			const statusMatch = statusLine.match(/HTTP\/1\.\d (\d+) (.*)/);

			if (!statusMatch) {
				throw new Error('Invalid HTTP response');
			}

			const status = Number.parseInt(statusMatch[1]);
			const statusText = statusMatch[2];

			// Parse headers
			const headers = new Headers();
			for (let i = 1; i < headerLines.length; i++) {
				const line = headerLines[i];
				const colonIndex = line.indexOf(':');
				if (colonIndex > 0) {
					const name = line.substring(0, colonIndex).trim();
					const value = line.substring(colonIndex + 1).trim();
					headers.append(name, value);
				}
			}

			// Extract the response body
			let responseBody = bodyText;

			// Handle chunked encoding if present
			if (headers.get('Transfer-Encoding')?.includes('chunked')) {
				// Simple chunked encoding parser
				const chunks = [];
				let pos = 0;

				while (pos < responseBody.length) {
					// Find the chunk size
					const sizeEndPos = responseBody.indexOf('\r\n', pos);
					if (sizeEndPos === -1) break;

					const sizeHex = responseBody.substring(pos, sizeEndPos);
					const size = Number.parseInt(sizeHex, 16);

					if (size === 0) break; // End of chunks

					// Extract the chunk data
					const dataStartPos = sizeEndPos + 2;
					const dataEndPos = dataStartPos + size;

					if (dataEndPos > responseBody.length) break;

					chunks.push(
						responseBody.substring(dataStartPos, dataEndPos),
					);
					pos = dataEndPos + 2; // Skip the trailing CRLF
				}

				responseBody = chunks.join('');
			}

			// Create a Response object
			return new Response(responseBody, {
				status,
				statusText,
				headers,
			});
		} finally {
			conn.close();
		}
	}

	/**
	 * @todo Add documentation
	 */
	protected get(endpoint: string) {
		return this.request({
			endpoint,
			method: 'GET',
		});
	}

	/**
	 * @todo Add documentation
	 */
	protected post(endpoint: string, body: object) {
		return this.request({
			endpoint,
			method: 'POST',
			body,
		});
	}
}

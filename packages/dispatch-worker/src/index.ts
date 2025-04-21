export default {
	async fetch(request, env, ctx): Promise<Response> {
		try {
			// Parse the request URL
			const url = new URL(request.url);

			// Extract the path from the URL
			const path = url.pathname;

			// Use a regular expression to extract the alphanumeric part from the path
			const match = path.match(/\/([\w-]+)/);
			if (!match || !match[1]) {
				return new Response('', { status: 404 });
			}
			const workerName = match[1];
			let userWorker = env.DISPATCHER.get(workerName);
			return await userWorker.fetch(request);
		} catch (e) {
			if (e instanceof Error) {
				if (e.message.startsWith('Worker not found')) {
					// we tried to get a worker that doesn't exist in our dispatch namespace
					return new Response('', { status: 404 });
				}
				// this could be any other exception from `fetch()` *or* an exception
				// thrown by the called worker (e.g. if the dispatched worker has
				// `throw MyException()`, you could check for that here).
				return new Response(e.message, { status: 500 });
			}
			return new Response('', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;

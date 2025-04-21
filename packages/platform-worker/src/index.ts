export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response(JSON.stringify({
			now: Date.now(),
		}), { status: 200 });
	},
} satisfies ExportedHandler<Env>;

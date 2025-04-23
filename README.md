# Cloudflare Workers for Platforms Delete Issue

## Resolution

When deleting platform workers, the dispatch worker appears to serve the dispatch worker for a brief period of time.
This results in unexpected behavior from a platform tenant's perspective where they may observe their worker serving
requests.

**Update from Cloudflare**: Deletes are not instant and sometimes take around a minute to completely clean up, even if
deployments are under the "all-at-once" deployment model. The recommended approach would be to stop routing requests
to the deleted platform worker yourself, which may involve some state such as KV to track who has entered this delete
state.

## Setup

1. Create the dispatch namespace
    ```bash
    yarn dispatch-namespace:create
    ```
2. Create a platform worker
    ```bash
    yarn platform-worker:create
    ```
3. Create a platform worker
    ```bash
    yarn platform-worker:create
    ```
   
## Demo

### Expected 200

1. Request through dispatch worker (https://dispatch-worker-example.REDACTED.workers.dev/platform-worker-example)
2. Observe an expected 200 response when routing to the deployed platform worker

### Expected 404

1. Request through dispatch worker (https://dispatch-worker-example.REDACTED.workers.dev/something-that-doesnt-exist)
2. Observe an expected 404 response when routing to the non-existent platform worker

## Reproduction Steps

1. Delete the platform worker. Note, the `wrangler` CLI does not allow you to delete platform workers. Must use the
Cloudflare API.
    ```bash
    curl --request DELETE \
      --url https://api.cloudflare.com/client/v4/accounts/REDACTED/workers/dispatch/namespaces/cf-wfp-delete-example/scripts/platform-worker-example \
      --header 'Authorization: Bearer REDACTED'
    ```
2. Observe successful response.
3. (Optional) Observe that the platform worker no longer exists in the UI.
4. Request through dispatch worker (https://dispatch-worker-example.REDACTED.workers.dev/platform-worker-example)

### Actual Result

5. Observe a 200 response when routing to the deleted platform worker

### Expected Result

5. Observe a 404 response when routing to the deleted platform worker

## Observations

When deploying updates to a platform worker, I seem to get routed to the updated version almost immediately. This
differs from delete behavior where the change is not immediate.

Introducing CDN caching further complicates issues the tenant may have especially when cache-control behavior is
origin-based. The window of time in which the deleted platform worker is still served allows longer lived cache
responses to be created that may have TTLs extending beyond the time in which it takes to delete the platform worker.

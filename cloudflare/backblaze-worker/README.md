# SixSeven Backblaze Worker

The deployed Worker serves authenticated uploads to Backblaze B2 for profile photos, cover photos, and other media. Secrets stay in Cloudflare Worker secrets, never in the client bundle.

## Endpoints
- `GET /`, `GET /health`, `GET /api/health`: health check returning `{"ok":true}`.
- `POST /api/upload-avatar`: authenticated multipart form upload. Send Firebase ID token in `Authorization: Bearer <token>` and the image in FormData field `file`. Saves under `avatars/<firebase-uid>/...`.
- `POST /api/upload-cover`: same contract, saved under `covers/<firebase-uid>/...`.
- `POST /upload-url`: legacy signed upload endpoint for other media.

All Worker responses include CORS headers and all `OPTIONS` requests return HTTP 200. Upload endpoints require a valid Firebase ID token for project `sixseven-c86ac`, validate image MIME types and enforce a 10 MB limit for profile and cover images.

## Cloudflare Worker secrets
Required:
- `B2_KEY_ID`
- `B2_APP_KEY` or `B2_APPLICATION_KEY`

Optional:
- `B2_BUCKET_NAME` (if omitted, profile photos use `sixseven-profiles` and covers use `sixseven-covers`)
- `B2_ENDPOINT` (defaults to `https://s3.us-east-005.backblazeb2.com`)

The GitHub Actions workflow reads repository secrets with those names and supports either `B2_APP_KEY` or `B2_APPLICATION_KEY`. It deploys the existing Worker name `sixseven-backblaze-signer` to the existing `sixsevenapp816.workers.dev` URL and then checks health and CORS preflight.

The bucket must permit public reads if the returned image URLs are to display without signed download URLs. Use least-privilege Backblaze application keys. Never commit any key into the repository.

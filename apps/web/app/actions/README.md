Server Actions and the `app/actions` convention

Place server-only helper functions under `app/actions` (co-located with routes/pages) that
use the Server Actions API. This folder is a convention for grouping server-side business
logic without introducing an API route when Server Actions are appropriate.

Guidelines:
- Keep side-effecting code (DB writes, external API calls) in `app/actions`.
- Keep pure helpers in `packages/lib` so they can be unit tested.
- Do not import client-only modules (browser APIs) into `app/actions`.

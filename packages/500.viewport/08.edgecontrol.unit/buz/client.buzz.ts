import { resolveCoordinationEndpoint } from './cascade.buzz.js';
import type {
  HttpDispatchOptions,
  HttpDispatchReceipt,
} from '../fce/cascade.interface.js';

export async function dispatchEdgeHttpRequest<T = unknown>(
  options: HttpDispatchOptions
): Promise<HttpDispatchReceipt<T>> {
  const { resolvedUrl } = resolveCoordinationEndpoint();
  const cleanPath = options.endpointPath.startsWith('/')
    ? options.endpointPath
    : `/${options.endpointPath}`;
  const targetUrl = `${resolvedUrl}${cleanPath}`;
  const timeoutMs = options.timeoutMs ?? 5000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = Date.now();

  try {
    const response = await fetch(targetUrl, {
      method: options.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      body: options.payload ? JSON.stringify(options.payload) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);
    const roundTripTimeMs = Date.now() - t0;

    // Structured domain error translation
    if (!response.ok) {
      let errorCode: NonNullable<HttpDispatchReceipt['error']>['code'] = 'DISPATCH_ERROR';
      if (response.status === 412) errorCode = 'DIRTY_SCENE_REJECTED';
      else if (response.status === 409) errorCode = 'ZOMBIE_LEASE_EPOCH';
      else if (response.status === 503) errorCode = 'EDGE_GATEWAY_UNAVAILABLE';

      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = (await response.json()) as { message?: string };
        if (errorJson?.message) errorMessage = errorJson.message;
      } catch {
        // Fall back to status text
      }

      process.stdout.write(
        `>> [CLIENT] [FAIL] ${targetUrl} :: HTTP ${response.status} :: ${roundTripTimeMs}ms RTT\n`
      );

      return {
        ok: false,
        status: response.status,
        error: { code: errorCode, message: errorMessage },
        roundTripTimeMs,
        targetUrl,
      };
    }

    const data = (await response.json()) as T;
    process.stdout.write(
      `>> [CLIENT] [OK] ${targetUrl} :: HTTP ${response.status} :: ${roundTripTimeMs}ms RTT\n`
    );

    return {
      ok: true,
      status: response.status,
      data,
      roundTripTimeMs,
      targetUrl,
    };
  } catch (err: any) {
    clearTimeout(timer);
    const roundTripTimeMs = Date.now() - t0;

    if (err.name === 'AbortError' || controller.signal.aborted) {
      process.stdout.write(
        `:: [CLIENT:TIMEOUT] ${targetUrl} breached ${timeoutMs}ms ceiling :: ${roundTripTimeMs}ms RTT\n`
      );
      return {
        ok: false,
        status: 408,
        error: {
          code: 'REQUEST_TIMEOUT',
          message: `Request timed out after ${timeoutMs}ms`,
        },
        roundTripTimeMs,
        targetUrl,
      };
    }

    const isConnRefused =
      err.code === 'ECONNREFUSED' ||
      err.cause?.code === 'ECONNREFUSED' ||
      err.message?.includes('fetch failed');

    process.stdout.write(
      `:: [CLIENT:FAIL] ${targetUrl} connection error :: ${err.message}\n`
    );

    return {
      ok: false,
      status: 503,
      error: {
        code: isConnRefused ? 'CONNECTION_REFUSED' : 'EDGE_GATEWAY_UNAVAILABLE',
        message: err.message || 'Network connection failed',
      },
      roundTripTimeMs,
      targetUrl,
    };
  }
}

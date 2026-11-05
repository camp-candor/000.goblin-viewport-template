/**
 * apps/worker/src/lib/sanitizer.ts
 * Path traversal and shell injection security sentinels.
 * Pure 7-bit ASCII enforcement - zero multi-byte emojis.
 */

export interface SanitizationResult {
    readonly valid: boolean
    readonly sanitizedValue?: string
    readonly errorCode?: 'FORBIDDEN_COMMAND_INJECTION'
    readonly message?: string
}

const PROHIBITED_SHELL_PATTERNS = [
    /\.\./, // Directory traversal
    /[;&|`$<>\r\n]/, // Shell chaining and redirection
    /\brm\s+-rf\b/i, // Destructive removal
    /\bsudo\b/i, // Privilege escalation
    /\bchmod\b/i, // Permission alteration
    /\bsh\b/i, // Shell spawning
    /\bbash\b/i, // Bash invocation
    /\bexec\b/i, // Execution primitives
    /\beval\b/i, // Dynamic evaluation
]

/**
 * Validates path parameters against directory traversal and command injection tokens.
 */
export function sanitizePath(input: string): SanitizationResult {
    if (typeof input !== 'string' || input.trim().length === 0) {
        return {
            valid: false,
            errorCode: 'FORBIDDEN_COMMAND_INJECTION',
            message: 'Path parameter cannot be empty or non-string',
        }
    }

    const trimmed = input.trim()

    // Test against prohibited command injection and traversal patterns
    for (const pattern of PROHIBITED_SHELL_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                valid: false,
                errorCode: 'FORBIDDEN_COMMAND_INJECTION',
                message: `Security violation: Prohibited token or traversal sequence detected [${pattern.source}]`,
            }
        }
    }

    // Normalized safe relative or absolute path
    return {
        valid: true,
        sanitizedValue: trimmed,
    }
}

/**
 * Validates strict scene and series identifiers (e.g., ep01_sc03, under-the-floorboards).
 */
export function sanitizeSlug(
    input: string,
    pattern: RegExp = /^[a-z0-9_-]+$/,
): SanitizationResult {
    if (typeof input !== 'string' || !pattern.test(input.trim())) {
        return {
            valid: false,
            errorCode: 'FORBIDDEN_COMMAND_INJECTION',
            message: 'Slug parameter violates permitted character pattern',
        }
    }

    return {
        valid: true,
        sanitizedValue: input.trim(),
    }
}

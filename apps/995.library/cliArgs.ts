export interface CliArguments {
    targetPackage?: string
}

export const parseCliArguments = (argv: string[]): CliArguments => {
    const pkgArg = argv.find(
        (arg) => arg.startsWith('--package=') || arg.startsWith('-p='),
    )
    if (pkgArg) {
        return { targetPackage: pkgArg.split('=')[1] }
    }
    const flagIndex = argv.findIndex(
        (arg) => arg === '--package' || arg === '-p',
    )
    if (flagIndex !== -1 && argv[flagIndex + 1]) {
        return { targetPackage: argv[flagIndex + 1] }
    }
    return {}
}

export const bootTerminalCockpit = async (
    targetPackage?: string,
): Promise<void> => {
    const resolvedPkg = targetPackage || '500.viewport'
    process.stdout.write(
        `>> [FLIGHT-DECK] Booting terminal cockpit for [${resolvedPkg}]...\n`,
    )
}

export const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
};


export type ColorKey = keyof typeof COLORS;

export type LogEntry = {
    key: string;
    value: string | number | null | undefined;
};

export type LogBlockParams = {
    statusColor: string;
    separatorColor?: string;
    entries: LogEntry[];
    prefix?: string;
};

/**
 * Logs a formatted block with colored output
 * - First entry: key and value both colored with statusColor
 * - Other entries: only key colored with statusColor
 */
export const logBlock = ({
    statusColor,
    separatorColor = COLORS.blue,
    entries,
    prefix = 'Strapi',
}: LogBlockParams): void => {
    if (entries.length === 0) return;

    const separator = '─'.repeat(50);
    const formatValue = (val: string | number | null | undefined): string =>
        val === null || val === undefined ? 'undefined' : String(val);

    console.log(` `);
    console.log(`${separatorColor}${separator}${COLORS.reset}`);

    entries.forEach((entry, index) => {
        const paddedKey = entry.key.padEnd(12);
        const value = formatValue(entry.value);

        if (index === 0) {
            // First line: both key and value colored
            console.log(
                `${COLORS.gray}[${prefix}]${COLORS.reset} ${statusColor}${paddedKey} ${value}${COLORS.reset}`,
            );
        } else {
            // Other lines: only key colored
            console.log(
                `${COLORS.gray}[${prefix}]${COLORS.reset} ${statusColor}${paddedKey} ${COLORS.reset}${value}`,
            );
        }
    });

    console.log(`${separatorColor}${separator}${COLORS.reset}`);
};

export type LogSimpleParams = {
    message: string;
    emoji?: string;
    color?: ColorKey;
    prefix?: string;
};

/**
 * Logs a simple single-line message with optional emoji and color
 */
export const logSimple = ({
    message,
    emoji = '',
    color = 'green',
    prefix = 'Strapi',
}: LogSimpleParams): void => {
    const colorCode = COLORS[color] || COLORS.green;
    const emojiPart = emoji ? `${emoji} ` : '';
    console.log(
        `${COLORS.gray}[${prefix}]${COLORS.reset} ${emojiPart}${colorCode}${message}${COLORS.reset}`,
    );
};

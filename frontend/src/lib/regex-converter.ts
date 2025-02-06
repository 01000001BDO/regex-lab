export interface RegexConversion {
    javascript: Record<string, string>;
    rust: Record<string, string>;
    java: Record<string, string>;
    go: Record<string, string>;
    python: Record<string, string>;
}
   
export function convertRegexToLanguages(pattern: string): RegexConversion {
    return {
      javascript: {
        standard: `/${pattern}/`,
        global: `/${pattern}/g`,
        case_insensitive: `/${pattern}/i`,
        global_case_insensitive: `/${pattern}/gi`
      },
      rust: {
        standard: `Regex::new(r"${pattern}")`,
        case_insensitive: `Regex::new(r"(?i)${pattern}")`,
      },
      java: {
        standard: `Pattern.compile("${pattern}")`,
        case_insensitive: `Pattern.compile("${pattern}", Pattern.CASE_INSENSITIVE)`,
      },
      go: {
        standard: `regexp.MustCompile(\`${pattern}\`)`,
        case_insensitive: `regexp.MustCompile("(?i)" + \`${pattern}\`)`,
      },
      python: {
        standard: `re.compile(r'${pattern}')`,
        case_insensitive: `re.compile(r'${pattern}', re.IGNORECASE)`,
      }
    };
}
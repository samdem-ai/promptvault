export function fmtPromptId(n: number) { return `P-${String(n).padStart(4, '0')}`; }
export function fmtRunId(n: number)    { return `R-${String(n).padStart(4, '0')}`; }
export function fmtChallengeId(n: number) { return `C-${String(n).padStart(3, '0')}`; }
export function fmtImportId(n: number) { return `IMP-${String(n).padStart(3, '0')}`; }

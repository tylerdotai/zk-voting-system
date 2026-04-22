// assert shim for browser
const ok = (cond, msg) => { if (!cond) throw new Error(msg || 'Assertion failed'); };
export default { ok };
export { ok as strict, ok };

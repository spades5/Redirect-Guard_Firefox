// FILE: content_script.js
(async function() {
// get settings
const cfg = await new Promise(resolve => browser.storage.sync.get(null, resolve));
if (!cfg || cfg.enabled === false) return;


const redirectUrl = cfg.redirectUrl || "https://www.youtube.com/watch?v=NFWMSwfr4to";
const blockedDomains = (cfg.blockedDomains || []).map(d => d.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase());
const blockedQueries = cfg.blockedQueries || [];


try {
const loc = window.location;
const host = (loc.hostname || '').toLowerCase();


// 1) Domain-based blocking
for (const d of blockedDomains) {
if (!d) continue;
// exact or subdomain match
if (host === d || host.endsWith('.' + d)) {
// avoid infinite loop: only redirect if not already on redirectUrl
if (!loc.href.startsWith(redirectUrl)) {
window.location.replace(redirectUrl);
}
return;
}
}


// 2) Google search query detection (q= parameter)
// handle google search pages and other search engines that use q=
const params = new URLSearchParams(loc.search);
const q = params.get('q') || '';
if (q) {
const qLower = decodeURIComponent(q).toLowerCase();
for (const keyword of blockedQueries) {
if (!keyword) continue;
if (qLower.includes(keyword.toLowerCase())) {
if (!loc.href.startsWith(redirectUrl)) {
window.location.replace(redirectUrl);
}
return;
}
}
}


// 3) Some sites expose adult content in path or hash — simple check
const pathLower = (loc.pathname + (loc.hash || '')).toLowerCase();
for (const keyword of blockedQueries) {
if (!keyword) continue;
if (pathLower.includes(keyword.toLowerCase())) {
if (!loc.href.startsWith(redirectUrl)) {
window.location.replace(redirectUrl);
}
return;
}
}
} catch (e) {
// fail silently
console.error('Redirect Guard error', e);
}
})();
// URL y clave anónima de Supabase (API REST vía fetch)
var SUPABASE_URL = 'https://oxmeafneztzlpgopfxnm.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWVhZm5lenR6bHBnb3BmeG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5Nzg0MDcsImV4cCI6MjA5NzU1NDQwN30.mjLCKUHy9TVquIk4JXdXBVoPAmIQv6pmb2-vNJ1akAU';

// Helper para llamar a la API REST de Supabase con fetch
async function supaFetch(method, path, options) {
  var opts = options || {};
  var url = SUPABASE_URL + '/rest/v1/' + path;
  var headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
  if (opts.prefer) {
    headers['Prefer'] = opts.prefer;
  }

  var res = await fetch(url, {
    method: method,
    headers: headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    var err = await res.json();
    throw err;
  }

  if (res.status === 204) return null;
  return await res.json();
}

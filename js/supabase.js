// Configuración del cliente de Supabase
var SUPABASE_URL = 'https://oxmeafneztzlpgopfxnm.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bWVhZm5lenR6bHBnb3BmeG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5Nzg0MDcsImV4cCI6MjA5NzU1NDQwN30.mjLCKUHy9TVquIk4JXdXBVoPAmIQv6pmb2-vNJ1akAU';
// Cliente global accesible desde cualquier script
window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

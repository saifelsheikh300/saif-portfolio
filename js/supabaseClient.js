// ============================================================
// SAIF EL SHEIKH PORTFOLIO — SUPABASE CLIENT CONFIG
// ============================================================

// ضع هنا رابط مشروعك ومفتاح الـ Anon الخاص بـ Supabase:
const SUPABASE_URL = "https://zwdrqgubuwiuixiruobs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ow7_vIBiJVv06IqFX_ahgg_C9yi1d6Q";

// التأكد من توفر مكتبة Supabase
let supabaseClient = null;

if (typeof window !== 'undefined' && window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('⚡ Supabase Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Supabase initialization error:', err);
  }
} else {
  console.warn('⚠️ Supabase JS library not loaded. Make sure to include the CDN script.');
}

// دالة مساعدة لمعرفة هل الاتصال مفعل
function isSupabaseConnected() {
  return supabaseClient !== null && SUPABASE_URL.indexOf('supabase.co') !== -1;
}

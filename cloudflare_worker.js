/**
 * Cloudflare Worker for Direct R2 Video Uploads
 * ==============================================
 * 1. Go to Cloudflare Dashboard -> Workers & Pages -> Create Worker
 * 2. Paste this code into the Worker editor and click "Save and Deploy"
 * 3. In Worker Settings -> Variables:
 *    - Add R2 Bucket Binding: Variable name = "MY_BUCKET", select your bucket
 *    - Add Environment Variable: Variable name = "PUBLIC_R2_URL", value = "https://pub-xxxx.r2.dev"
 * 4. Copy your worker URL (e.g. https://r2-video-uploader.xxx.workers.dev) and paste it in Admin settings!
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Filename, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST' && request.method !== 'PUT') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const headerFilename = request.headers.get('X-Filename');
      const queryFilename = url.searchParams.get('filename');
      const filename = headerFilename || queryFilename || `video-${Date.now()}.mp4`;
      const contentType = request.headers.get('Content-Type') || 'video/mp4';

      // Read video payload stream / buffer
      const fileBlob = await request.arrayBuffer();

      if (!fileBlob || fileBlob.byteLength === 0) {
        return new Response(JSON.stringify({ success: false, error: 'Empty file payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Upload to Cloudflare R2 bucket
      await env.MY_BUCKET.put(filename, fileBlob, {
        httpMetadata: { contentType: contentType }
      });

      // Construct public link
      const publicBaseUrl = (env.PUBLIC_R2_URL || '').replace(/\/$/, '');
      const publicUrl = publicBaseUrl ? `${publicBaseUrl}/${filename}` : filename;

      return new Response(JSON.stringify({
        success: true,
        filename: filename,
        url: publicUrl,
        size: fileBlob.byteLength
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

export default {
  async fetch(request, env, ctx) {
    try {
      const { html, timeout = 30000 } = await request.json();

      if (!html) {
        return new Response(JSON.stringify({ error: "Missing HTML" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Start Browser Session WITH timeout
      const session = await env.BROWSER.newSession();
      
      // Set timeout for the entire operation
      ctx.waitUntil((async () => {
        await new Promise(resolve => setTimeout(resolve, timeout));
        try { await session.end(); } catch {}
      })());

      await session.navigate("data:text/html," + encodeURIComponent(html));
      await session.waitForLoad();

      // Generate PDF
      const pdf = await session.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm" },
      });

      await session.end();

      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline; filename=po.pdf",
        },
      });

    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};

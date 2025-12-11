export default {
  async fetch(request, env) {
    try {
      const { html } = await request.json();

      if (!html) {
        return new Response(JSON.stringify({ error: "Missing HTML" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Start Browser Session
      const session = await env.BROWSER.newSession();

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

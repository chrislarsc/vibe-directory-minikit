export async function GET() {
  // Return the exact JSON structure requested
  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjE5MjMwMCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDM3MzdFMzU3Y2NhZGMyN2I5NTU1NGIzMGM1OEI5RTFmMzMwNjRjMUYifQ",
      payload: "eyJkb21haW4iOiJteS1maXJzdC1taW5pLWFwcC52ZXJjZWwuYXBwIn0",
      signature: "MHgzMjgyOTIyY2U5ZmNlMThiNDFhNWM2MjM2YWNhZDI5NjNmOGMyNTg4ODFhYjNlOTU0MzJiYjdlY2U2OTRjYzIwMzdjZWU5M2M3NTY2YjU0NDUyNTBiNTUzMGZjMGZlZTgzNzM3YzQxYTZkNjAxMTJjZTdhODFhMWFjYzhjOWU4ZTFi"
    },
    frame: {
      version: "1",
      name: "Vibe projects",
      homeUrl: "https://my-first-mini-app.vercel.app",
      iconUrl: "https://my-first-mini-app.vercel.app/splash.png",
      imageUrl: "https://my-first-mini-app.vercel.app/splash.png",
      buttonTitle: "Launch app",
      splashImageUrl: "https://my-first-mini-app.vercel.app/splash.png",
      splashBackgroundColor: "#FFFFFF",
      webhookUrl: "https://my-first-mini-app.vercel.app/api/webhook"
    },
    triggers: [
      {
        type: "cast",
        id: "view-app",
        url: "https://my-first-mini-app.vercel.app",
        name: "View minikit-test"
      }
    ]
  });
}

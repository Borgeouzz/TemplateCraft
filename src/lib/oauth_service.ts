export async function OAuthRedirect() {
    const response = await fetch("http://localhost:8000/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt }),
      });
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      const data = await response.json();
      return data.email;
}
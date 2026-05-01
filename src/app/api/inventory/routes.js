export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const steamId = searchParams.get('steamId')

    if (!steamId) {
        return Response.json({ error: 'steamId fehlt' }, { status: 400 })
    }

    // Verschiedene URLs probieren
    const urls = [
        `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=75`,
        `https://www.steamcommunity.com/inventory/${steamId}/730/2?l=english&count=75`,
    ]

    for (const url of urls) {
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://steamcommunity.com/',
                    'Origin': 'https://steamcommunity.com'
                }
            })

            if (res.ok) {
                const data = await res.json()
                return Response.json(data)
            }

            console.log(`${url} → ${res.status}`)
        } catch (err) {
            console.log(`${url} → Fehler: ${err.message}`)
        }
    }

    return Response.json({ error: 'Steam nicht erreichbar' }, { status: 503 })
}
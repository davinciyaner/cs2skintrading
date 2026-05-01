export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const steamId = searchParams.get('steamId')

    if (!steamId) {
        return Response.json({ error: 'steamId fehlt' }, { status: 400 })
    }

    const res = await fetch(
        `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=75`,
        {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
            }
        }
    )

    if (!res.ok) {
        return Response.json({ error: 'Steam Fehler' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
}
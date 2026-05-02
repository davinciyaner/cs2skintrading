export default function Datenschutz() {
    return (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem', lineHeight: 1.7 }}>
            <h1>Datenschutzerklärung</h1>

            <h2>1. Verantwortlicher</h2>
            <p>
                Finn Paustian<br />
                Am Rund 6, 23566 Lübeck<br />
                E-Mail: finnpaustian94@gmail.com
            </p>

            <h2>2. Welche Daten wir verarbeiten</h2>
            <p>Bei der Nutzung dieser Plattform werden folgende Daten gespeichert:</p>
            <ul>
                <li>Steam-ID, Benutzername, Profilbild-URL (von Steam bei Login übermittelt)</li>
                <li>Steam Web API Key (freiwillig, zur Inventarabfrage, verschlüsselt gespeichert)</li>
                <li>CS2-Inventardaten (Skin-Namen, Asset-IDs, Icon-URLs)</li>
                <li>Angebote (Listings) und Tausch-Matches</li>
                <li>Session-Cookie zur Aufrechterhaltung der Anmeldung</li>
            </ul>

            <h2>3. Rechtsgrundlage</h2>
            <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Betrieb der Plattform).
            </p>

            <h2>4. Drittanbieter: Steam / Valve</h2>
            <p>
                Der Login erfolgt über Steam OpenID. Dabei werden Daten an Valve Corporation übermittelt.
                Die Datenschutzerklärung von Valve ist einsehbar unter:{' '}
                <a
                    href="https://store.steampowered.com/privacy_agreement/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    store.steampowered.com/privacy_agreement
                </a>
            </p>

            <h2>5. Cookies</h2>
            <p>
                Es wird ausschließlich ein technisch notwendiges Session-Cookie gesetzt, das nach
                Sitzungsende verfällt oder spätestens nach 7 Tagen. Es werden keine Tracking- oder
                Werbe-Cookies verwendet.
            </p>

            <h2>6. Speicherdauer</h2>
            <p>
                Deine Daten werden gespeichert, solange du ein Konto auf der Plattform hast.
                Du kannst jederzeit die Löschung deines Kontos und aller gespeicherten Daten
                per E-Mail an [deine@email.de] verlangen.
            </p>

            <h2>7. Deine Rechte</h2>
            <p>
                Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO),
                Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO),
                Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch (Art. 21 DSGVO).
                Beschwerden kannst du an die zuständige Datenschutzaufsichtsbehörde richten.
            </p>

            <h2>8. Keine Weitergabe an Dritte</h2>
            <p>
                Es erfolgt keine Weitergabe deiner Daten an Dritte, außer dies ist zur
                Vertragserfüllung notwendig oder gesetzlich vorgeschrieben.
            </p>
        </div>
    )
}
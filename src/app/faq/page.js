export const metadata = {
    title: 'FAQ – Häufige Fragen | SkinSwipe CS2 Trading',
    description: 'Alle Antworten rund um CS2 Skin Trading auf SkinSwipe. Wie funktioniert das Tauschen? Ist es kostenlos? Wie sicher ist es?',
}

const faqs = [
    {
        question: 'Wie funktioniert SkinSwipe?',
        answer: 'Du loggst dich mit Steam ein, stellst deine CS2 Skins ein und swixt durch Listings anderer Spieler. Wenn ihr beide gegenseitig rechts swipt, gibt es ein Match – und ihr könnt euren Trade direkt über Steam abwickeln.'
    },
    {
        question: 'Ist SkinSwipe kostenlos?',
        answer: 'Ja. SkinSwipe erhebt keine Gebühren. Es gibt keinen Steam Tax und keine versteckten Kosten. Du tauschst direkt mit anderen Spielern.'
    },
    {
        question: 'Wie sicher ist das Trading?',
        answer: 'Der eigentliche Trade läuft über Steam – du bist also durch Valves offizielles System geschützt. SkinSwipe speichert keine Skins und hat keinen Zugriff auf dein Inventar außer zum Anzeigen.'
    },
    {
        question: 'Warum brauche ich einen Steam API Key?',
        answer: 'Der Steam API Key erlaubt es uns, dein CS2 Inventar zu laden. Du kannst ihn kostenlos auf der Steam-Website erstellen. Ohne ihn können wir deine Skins nicht anzeigen.'
    },
    {
        question: 'Was passiert bei einem Match?',
        answer: 'Ihr bekommt beide eine Benachrichtigung. Ihr könnt euch dann gegenseitig ein Steam Trade Offer schicken und den Trade direkt über Steam abwickeln.'
    },
    {
        question: 'Welche Skins kann ich einstellen?',
        answer: 'Alle CS2 Skins aus deinem Steam Inventar die tradebar sind. Non-tradable Items (z.B. frisch geöffnete Cases) können nicht eingestellt werden.'
    },
    {
        question: 'Ist SkinSwipe mit Valve oder Steam verbunden?',
        answer: 'Nein. SkinSwipe ist ein unabhängiges Projekt und steht in keiner Verbindung zu Valve Corporation oder Steam.'
    },
]

export default function FAQ() {
    return (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Häufige Fragen</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Alles was du über CS2 Skin Trading auf SkinSwipe wissen musst.
            </p>

            {/* Schema.org JSON-LD für Google Rich Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map(faq => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.answer
                            }
                        }))
                    })
                }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, i) => (
                    <div key={i} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1.25rem',
                    }}>
                        <h2 style={{ fontSize: '16px', margin: '0 0 0.5rem' }}>
                            {faq.question}
                        </h2>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
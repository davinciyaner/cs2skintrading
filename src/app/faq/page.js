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
        <div className="min-h-screen bg-[#080a0f]">
            <div className="max-w-2xl mx-auto px-5 py-12">

            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#3a3835] mb-4">Support</p>
            <h1 className="font-bebas text-5xl tracking-wide text-[#f0ede8] mb-2">Häufige Fragen</h1>
            <p className="text-[#4a4845] text-sm mb-10">
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

            <div className="flex flex-col gap-2">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className="border border-white/[0.07] hover:border-white/12 bg-white/2 hover:bg-white/4 rounded-xl p-5 transition-all duration-150 group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-sm font-semibold text-[#e8e5e0] leading-snug">
                                {faq.question}
                            </h2>
                            <span className="text-yellow-400/40 group-hover:text-yellow-400/70 transition-colors text-xs mt-0.5 shrink-0">✦</span>
                        </div>
                        <p className="mt-2 text-xs text-[#4a4845] leading-relaxed font-light">
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>
        </div>
        </div>
    )
}
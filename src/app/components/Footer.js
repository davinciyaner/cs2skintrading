import Link from 'next/link'

export default function Footer() {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '1.5rem 1rem',
            fontSize: '13px',
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/impressum" style={{ color: 'inherit', textDecoration: 'none' }}>Impressum</Link>
                <Link href="/datenschutz" style={{ color: 'inherit', textDecoration: 'none' }}>Datenschutz</Link>
                <a href="https://store.steampowered.com/subscriber_agreement/"
                   target="_blank" rel="noopener noreferrer"
                   style={{ color: 'inherit', textDecoration: 'none' }}>Steam AGB</a>
            </div>
            <p style={{ margin: 0 }}>© 2026 cs2tradeskins · Nicht mit Valve assoziiert</p>
        </footer>
    )
}
import './globals.css'
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: 'SkinSwipe – CS2 Skin Trading',
  description: 'CS2 Skins tauschen wie Tinder'
}

export default function RootLayout({ children }) {
  return (
      <html lang="de">
      <body>
      <Navbar />
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {children}
      </main>
      </body>
      </html>
  )
}
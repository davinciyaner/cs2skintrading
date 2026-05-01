'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { api } from '../lib/api'

export default function Navbar() {
    const [user, setUser] = useState(null)
    const pathname = usePathname()

    useEffect(() => {
        api.getMe().then(setUser).catch(() => setUser(null))
    }, [])

    const links = [
        { href: '/swipe',    label: 'Swipen' },
        { href: '/listings', label: 'Meine Skins' },
        { href: '/matches',  label: 'Matches' },
    ]

    return (
        <nav style={{
            background: 'rgba(10,10,15,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            {/* Logo */}
            <Link href="/" style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent)'
            }}>
                Skin<span style={{ color: 'var(--text)' }}>Swipe</span>
            </Link>

            {/* Nav Links */}
            {user && (
                <div style={{ display: 'flex', gap: '4px' }}>
                    {links.map(link => (
                        <Link key={link.href} href={link.href} style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: pathname === link.href ? 'var(--accent)' : 'var(--muted)',
                            background: pathname === link.href ? 'rgba(240,180,41,0.1)' : 'transparent',
                            transition: 'all 0.15s'
                        }}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user ? (
                    <>
                        <img
                            src={user.avatar}
                            alt={user.username}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border)' }}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{user.username}</span>
                        <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`}
                            style={{
                                fontSize: '13px',
                                color: 'var(--muted)',
                                padding: '5px 10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px'
                            }}
                        >
                            Logout
                        </a>
                    </>
                ) : (
                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/auth/steam`}
                        style={{
                            background: 'var(--accent)',
                            color: '#000',
                            padding: '7px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: 'Rajdhani, sans-serif',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}
                    >
                        Steam Login
                    </a>
                )}
            </div>
        </nav>
    )
}
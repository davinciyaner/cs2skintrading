'use client'
import { useEffect, useState } from 'react'
import {useI18n} from "../../i18n/request";

const TRADES = [
    { user: 'xX_Sniper_Xx', avatar: '🎯', skin: 'AWP | Dragon Lore', wear: 'Field-Tested', price: '1.240€', time: 2 },
    { user: 'de_dust_king', avatar: '🔫', skin: 'AK-47 | Redline', wear: 'Minimal Wear', price: '18€', time: 5 },
    { user: 'NikoFanBoy', avatar: '🔪', skin: 'Karambit | Fade', wear: 'Factory New', price: '890€', time: 8 },
    { user: 'flash_master', avatar: '💥', skin: 'M4A4 | Howl', wear: 'Field-Tested', price: '520€', time: 12 },
    { user: 'headshotonly', avatar: '🎮', skin: 'Glock | Fade', wear: 'Factory New', price: '340€', time: 15 },
    { user: 'pro_trader_99', avatar: '💰', skin: 'Butterfly | Marble Fade', wear: 'Factory New', price: '1.100€', time: 18 },
    { user: 'cs2_legend', avatar: '⭐', skin: 'AK-47 | Case Hardened', wear: 'Well-Worn', price: '95€', time: 22 },
    { user: 'dust2_only', avatar: '🏆', skin: 'USP-S | Kill Confirmed', wear: 'Minimal Wear', price: '45€', time: 25 },
]

function timeAgo(minutes) {
    if (minutes < 1) return 'gerade eben'
    return `vor ${minutes} Min.`
}

export default function ActivityFeed() {
    const { t } = useI18n()
    const [feed, setFeed] = useState([])
    const [offsets, setOffsets] = useState({})

    useEffect(() => {
        // Initiale Items laden
        setFeed(TRADES.slice(0, 5).map((t, i) => ({ ...t, id: i, time: t.time })))

        // Alle 4 Sekunden neuen Trade reinspülen
        const interval = setInterval(() => {
            const random = TRADES[Math.floor(Math.random() * TRADES.length)]
            const newItem = { ...random, id: Date.now(), time: 0 }

            setFeed(prev => {
                const updated = [newItem, ...prev].slice(0, 6)
                // Zeiten erhöhen
                return updated.map((item, i) => i === 0 ? item : { ...item, time: item.time + 4 })
            })
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">

            {/* Feed */}
            <div className="space-y-2">
                {feed.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all duration-300"
                        style={{
                            opacity: index === 0 ? 1 : 1 - index * 0.12,
                            animation: index === 0 ? 'slideIn 0.4s ease' : 'none'
                        }}
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm shrink-0">
                            {item.avatar}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-[#f0ede8] font-medium truncate">{item.user}</span>
                                <span className="text-[#3a3835] shrink-0">hat getauscht</span>
                            </div>
                            <p className="text-[#6b6865] text-xs truncate">{item.skin} · {item.wear}</p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                            <p className="text-yellow-400 text-xs font-medium">{item.price}</p>
                            <p className="text-[#3a3835] text-[10px]">{timeAgo(item.time)}</p>
                        </div>

                        {/* Match badge für neue */}
                        {index === 0 && (
                            <div className="shrink-0 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5 text-[10px] text-green-400 font-medium">
                                MATCH
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    )
}
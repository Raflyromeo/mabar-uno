import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function Sidebar() {
    const { players, currentPlayerIndex } = useGameStore();

    return (
        <div className="absolute left-6 top-6 glass rounded-2xl p-4 w-64 hidden sm:block pointer-events-none">
            <h2 className="text-xl font-black font-montserrat tracking-tight mb-4 flex items-center gap-2 drop-shadow-md">
                ROOM 
                <span className="bg-white text-dark-bg px-2 rounded text-sm tracking-widest">9431</span>
            </h2>
            
            <div className="space-y-3">
                {players.map((p, index) => {
                    const isTurn = index === currentPlayerIndex;
                    return (
                        <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl transition-colors duration-300 ${isTurn ? 'bg-white/20 shadow-inner border border-white/10' : 'opacity-60'}`}>
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs ring-2 ring-white/50">
                                    {p.name.charAt(0)}
                                </div>
                                {isTurn && (
                                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm tracking-wide text-white drop-shadow-md">{p.name}</p>
                                <p className="text-xs text-white/70 font-semibold">{p.hand.length} Cards</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

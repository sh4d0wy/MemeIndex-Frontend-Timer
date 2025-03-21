import  { useEffect, useRef, useState } from 'react'
import { TonConnectUI } from '@tonconnect/ui'

// Singleton instance
let tonConnectUIInstance: TonConnectUI | null = null;
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initDataUnsafe?: {
                    user?: {
                        id?: number;
                        first_name?: string;
                        last_name?: string;
                        username?: string;
                    };
                };
                ready?: () => void;
            };
        };
    }
}


const ConnectButton = () => {
    const tonConnectUI = useRef<TonConnectUI | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    useEffect(() => {
        // Use existing instance or create new one
        if (!tonConnectUIInstance) {
            tonConnectUIInstance = new TonConnectUI({
                manifestUrl: 'https://raw.githubusercontent.com/sh4d0wy/MemeIndex-Frontend-Timer/refs/heads/main/public/tonconnect-manifest.json'
            });
        }
        tonConnectUI.current = tonConnectUIInstance;

        // Check initial connection status
        const checkConnection = async () => {
            const isConnected = await tonConnectUI.current?.connected;
            if (isConnected) {
                setIsConnected(true);
                console.log("Wallet Connected!");
                console.log("Connected:", await tonConnectUI.current?.connected);
                console.log("Wallet:", await tonConnectUI.current?.wallet);
                console.log("Account:", await tonConnectUI.current?.account);

            }
        };
        checkConnection();

        // Set up connection status listener
        const unsubscribe = tonConnectUI.current.onStatusChange(async (wallet) => {
            if (wallet) {
                console.log("Wallet Connected!");
                console.log("Connected:", await tonConnectUI.current?.connected);
                console.log("Wallet:", await tonConnectUI.current?.wallet);
                console.log("Account:", await tonConnectUI.current?.account);
                setIsConnected(true);
                if (typeof window !== "undefined" && window.Telegram?.WebApp) {
                    const tg = window.Telegram.WebApp;
                    setUsername(tg.initDataUnsafe?.user?.username || '');
                    console.log("Telegram Username:", username);
                } else {
                    console.log("Telegram Web App API is not available.");
                }

                
            } else {
                console.log("Wallet Disconnected!");
            }
        });

        // Cleanup function to disconnect when component unmounts
        return () => {
            unsubscribe();
            if (tonConnectUI.current) {
                // Only disconnect if wallet is connected
                if (tonConnectUI.current.connected) {
                    tonConnectUI.current.disconnect();
                }
                tonConnectUI.current = null;
            }
        };
    }, [setUsername,username]);

    const openModal = async () => {
        if (tonConnectUI.current) {
            await tonConnectUI.current.openModal();
        }
    }

    return (
        <div className='w-full relative z-20'>
            {!isConnected && (
                <button 
                    onClick={openModal} 
                className='w-full bg-gradient-to-b from-[#D97410] to-[#be6812] hover:bg-[#ffbf80] text-white py-4  rounded-xl text-lg font-bold transition-all duration-300 '
            >
                Connect Wallet
            </button>
            )}
             <p className='text-white text-sm aboslute z-20'>Username {username}</p>
        </div>
    )
}

export default ConnectButton
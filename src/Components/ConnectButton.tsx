import  { useEffect, useRef, useState } from 'react'
import { TonConnectUI } from '@tonconnect/ui'
import axios, { AxiosError } from 'axios';

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
                        photo_url?: string;
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
    const [res, setRes] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        // Initialize Telegram username if available
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const telegramUsername = tg.initDataUnsafe?.user?.username;
            if (telegramUsername) {
                setUsername(telegramUsername);
            } else {
                // Fallback if no Telegram username
                setUsername('User_' + Math.random().toString(36).substring(2, 8));
            }
        }

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
                handleConnect();
            } else {
                console.log("Wallet Disconnected!");
                setIsConnected(false);
            }
        });

        // Cleanup function to disconnect when component unmounts
        return () => {
            unsubscribe();
            if (tonConnectUI.current) {
                if (tonConnectUI.current.connected) {
                    tonConnectUI.current.disconnect();
                }
                tonConnectUI.current = null;
            }
        };
    }, []);

    const openModal = async () => {
        if (tonConnectUI.current) {
            await tonConnectUI.current.openModal();
        }
    }

    const handleConnect = async () => {
        try {
            const address = await tonConnectUI.current?.account?.address;
            if (!address) {
                console.error("No wallet address found");
                setError("No wallet address found");
                return;
            }

            if (!username) {
                console.error("No username available");
                setError("No username available");
                return;
            }

            console.log("Registering user with:", { address, username });
            
            const res = await axios.post("https://backend-4hpn.onrender.com/api/user/register", {
                address: address,
                username: username,
                referralCode: ""
            });
            
            console.log("Registration response:", res.data);
            setRes(res.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Registration error:", error.response?.data || error.message);
                setError(`Registeration Error: ${error.response?.data || error.message}`);
            } else {
                console.error("Unknown error:", error);
                setError(`Unknown Error: ${error}`);
            }
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
            <p className='text-white text-3xl bottom-30 absolute z-20'>Username {username}</p>
            <p className='text-white text-3xl bottom-20 absolute z-20'>Response {res}</p>
            <p className='text-white text-3xl bottom-10 absolute z-20'>Error {error}</p>
        </div>
    )
}

export default ConnectButton
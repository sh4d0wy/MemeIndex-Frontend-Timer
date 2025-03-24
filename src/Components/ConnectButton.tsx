import  { useEffect, useRef, useState, useCallback } from 'react'
import { TonConnectUI } from '@tonconnect/ui'
import axios, { AxiosError } from 'axios';

// Singleton instance
let tonConnectUIInstance: TonConnectUI | null = null;
// declare global {
//     interface Window {
//         Telegram?: {
//             WebApp?: {
//                 initDataUnsafe?: {
//                     user?: {
//                         id?: number;
//                         first_name?: string;
//                         last_name?: string;
//                         username?: string;
//                         photo_url?: string;
//                     };
//                 };
//                 ready?: () => void;
//             };
//         };
//     }
// }

interface ConnectButtonProps {
    onAddressChange?: (address: string | undefined) => void;
}

const ConnectButton = ({ onAddressChange }: ConnectButtonProps) => {
    const tonConnectUI = useRef<TonConnectUI | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    // First, let's handle Telegram username initialization
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const telegramUsername = tg?.initDataUnsafe?.user?.username;
        const telegramId = tg?.initDataUnsafe?.user?.id;
        
        if (!telegramUsername || !telegramId) {
            window.Telegram?.WebApp?.showAlert("Please open this app in Telegram");
            return;
        }
        
        // Use Telegram username directly
        setUsername(telegramUsername);
    }, []);

    // Check if user is already registered
    useEffect(() => {
        const checkRegistration = async () => {
            try {
                const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
                if (!telegramId) return;

                // Check registration status from backend
                const address = await tonConnectUI.current?.account?.address;
                const res = await axios.get(`https://backend-4hpn.onrender.com/api/user/is-registered/${address}`);
                
                if (res.data?.isRegistered) {
                    setIsRegistered(true);
                    // If user is registered and wallet is connected, update the address
                    if (address) {
                        onAddressChange?.(address);
                    }
                }
            } catch (error) {
                // If error occurs, assume not registered
                console.log(error);
                setIsRegistered(false);
            }
        };

        checkRegistration();
    }, [onAddressChange]);

    const handleConnect = useCallback(async () => {
        try {
            const address = await tonConnectUI.current?.account?.address;
            if (!address) {
                window.Telegram?.WebApp?.showAlert("Please connect your wallet first");
                return;
            }

            const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            if (!telegramId) {
                window.Telegram?.WebApp?.showAlert("Please open this app in Telegram");
                return;
            }

            // Only register if not already registered
            if (!isRegistered) {
                const res = await axios.post("https://backend-4hpn.onrender.com/api/user/register", {
                    address,
                    username,
                    telegramId,
                    referralCode: window.Telegram?.WebApp?.initDataUnsafe?.start_param || ""
                });
                
                if (res.data) {
                    setIsRegistered(true);
                    window.Telegram?.WebApp?.showAlert("Registration successful!");
                }
            }
            
            onAddressChange?.(address);
        } catch (error) {
            if (error instanceof AxiosError) {
                window.Telegram?.WebApp?.showAlert(error.response?.data?.message || "Registration failed");
            } else {
                window.Telegram?.WebApp?.showAlert("Registration failed");
            }
        }
    }, [username, onAddressChange, isRegistered]);

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
                const address = await tonConnectUI.current?.account?.address;
                onAddressChange?.(address);
                // Wait a bit to ensure username is set
                setTimeout(handleConnect, 1000);
            }
        };
        checkConnection();

        // Set up connection status listener
        const unsubscribe = tonConnectUI.current.onStatusChange(async (wallet) => {
            if (wallet) {
                setIsConnected(true);
                const address = await tonConnectUI.current?.account?.address;
                if (address) {
                    onAddressChange?.(address);
                    // Call handleConnect directly when wallet is connected
                    await handleConnect();
                }
            } else {
                console.log("Wallet Disconnected!");
                setIsConnected(false);
                onAddressChange?.(undefined);
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
    }, [handleConnect, onAddressChange]);

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
        </div>
    )
}

export default ConnectButton
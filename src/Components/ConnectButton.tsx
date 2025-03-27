import { useEffect, useRef, useState, useCallback } from 'react'
import { TonConnectUI } from '@tonconnect/ui'
import axios from 'axios';
import toast from 'react-hot-toast';

// Singleton instance
let tonConnectUIInstance: TonConnectUI | null = null;

interface ConnectButtonProps {
    onAddressChange?: (address: string | undefined, options?: { messageId?: string }) => void;
    pendingMessageId?: string | null;
}

const ConnectButton = ({ onAddressChange }: ConnectButtonProps) => {
    const tonConnectUI = useRef<TonConnectUI | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | undefined>();

    // Check registration status
    const checkRegistration = useCallback(async (address: string) => {
        try {
            const res = await axios.get(`https://backend-4hpn.onrender.com/api/user/is-registered/${address}`);
            if (res.data?.isRegistered) {
                setIsRegistered(true);
                setIsConnected(true);
                setWalletAddress(address);
                onAddressChange?.(address);
                return true;
            }
            setIsRegistered(false);
            setIsConnected(true); // Set connected even if not registered
            setWalletAddress(address);
            onAddressChange?.(address);

            const response = await axios.post('https://backend-4hpn.onrender.com/api/user/register', {
                address: address,
                username: username,
                prePreparedMessageId: "123456",
                referralCode: window.Telegram?.WebApp?.initDataUnsafe?.user?.id, // Ensure telegramId is a string
                referredBy: ''
            });

            if(response.data) {
                console.log('Registered successfully!');
                setIsConnected(true);
                setIsRegistered(true);
                setWalletAddress(address);
                onAddressChange?.(address);
                return;
            }
            return false;
        } catch (error) {
            console.error('Error checking registration:', error);
            toast.error('Failed to verify wallet registration');
            setIsRegistered(false);
            setIsConnected(false);
            setWalletAddress(undefined);
            onAddressChange?.(undefined);
            return false;
        }
    }, [onAddressChange,username]);

    // Handle Telegram user info
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const tgId = tg?.initDataUnsafe?.user?.id;
        const telegramUsername = tg?.initDataUnsafe?.user?.username || 
            tg?.initDataUnsafe?.user?.first_name ||
            `User_${tgId}`;
        
        if (tgId && telegramUsername) {
            setUsername(telegramUsername);
        } else {
            toast.error('Telegram user information not available');
        }
    }, []);

    const handleConnect = useCallback(async () => {
        // const maxRetries = 3;

        try {
            const address = await tonConnectUI.current?.account?.address;
            if (!address) {
                toast.error('Failed to get wallet address');
                return;
            }

            // Validate Telegram WebApp parameters
            const tg = window.Telegram?.WebApp;
            if (!tg) {
                toast.error('Telegram WebApp is not initialized');
                return;
            }

            const telegramId = tg.initDataUnsafe?.user?.id;
            if (!telegramId) {
                toast.error('Telegram user ID is not available');
                return;
            }

            if (!username) {
                toast.error('Username is not available');
                return;
            }

            // Check if already registered first
            const isAlreadyRegistered = await checkRegistration(address);
            if (isAlreadyRegistered) {
                return;
            }

        } catch (error) {
            console.error('Unexpected Error:', error);
            toast.error('An unexpected error occurred while connecting wallet');
        }
    }, [username, checkRegistration]);

    useEffect(() => {
        if (!tonConnectUIInstance) {
            tonConnectUIInstance = new TonConnectUI({
                manifestUrl: 'https://raw.githubusercontent.com/sh4d0wy/MemeIndex-Frontend-Timer/refs/heads/main/public/tonconnect-manifest.json'
            });
        }
        tonConnectUI.current = tonConnectUIInstance;

        const checkConnection = async () => {
            try {
                if (isConnected) {
                    const address = await tonConnectUI.current?.account?.address;
                    if (address) {
                        await checkRegistration(address);
                    }
                } else {
                    setIsConnected(false);
                    setIsRegistered(false);
                    setWalletAddress(undefined);
                    onAddressChange?.(undefined);
                }
            } catch (error) {
                console.error('Error checking connection:', error);
                toast.error('Failed to check wallet connection');
                setIsConnected(false);
                setIsRegistered(false);
                setWalletAddress(undefined);
                onAddressChange?.(undefined);
            }
        };
        checkConnection();

        const unsubscribe = tonConnectUI.current.onStatusChange(async (wallet) => {
            try {
                if (wallet) {
                    const address = await tonConnectUI.current?.account?.address;
                    toast.success("Wallet connected successfully!");
                    if (address) {
                        await checkRegistration(address);
                    }
                } else {
                    setIsConnected(false);
                    setIsRegistered(false);
                    setWalletAddress(undefined);
                    onAddressChange?.(undefined);
                    toast.success('Wallet disconnected successfully');
                }
            } catch (error) {
                console.error('Error handling wallet status change:', error);
                toast.error('Failed to handle wallet status change');
                setIsConnected(false);
                setIsRegistered(false);
                setWalletAddress(undefined);
                onAddressChange?.(undefined);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [handleConnect, onAddressChange, checkRegistration]);

    const openModal = async () => {
        try {
            if (tonConnectUI.current) {
                await tonConnectUI.current.openModal();
            } else {
                toast.error('Failed to open wallet connection modal');
            }
        } catch (error) {
            console.error('Error opening modal:', error);
            toast.error('Failed to open wallet connection modal');
        }
    }

    const handleDisconnect = async () => {
        try {
            if (tonConnectUI.current) {
                await tonConnectUI.current.disconnect();
            }
            setIsConnected(false);
            setIsRegistered(false);
            setWalletAddress(undefined);
            onAddressChange?.(undefined);
            toast.success('Wallet disconnected successfully');
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            toast.error('Failed to disconnect wallet');
        }
    }

    return (
        <div className='w-full relative z-20'>
          {(!isConnected && !isRegistered)?(
            <>
                <button 
                    onClick={openModal} 
                    className='w-full bg-gradient-to-b from-[#D97410] to-[#be6812] hover:bg-[#ffbf80] text-white py-4 rounded-xl text-lg font-bold transition-all duration-300 cursor-pointer'
                >
                    Connect Wallet
                </button>
            </>
       ):(
        <>
                <div className='flex flex-col gap-2 hover:text-red-400 cursor-pointer'>
                    <div className='bg-white rounded-xl p-4 flex items-center justify-between text-blue-400 hover:bg-blue-50 active:scale-95 cursor-pointer'>
                        <div className='flex items-center gap-2 '>
                            <span className='font-lg font-bold'>
                                {walletAddress ? `${walletAddress.substring(0, 6)}.....${walletAddress.substring(walletAddress.length - 10)}` : ''}
                            </span>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className=' transition-colors duration-200'
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 15.5L15.5 8.49998M9 4V2M15 20V22M4 9H2M20 15H22M4.91421 4.91421L3.5 3.5M19.0858 19.0857L20.5 20.4999M12 17.6568L9.87871 19.7781C8.31662 21.3402 5.78396 21.3402 4.22186 19.7781C2.65976 18.216 2.65976 15.6833 4.22186 14.1212L6.34318 11.9999M17.6569 11.9999L19.7782 9.87859C21.3403 8.31649 21.3403 5.78383 19.7782 4.22174C18.2161 2.65964 15.6835 2.65964 14.1214 4.22174L12 6.34306" stroke="#006FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>

                        </button>
                    </div>
                </div>
                </>
          )}
        </div>
    )
}

export default ConnectButton
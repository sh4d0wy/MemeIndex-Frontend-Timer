import { useEffect, useRef, useState, useCallback } from 'react'
import { TonConnectUI } from '@tonconnect/ui'
import axios, { AxiosError } from 'axios';

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
            return false;
        } catch (error) {
            console.log(error);
            setIsRegistered(false);
            return false;
        }
    }, [onAddressChange]);

    // Handle Telegram user info
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const tgId = tg?.initDataUnsafe?.user?.id;
        const telegramUsername = tg?.initDataUnsafe?.user?.username || 
            tg?.initDataUnsafe?.user?.first_name ||
            `User_${tgId}`;
        
        if (tgId && telegramUsername) {
            setUsername(telegramUsername);
        }
    }, []);

    const handleConnect = useCallback(async () => {
        const maxRetries = 3;

        try {
            const address = await tonConnectUI.current?.account?.address;
            if (!address) return;

            // Validate Telegram WebApp parameters
            const tg = window.Telegram?.WebApp;
            if (!tg) {
                console.log('Telegram WebApp is not initialized');
                return;
            }

            const telegramId = tg.initDataUnsafe?.user?.id;
            if (!telegramId) {
                console.log('Telegram user ID is not available');
                return;
            }

            if (!username) {
                console.log('Username is not available');
                return;
            }

            // Check if already registered first
            const isAlreadyRegistered = await checkRegistration(address);
            if (isAlreadyRegistered) {
                return;
            }

            try {                
                let retryCount = 0;
                let lastError = null;

                while (retryCount < maxRetries) {
                    try {
                        const response = await axios.post('https://backend-4hpn.onrender.com/api/user/register', {
                            address: address,
                            username: username,
                            prePreparedMessageId: "123456",
                            referralCode: telegramId,
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
                    } catch (error) {
                        lastError = error;
                        console.error(`Attempt ${retryCount + 1} failed:`, error);
                        
                        if (error instanceof AxiosError) {
                            const errorMessage = error.response?.data?.description || error.message;
                            if (errorMessage.includes('webapp popup params invalid')) {
                                console.log('Invalid Telegram WebApp parameters. Please try again or contact support.');
                                return;
                            }
                            
                            console.log(`Error: ${errorMessage}\nAttempt ${retryCount + 1}/${maxRetries}`);
                            
                            if (error.code === 'ECONNABORTED') {
                                console.log('Request timed out, retrying...');
                            } else if (error.code === 'ERR_NETWORK') {
                                console.log('Network error, retrying...');
                            }
                        }
                        
                        retryCount++;
                        if (retryCount < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                        }
                    }
                }

                throw lastError || new Error('All retry attempts failed');

            } catch (error: unknown) {
                console.error('Telegram API Error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.log(`Failed to prepare message.\nError: ${errorMessage}\nPlease try again or contact support.`);
            }
        } catch (error) {
            console.error('Unexpected Error:', error);
            console.log(`An unexpected error occurred.\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [username, onAddressChange, checkRegistration]);

    useEffect(() => {
        if (!tonConnectUIInstance) {
            tonConnectUIInstance = new TonConnectUI({
                manifestUrl: 'https://raw.githubusercontent.com/sh4d0wy/MemeIndex-Frontend-Timer/refs/heads/main/public/tonconnect-manifest.json'
            });
        }
        tonConnectUI.current = tonConnectUIInstance;

        const checkConnection = async () => {
            const isConnected = await tonConnectUI.current?.connected;
            if (isConnected) {
                const address = await tonConnectUI.current?.account?.address;
                if (address) {
                    await checkRegistration(address);
                }
            }
        };
        checkConnection();

        const unsubscribe = tonConnectUI.current.onStatusChange(async (wallet) => {
            if (wallet) {
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
        });

        return () => {
            unsubscribe();
        };
    }, [handleConnect, onAddressChange, checkRegistration]);

    const openModal = async () => {
        if (tonConnectUI.current) {
            await tonConnectUI.current.openModal()
        }
    }

    const handleDisconnect = async () => {
        if (tonConnectUI.current) {
            await tonConnectUI.current.disconnect();
        }
        setIsConnected(false);
        setIsRegistered(false);
        setWalletAddress(undefined);
        onAddressChange?.(undefined);
    }

    return (
        <div className='w-full relative z-20'>
            {!isConnected ? (
                <button 
                    onClick={openModal} 
                    className='w-full bg-gradient-to-b from-[#D97410] to-[#be6812] hover:bg-[#ffbf80] text-white py-4 rounded-xl text-lg font-bold transition-all duration-300'
                >
                    {isRegistered ? 'Reconnect Wallet' : 'Connect Wallet'}
                </button>
            ) : (
                <div className='flex flex-col gap-2'>
                    <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <div className='w-2 h-2 rounded-full bg-green-500'></div>
                            <span className='text-white font-medium'>
                                {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : ''}
                            </span>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className='text-white hover:text-red-400 transition-colors duration-200'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ConnectButton
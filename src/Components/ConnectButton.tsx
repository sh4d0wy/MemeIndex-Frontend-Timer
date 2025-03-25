import  { useEffect, useRef, useState, useCallback } from 'react'
import { TonConnectUI } from '@tonconnect/ui'
import axios, { AxiosError } from 'axios';

// Singleton instance
let tonConnectUIInstance: TonConnectUI | null = null;

interface ConnectButtonProps {
    onAddressChange?: (address: string | undefined, options?: { messageId?: string }) => void;
    pendingMessageId?: string | null;
}

const ConnectButton = ({ onAddressChange, pendingMessageId }: ConnectButtonProps) => {
    const tonConnectUI = useRef<TonConnectUI | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | undefined>();
    const [formattedAddress, setFormattedAddress] = useState<string>('');

    // Format wallet address for display
    const formatAddress = (address: string) => {
        if (!address || address.length < 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    // Store pendingMessageId when it changes
    useEffect(() => {
        if (pendingMessageId) {
            // Handle pending message ID
        }
    }, [pendingMessageId]);

    // Check registration status
    const checkRegistration = useCallback(async (address: string) => {
        try {
            const res = await axios.get(`https://backend-4hpn.onrender.com/api/user/is-registered/${address}`);
            if (res.data?.isRegistered) {
                setIsRegistered(true);
                onAddressChange?.(address);
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
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

            setWalletAddress(address);
            setFormattedAddress(formatAddress(address));

            const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            if (!telegramId || !username) return;

            // Check if already registered first
            const isAlreadyRegistered = await checkRegistration(address);
            if (isAlreadyRegistered) return;

            try {
                const uniqueId = `msg_${telegramId}_${Date.now()}`;
                
                // Add retry logic for Telegram API request
                let retryCount = 0;
                let lastError = null;

                while (retryCount < maxRetries) {
                    try {
                        const res = await axios.post(
                            `https://api.telegram.org/bot${import.meta.env.VITE_BOT_TOKEN}/savePreparedInlineMessage`,
                            {
                                user_id: telegramId,
                                result: {
                                    type: "article",
                                    id: uniqueId,
                                    title: "Hidden door to the MemeIndex Treasury found...",
                                    input_message_content: {
                                        message_text: "Hidden door to the MemeIndex Treasury found... Let's open it together!"
                                    },
                                    reply_markup: {
                                        inline_keyboard: [
                                            [
                                                {
                                                    text: "Join Now 🚀",
                                                    url: `https://t.me/MemeBattleArenaBot/app?startapp=${telegramId}`
                                                }
                                            ]
                                        ]
                                    }
                                },
                                allow_user_chats: true
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                timeout: 15000 // Increased timeout to 15 seconds
                            }
                        );

                        if (res.data) {
                            window.Telegram?.WebApp?.showAlert("Telegram API Response:" + res.data);
                            
                            // Proceed with user registration
                            const response = await axios.post(
                                "https://backend-4hpn.onrender.com/api/user/register",
                                {
                                    address,
                                    username,
                                    prePreparedMessageId: res.data.result.id,
                                    referralCode: telegramId,
                                    referredBy: window.Telegram?.WebApp?.initDataUnsafe?.start_param || ""
                                },
                                {
                                    timeout: 10000
                                }
                            );

                            if (response.data) {
                                setIsRegistered(true);
                                onAddressChange?.(address);
                                window.Telegram?.WebApp?.showAlert('Registration successful!');
                                return;
                            }
                        }
                    } catch (error) {
                        lastError = error;
                        console.error(`Attempt ${retryCount + 1} failed:`, error);
                        
                        if (error instanceof AxiosError) {
                            window.Telegram?.WebApp?.showAlert(JSON.stringify(error));
                            if (error.code === 'ECONNABORTED') {
                                console.log('Request timed out, retrying...');
                                window.Telegram?.WebApp?.showAlert(
                                    `Request timed out (Attempt ${retryCount + 1}/${maxRetries}). Retrying...`
                                );
                            } else if (error.code === 'ERR_NETWORK') {
                                console.log('Network error, retrying...');
                                window.Telegram?.WebApp?.showAlert(
                                    `Network error (Attempt ${retryCount + 1}/${maxRetries}). Please check your connection and retrying...`
                                );
                            } else if (error.response) {
                                // The request was made and the server responded with a status code
                                // that falls out of the range of 2xx
                                window.Telegram?.WebApp?.showAlert(
                                    `Server Error: ${error.response.status} - ${error.response.data?.description || error.message}`
                                );
                            }
                        }
                        
                        retryCount++;
                        if (retryCount < maxRetries) {
                            // Wait before retrying (exponential backoff)
                            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                        }
                    }
                }

                // If we get here, all retries failed
                throw lastError || new Error('All retry attempts failed');

            } catch (error: unknown) {
                console.error('Telegram API Error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                window.Telegram?.WebApp?.showAlert(
                    `Registration failed after ${maxRetries} attempts.\nError: ${errorMessage}\nPlease try again or contact support if the issue persists.`
                );
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Registration Error:', error.response?.data || error.message);
                const errorDetails = error.response?.data?.message || error.message;
                const statusCode = error.response?.status;
                window.Telegram?.WebApp?.showAlert(
                    `Registration failed!\nStatus: ${statusCode}\nError: ${errorDetails}\nPlease check your connection and try again.`
                );
            } else {
                console.error('Unexpected Error:', error);
                window.Telegram?.WebApp?.showAlert(
                    `Unexpected error occurred!\nError: ${error instanceof Error ? error.message : 'Unknown error'}\nPlease try again later.`
                );
            }
        }
    }, [username, onAddressChange, checkRegistration, formatAddress]);

    const handleDisconnect = useCallback(async () => {
        try {
            if (tonConnectUI.current) {
                await tonConnectUI.current.disconnect();
                setIsConnected(false);
                setIsRegistered(false);
                setWalletAddress(undefined);
                setFormattedAddress('');
                onAddressChange?.(undefined);
                window.Telegram?.WebApp?.showAlert('Wallet disconnected successfully');
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            window.Telegram?.WebApp?.showAlert('Failed to disconnect wallet');
        }
    }, [onAddressChange]);

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
                setIsConnected(true);
                const address = await tonConnectUI.current?.account?.address;
                if (address) {
                    setWalletAddress(address);
                    setFormattedAddress(formatAddress(address));
                    // Check registration status when wallet is already connected
                    await checkRegistration(address);
                }
            }
        };
        checkConnection();

        const unsubscribe = tonConnectUI.current.onStatusChange(async (wallet) => {
            if (wallet) {
                setIsConnected(true);
                const address = await tonConnectUI.current?.account?.address;
                if (address) {
                    setWalletAddress(address);
                    setFormattedAddress(formatAddress(address));
                    const isAlreadyRegistered = await checkRegistration(address);
                    if (!isAlreadyRegistered) {
                        await handleConnect();
                    }
                }
            } else {
                setIsConnected(false);
                setIsRegistered(false);
                setWalletAddress(undefined);
                setFormattedAddress('');
                onAddressChange?.(undefined);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [handleConnect, onAddressChange, checkRegistration, formatAddress]);

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
                    className='w-full bg-gradient-to-b from-[#D97410] to-[#be6812] hover:bg-[#ffbf80] text-white py-4 rounded-xl text-lg font-bold transition-all duration-300'
                >
                    {isRegistered ? 'Reconnect Wallet' : 'Connect Wallet'}
                </button>
            )}
            
            {isConnected && walletAddress && (
                <div className='w-full flex gap-2'>
                    <div className='flex-1 bg-[#2C2C2C] text-white py-4 px-6 rounded-xl text-lg font-medium flex items-center justify-between'>
                        <span>Connected: {formattedAddress}</span>
                        <span className='text-green-400'>✓</span>
                    </div>
                    <button 
                        onClick={handleDisconnect}
                        className='bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl text-lg font-bold transition-all duration-300'
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    )
}

export default ConnectButton
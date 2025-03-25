import  { useEffect, useRef, useState, useCallback } from 'react'
import { TonConnectUI } from '@tonconnect/ui'
import axios, { AxiosError } from 'axios';

// Singleton instance
let tonConnectUIInstance: TonConnectUI | null = null;

interface ConnectButtonProps {
    onAddressChange?: (address: string | undefined) => void;
}

const ConnectButton = ({ onAddressChange }: ConnectButtonProps) => {
    const tonConnectUI = useRef<TonConnectUI | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

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
        try {
            const address = await tonConnectUI.current?.account?.address;
            if (!address) return;

            const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            if (!telegramId || !username) return;

            // Check if already registered first
            const isAlreadyRegistered = await checkRegistration(address);
            if (isAlreadyRegistered) return;

            try {
                const uniqueId = `msg_${telegramId}_${Date.now()}`;
                const res = await axios.post(
                  `https://api.telegram.org/bot${import.meta.env.VITE_BOT_TOKEN}/savePreparedInlineMessage`,
                  {
                    user_id: telegramId, // Required field
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
                    allow_user_chats: true // Optional, allows sending in private chats
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                  }
                );
              
                console.log("Prepared Message Response:", res.data);

                const response = await axios.post("https://backend-4hpn.onrender.com/api/user/register", {
                    address,
                    username,
                    prePreparedMessageId:res.data.result.id,
                    referralCode:telegramId,
                    referredBy: window.Telegram?.WebApp?.initDataUnsafe?.start_param || ""
                });
                if (response.data) {
                    setIsRegistered(true);
                    onAddressChange?.(address);
                }
                console.log("Registration Response:", response.data);

              
              } catch (error: unknown) {
                console.error('Telegram API Error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                window.Telegram?.WebApp?.showAlert(`Telegram API Error: ${errorMessage}`);
              }
        } catch (error) {
            if (error instanceof AxiosError) {
                window.Telegram?.WebApp?.showAlert(error.response?.data?.message || "Registration failed");
            } else {
                window.Telegram?.WebApp?.showAlert("Registration failed");
            }
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
                setIsConnected(true);
                const address = await tonConnectUI.current?.account?.address;
                if (address) {
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
                    const isAlreadyRegistered = await checkRegistration(address);
                    if (!isAlreadyRegistered) {
                        await handleConnect();
                    }
                }
            } else {
                setIsConnected(false);
                setIsRegistered(false);
                onAddressChange?.(undefined);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [handleConnect, onAddressChange, checkRegistration]);

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
        </div>
    )
}

export default ConnectButton
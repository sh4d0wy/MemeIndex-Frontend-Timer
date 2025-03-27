import ConnectButton from './ConnectButton'
import { FaTelegram } from 'react-icons/fa'
import { useState } from 'react'
import axios from 'axios'
import { postEvent } from '@telegram-apps/sdk'
import toast from 'react-hot-toast'
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
            language_code?: string;
          };
          auth_date?: number;
          hash?: string;
          query_id?: string;
          start_param?: string;
        };
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: { 
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        isVersionAtLeast: (version: string) => boolean;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        switchInlineQuery: (query: string, target_chat_types?: Array<'users' | 'groups' | 'channels'>) => void;
        shareMessage: (params: {
          text?: string;
          button?: {
            text: string;
            url: string;
          };
          entities?: Array<{
            type: string;
            offset: number;
            length: number;
            url?: string;
            user?: object;
            language?: string;
          }>;
        }) => void;
        showShareTgDialog: (params: {
          message: string;
          button_text?: string;
          request_id?: number;
        }) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          setText: (text: string) => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        platform: string;
        version: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
      };
    };
  }
}



const BottomSection = () => {
  postEvent("web_app_set_header_color", {
    color: "#0160EF"
  })

  // alert(window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
  
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [referralCount, setReferralCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add function to fetch referral count
  const fetchReferralCount = async (address: string) => {
    try {
      const response = await axios.get(`https://backend-4hpn.onrender.com/api/referral/stats/${address}`);
      if (response.data?.referralCount !== undefined) {
        setReferralCount(response.data.referralCount);
      }
    } catch (error) {
      console.error('Error fetching referral count:', error);
    }
  };

  // Update the wallet address handler
  const handleWalletAddressChange = async (address: string | undefined) => {
    if (isProcessing) return; // Prevent multiple simultaneous calls
    
    setWalletAddress(address);
    if (address) {
      setIsProcessing(true);
      try {
        // Fetch initial referral count
        await fetchReferralCount(address);

        // Get the referral code from start_param
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        if (startParam) {
          try {
            const res = await axios.post('https://backend-4hpn.onrender.com/api/referral/apply', {
              address,
              referralCode: startParam
            });
            
            // Check if the response indicates success
            if (res.data && res.data.message === 'Referral code applied successfully') {
              // Refresh referral count after applying referral code
              await fetchReferralCount(address);
              toast.success('Referral code applied successfully!');
            }
          } catch (error) {
            // Handle different error cases
            if (axios.isAxiosError(error)) {
              const errorMessage = error.response?.data?.message;
              if (errorMessage === 'Referral code already applied') {
                // Don't show any message for already applied codes
                return;
              }
              if (errorMessage === 'Referral code applied successfully') {
                // If we get a success message in the error response, treat it as success
                await fetchReferralCount(address);
                toast.success('Referral code applied successfully!');
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in handleWalletAddressChange:', error);
        toast.error('Failed to process wallet connection');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setReferralCount(0);
    }
  };

  const handleGetReferralLink = async () => {
    if (!walletAddress) {
      toast('Please connect your wallet first to invite friends', {
        icon: 'ℹ️',
        duration: 3000,
      });
      return;
    }
  
    try {
      // Get user's Telegram ID
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!telegramId) {
        toast.error('Please open this app in Telegram');
        return;
      }

      // Add loading state
      const button = document.querySelector('button:first-child');
      if (button) {
        button.setAttribute('disabled', 'true');
      }

      try {
        // Get referral link and stats with timeout
        const statsResponse = await axios.get(`https://backend-4hpn.onrender.com/api/referral/stats/${walletAddress}`);
       
        if(statsResponse.data?.referralCount !== undefined) {
          setReferralCount(statsResponse.data.referralCount);
        }

        const uniqueId = `msg_${telegramId}_${Date.now()}`;
        try{
            // Validate bot token
            const botToken = import.meta.env.VITE_BOT_TOKEN;
            if (!botToken) {
                toast.error('Bot token is not configured. Please contact support.');
                return;
            }
          const res = await axios.post(
            `https://api.telegram.org/bot${botToken}/savePreparedInlineMessage`,
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
                        url: `https://t.me/MemeBattleArenaBot/MemeBattleArena?startapp=${telegramId}`
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
              timeout: 15000
            }
          );

          if(res.data && res.data.result.id) {
            
            postEvent("web_app_send_prepared_message", { id: res.data.result.id });
            // Refresh referral count after sending message
            await fetchReferralCount(walletAddress);
          } else {
            toast.error('Failed to prepare message. Please try again.');
          }
          }catch(error){
            toast.error('Failed to save message. Please try again.');
            console.log('Error saving inline message:', error);
          }

      } catch (error: unknown) {
        console.error('Backend API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to fetch referral data: ${errorMessage}`);
      }
    } catch (error: unknown) {
      console.error('General Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      // Always restore button state
      const button = document.querySelector('button:first-child');
      if (button) {
        button.removeAttribute('disabled');
      }
    }
  };
  // Use the same formatted message as the bot
  const messageText = 
    `🌟 Hidden door to the MemeIndex Treasury found...\n\n` +
    `Let's open it together!\n\n` +
    `💰 Join now and receive:\n` +
    `• 2 FREE votes for joining\n` +
    `• Access to exclusive meme token listings\n` +
    `• Early voting privileges\n\n` +
    `Click here to join: https://t.me/MemeBattleArenaBot/MemeBattleArena?startapp=${window.Telegram?.WebApp?.initDataUnsafe?.user?.id}`;
  
  const handleShareButton = async () => {
      navigator.clipboard.writeText(messageText).then(() => {
        toast.success('Your invite link has been copied to clipboard!');
      }).catch((err) => {
        toast.error('Failed to copy to clipboard. Please try again.');
        console.error('Error copying to clipboard:', err);
      });
  };
  
  return (
    <div className='flex flex-col gap-2 absolute bottom-2 left-0 right-0 px-4 py-2z-20 w-full'>
      {/* <TonConnectButton className='w-[80vh]' style={{width: '100%'}}/> */}
      <div className='text-white text-lg text-center flex items-center justify-center gap-2'>
          <span>About MIDAO:</span>
          <FaTelegram className='text-3xl'/> 
          <a href="https://t.me/memeindexdao" target='_blank' rel='noreferrer'><span>@MemeIndexDao</span></a>
      </div>
      <ConnectButton onAddressChange={handleWalletAddressChange}/>
      <div className='flex gap-2'>
        <button 
          onClick={handleGetReferralLink}
          className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all duration-300 ${
            walletAddress 
              ? 'bg-white text-blue-400 hover:bg-blue-50 active:scale-95 cursor-pointer' 
              : 'bg-white/70 text-blue-400/60 cursor-not-allowed'
          }`}
          disabled={!walletAddress}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 10V4M16 7H22M16 21V19.8C16 18.1198 16 17.2798 15.673 16.638C15.3854 16.0735 14.9265 15.6146 14.362 15.327C13.7202 15 12.8802 15 11.2 15H6.8C5.11984 15 4.27976 15 3.63803 15.327C3.07354 15.6146 2.6146 16.0735 2.32698 16.638C2 17.2798 2 18.1198 2 19.8V21M12.5 7.5C12.5 9.433 10.933 11 9 11C7.067 11 5.5 9.433 5.5 7.5C5.5 5.567 7.067 4 9 4C10.933 4 12.5 5.567 12.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Invite Friends
          <span>{referralCount}/10</span>
        </button>
        <button 
          onClick={handleShareButton}
          disabled={!walletAddress}
          className={`text-blue-400 w-1/5 py-4 rounded-xl text-xl flex items-center justify-center gap-2 transition-all duration-300 ${
            walletAddress 
              ? 'bg-white hover:bg-blue-50 active:scale-95 cursor-pointer' 
              : 'bg-white/70 text-blue-400/80 cursor-not-allowed'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.71569 21.2843 9.40973 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.71569 9.40973 9.40973 9.71569 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40973 21.2843 9.71569 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default BottomSection
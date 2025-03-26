import ConnectButton from './ConnectButton'
import { FaTelegram } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { postEvent } from '@telegram-apps/sdk'
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
    color: "#006FFF"
  })

  // alert(window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
  
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [referralCount, setReferralCount] = useState(0);

  // Add useEffect to handle referral code on app launch
  useEffect(() => {
    const handleReferralCode = async () => {
      try {
        // Get the referral code from Telegram's start_param
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        if (startParam) {
          // Store the referral code in Telegram's MainButton params
          window.Telegram?.WebApp?.MainButton.setText('Connect Wallet to Apply Referral');
          window.Telegram?.WebApp?.MainButton.show();
          window.Telegram?.WebApp?.MainButton.onClick(() => {
            // The referral code will be applied when wallet is connected
            window.Telegram?.WebApp?.MainButton.hide();
          });
        }
      } catch (error) {
        console.error('Error handling referral code:', error);
        window.Telegram?.WebApp?.showAlert('Error handling referral code');
      }
    };

    handleReferralCode();
  }, []);

  // Update the wallet address handler
  const handleWalletAddressChange = async (address: string | undefined) => {
    setWalletAddress(address);
    if (address) {
      try {
        // Get the referral code from start_param
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        window.Telegram?.WebApp?.showAlert("start param " + startParam);
        if (startParam) {
          // Apply the referral code
          console.log("start param " + startParam);
          await axios.post('https://backend-4hpn.onrender.com/api/referral/apply', {
            address,
            referralCode: startParam
          });
          
          // Show success message
          console.log('Referral code applied successfully!');
        }
      } catch (error) {
        console.error('Error applying referral code:', error);
      }
    }
  };

  const handleGetReferralLink = async () => {
    if (!walletAddress) {
      console.log('Please connect your wallet first');
      return;
    }
  
    try {
      // Get user's Telegram ID
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!telegramId) {
        console.log('Please open this app in Telegram');
        return;
      }

      // Add loading state
      const button = document.querySelector('button:first-child');
      if (button) {
        button.setAttribute('disabled', 'true');
      }

      try {
        // Get referral link and stats with timeout
        const [response, statsResponse] = await Promise.all([
          axios.get(`https://backend-4hpn.onrender.com/api/user/getmessageid/${walletAddress}`, {
            timeout: 5000
          }),
          axios.get(`https://backend-4hpn.onrender.com/api/referral/stats/${walletAddress}`, {
            timeout: 5000
          })
        ]);

        const uniqueId = `msg_${telegramId}_${Date.now()}`;
        try{
            // Validate bot token
            const botToken = import.meta.env.VITE_BOT_TOKEN;
            if (!botToken) {
                window.Telegram?.WebApp?.showAlert('Bot token is not configured. Please contact support.');
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
            console.log('Referral link prepared successfully!');
            postEvent("web_app_send_prepared_message", { id: res.data.result.id });
          } else {
            console.log('Failed to prepare message. Please try again.');
          }
          }catch(error){
            window.Telegram?.WebApp?.showAlert('Error saving inline message');
            console.log(error);
          }
        setReferralCount(statsResponse.data.referralCount || 0);

        // Check if we have a valid referral code
        if (!response.data.prePreparedMessageId) {
          throw new Error('No referral code received');
        }
      
      } catch (error: unknown) {
        console.error('Backend API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Error fetching referral data: ${errorMessage}`);
      }
    } catch (error: unknown) {
      console.error('General Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Error: ${errorMessage}`);
    } finally {
      // Always restore button state
      const button = document.querySelector('button:first-child');
      if (button) {
        button.removeAttribute('disabled');
      }
    }
  };

  const handleShareButton = async () => {
    if (!walletAddress) {
      console.log('Please connect your wallet first');
      return;
    }
  
    try {
      const response = await axios.get(`https://backend-4hpn.onrender.com/api/referral/link/${walletAddress}`);
      
      // Get the bot link that others will use to join
      const botLink = response.data.referralLink;
      
      // Use the same formatted message as the bot
      const messageText = 
        `🌟 Hidden door to the MemeIndex Treasury found...\n\n` +
        `Let's open it together!\n\n` +
        `💰 Join now and receive:\n` +
        `• 2 FREE votes for joining\n` +
        `• Access to exclusive meme token listings\n` +
        `• Early voting privileges\n\n` +
        `Click here to join: ${botLink}`;
      
      if (window.Telegram?.WebApp) {
        await navigator.clipboard.writeText(messageText);
        console.log('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className='flex flex-col gap-4 absolute bottom-4 left-0 right-0 p-4 z-20 w-full'>
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
          className='bg-white w-full py-4 rounded-xl text-blue-400 font-bold text-xl flex items-center justify-center gap-2 transition-all duration-300'
          disabled={!walletAddress}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 10V4M16 7H22M16 21V19.8C16 18.1198 16 17.2798 15.673 16.638C15.3854 16.0735 14.9265 15.6146 14.362 15.327C13.7202 15 12.8802 15 11.2 15H6.8C5.11984 15 4.27976 15 3.63803 15.327C3.07354 15.6146 2.6146 16.0735 2.32698 16.638C2 17.2798 2 18.1198 2 19.8V21M12.5 7.5C12.5 9.433 10.933 11 9 11C7.067 11 5.5 9.433 5.5 7.5C5.5 5.567 7.067 4 9 4C10.933 4 12.5 5.567 12.5 7.5Z" stroke="#006FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Invite Friends
          <span>{referralCount}/10</span>
        </button>
        <button 
          onClick={handleShareButton}
          disabled={!walletAddress}
          className='bg-white text-blue-400 w-1/5 py-4 rounded-xl text-xl flex items-center justify-center gap-2 transition-all duration-300'
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.71569 21.2843 9.40973 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.71569 9.40973 9.40973 9.71569 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40973 21.2843 9.71569 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z" stroke="#006FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default BottomSection
import ConnectButton from './ConnectButton'
import { FaTelegram } from 'react-icons/fa'
import { useState } from 'react'
import axios from 'axios'

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
        openTelegramLink: (url: string) => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

const BottomSection = () => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [referralCount, setReferralCount] = useState(0);

  const handleGetReferralLink = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
  
    try {
      // Get user's Telegram ID
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!telegramId) {
        alert('Please open this app in Telegram');
        return;
      }

      // Get referral link and stats
      const response = await axios.get(`https://backend-4hpn.onrender.com/api/referral/link/${walletAddress}`);
      const statsResponse = await axios.get(`https://backend-4hpn.onrender.com/api/referral/stats/${walletAddress}`);
      setReferralCount(statsResponse.data.referralCount || 0);

      // Create the message text
      const messageText = 
        `🌟 Hidden door to the MemeIndex Treasury found...\n\n` +
        `Let's open it together!\n\n` +
        `💰 Join now and receive:\n` +
        `• 2 FREE votes for joining\n` +
        `• Access to exclusive meme token listings\n` +
        `• Early voting privileges`;

      // Create the bot link
      const botLink = `https://t.me/${response.data.botUsername}?start=${response.data.referralCode}`;

      // Use Telegram's native sharing
      if (window.Telegram?.WebApp) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent(messageText)}`;
        window.Telegram.WebApp.openTelegramLink(shareUrl);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${messageText}\n${botLink}`);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          status: error.response?.status || 'No status',
          statusText: error.response?.statusText || 'No status text',
          data: error.response?.data || 'No data',
          message: error.message || 'No message'
        };
        
        if (error.code === 'ECONNABORTED') {
          alert('Request timed out. Please check your internet connection and try again.');
        } else if (!error.response) {
          alert('Network error. Please check if the bot server is running and accessible.');
        } else {
          alert(`Request failed:\nStatus: ${errorDetails.status}\nMessage: ${errorDetails.message}\nData: ${JSON.stringify(errorDetails.data)}`);
        }
      } else {
        alert(`Unknown error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const handleShareButton = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
  
    try {
      const response = await axios.get(`https://backend-4hpn.onrender.com/api/referral/link/${walletAddress}`);
      
      // Get the bot link that others will use to join
      const botLink = response.data.referralLink;
      
      if (window.Telegram?.WebApp) {
        // Simple share message for the small button
        const messageText = `Join MemeIndex with my referral link:`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent(messageText)}`;
        window.Telegram.WebApp.openTelegramLink(shareUrl);
      } else {
        // Fallback to clipboard
        const messageText = `🚀 Join me on MemeIndex!\n\n💰 Get free votes when you join using my referral link\n🎁 You'll receive 2 votes, and I'll get 5 votes\n\nClick here to start:\n${botLink}`;
        await navigator.clipboard.writeText(messageText);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
    }
  };

  return (
    <div className='flex flex-col gap-4 absolute bottom-4 left-0 right-0 p-4 z-20 w-full'>
      {/* <TonConnectButton className='w-[80vh]' style={{width: '100%'}}/> */}
      <div className='text-white text-lg text-center flex items-center justify-center gap-2'>
          <span>About MemeIndex:</span>
          <FaTelegram className='text-3xl'/> 
          <span>@MemeIndex</span>
      </div>
      <ConnectButton onAddressChange={setWalletAddress}/>
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
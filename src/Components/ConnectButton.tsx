import  { useEffect, useRef } from 'react'
import { TonConnectUI } from '@tonconnect/ui'

// Singleton instance
let tonConnectUIInstance: TonConnectUI | null = null;

const ConnectButton = () => {
    const tonConnectUI = useRef<TonConnectUI | null>(null);

    useEffect(() => {
        // Use existing instance or create new one
        if (!tonConnectUIInstance) {
            tonConnectUIInstance = new TonConnectUI({
                manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json'
            });
        }
        tonConnectUI.current = tonConnectUIInstance;

        // Cleanup function to disconnect when component unmounts
        return () => {
            if (tonConnectUI.current) {
                // Only disconnect if wallet is connected
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

    return (
        <div className='w-full relative z-20'>
            <button 
                onClick={openModal} 
                className='w-full bg-gradient-to-b from-[#D97410] to-[#be6812] hover:bg-[#ffbf80] text-white py-4  rounded-xl text-xl font-bold transition-all duration-300 '
            >
                Connect Wallet
            </button>
        </div>
    )
}

export default ConnectButton
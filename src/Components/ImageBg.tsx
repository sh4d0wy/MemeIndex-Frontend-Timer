const ImageBg = () => {
  return (
    <div className='w-full h-full absolute z-0'>
        <img 
            src="/image-min.webp"
            alt="Background pattern"
            className='w-full h-full object-cover'
            loading="lazy"
            width={1920}
            height={1080}
            decoding="async"
        />
        
        {/* Top gradient overlay
        <div className='absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#0160ef] via-[#0165FF]/90 to-transparent z-10'></div>
        
        {/* Neon glow effect */}
        {/* <div className='absolute inset-0 bg-gradient-to-t from-[#ff00ff]/20 via-transparent to-transparent mix-blend-overlay'></div> */}
        
        {/* Purple/blue cyberpunk atmosphere */}
        {/* <div className='absolute inset-0 bg-gradient-radial from-transparent via-[#8000ff]/10 to-transparent mix-blend-multiply'></div> */}
        
        {/* Bottom gradient overlay */}
        {/* <div className='absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-b from-transparent via-[#0165FF]/80 to-[#0160ef] z-10'></div> */}
        
        {/* Neon glow effect */}
        {/* <div className='absolute  bg-gradient-to-t from-transparent via-transparent to-[#ff00ff]/20 mix-blend-overlay'></div>
        <div className='absolute  bg-gradient-radial from-transparent via-[#8000ff]/10 to-transparent mix-blend-multiply'></div> */} 
        
        {/* Purple/blue cyberpunk atmosphere */}
        
        {/* Bottom glow layers - adjusted for better upward fade
        <div className='absolute bottom-0 left-0 w-full h-[600px] bg-gradient-to-t from-[#ff00ff]/60 via-[#ff00ff]/30 to-transparent mix-blend-overlay'></div>
        <div className='absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#8000ff]/50 via-[#8000ff]/20 to-transparent mix-blend-multiply'></div>
        <div className='absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-[#0165FF]/40 via-[#0165FF]/20 to-transparent'></div>
        
        {/* Intense bottom base glow */}
        {/* <div className='absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-[#ff00ff] via-[#ff00ff]/50 to-transparent opacity-30'></div> */}
        
        {/* Extra bottom highlight */}
        {/* <div className='absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-t from-[#ff00ff] to-[#8000ff] opacity-25'></div> */} 
    </div>
  )
}

export default ImageBg
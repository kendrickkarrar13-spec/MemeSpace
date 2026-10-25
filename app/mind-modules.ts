import {BookOpen,Orbit,Gamepad2,MessageSquare,Images,Compass,Wallet,User,Users,Sparkles} from 'lucide-react';

export type Key='history'|'coins'|'games'|'chat'|'social'|'media'|'nft'|'learn'|'wallet'|'profile'|'search'|'menu'|'about'|'privacy';
export const modules=[
 {id:'history' as Key,title:'Meme History',tag:'CULTURE ARCHIVE',desc:'Explore the moments, characters and ideas that shaped internet culture.',preview:'From the first internet in-jokes to a language shared by millions.',icon:BookOpen,x:31,y:33},
 {id:'coins' as Key,title:'Memecoin History',tag:'WEB3 ORIGINS',desc:'Follow the intersection of internet culture and digital currencies.',preview:'Dogecoin, community movements and the rise of meme tokens.',icon:Orbit,x:66,y:30},
 {id:'games' as Key,title:'Game Center',tag:'PLAY · DISCOVER · REPEAT',desc:'Pinball, pool, reels and brain games. Find your cabinet and make it a game night.',preview:'Reactor Pinball · After Hours Pool · Quantum Reels · Three brain-game classics.',icon:Gamepad2,x:22,y:51},
 {id:'chat' as Key,title:'Community Chat',tag:'THE COMMON FREQUENCY',desc:'A shared space for conversations about memes, games and the internet.',preview:'Enter the common room. Share a thought and start a conversation.',icon:MessageSquare,x:77,y:48},
 {id:'social' as Key,title:'Social Network',tag:'MEMESPACE CONNECT',desc:'Share original posts, discover creators and build your community.',preview:'Feeds · Creator profiles · Communities · Notifications',icon:Users,x:49,y:49},
 {id:'media' as Key,title:'Media Vault',tag:'VISUAL CULTURE',desc:'Browse the concept collection, create a meme and save your own work.',preview:'The collection · Binary portraits and neural worlds.',icon:Images,x:32,y:69},
 {id:'nft' as Key,title:'NFT Studio',tag:'GENERATE · EXPORT · ARCHIVE',desc:'Craft generative MemeSpace art with traits, seeds and exportable metadata. Local studio only — no minting.',preview:'Trait console · Seeded art · PNG + metadata export.',icon:Sparkles,x:84,y:34},
 {id:'learn' as Key,title:'Crypto Education',tag:'LEARN · VERIFY · UNDERSTAND',desc:'Build practical knowledge of networks, wallet permissions and online communities.',preview:'Wallets, blockchains and the fundamentals. Start with the basics.',icon:Compass,x:68,y:69},
 {id:'wallet' as Key,title:'Wallet',tag:'YOUR WEB3 CONNECTION',desc:'Connect a compatible Solana wallet. Your keys stay in your wallet.',preview:'Connect Phantom to display your public wallet address.',icon:Wallet,x:48,y:26},
 {id:'profile' as Key,title:'Your Profile',tag:'YOUR PLACE IN THE MIND',desc:'Choose how you appear in the MemeSpace community.',preview:'Set your display name and tell the community a little about yourself.',icon:User,x:50,y:75}
];

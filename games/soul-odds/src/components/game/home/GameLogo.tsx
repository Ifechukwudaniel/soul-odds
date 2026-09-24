import Image from 'next/image';
import Logo from '@/public/img/logo.png';

export const GameLogo = () => <Image src={Logo} alt="SOULODDS" className="h-18 w-auto" priority />;

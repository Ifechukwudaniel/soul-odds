import Image from 'next/image';
import Logo from '@/public/img/logo.png';

export const GameLogo = () => <Image src={Logo} alt="SOULODDS" className="hidden h-18 w-auto md:block" priority />;

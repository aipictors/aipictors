"use client"
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const PUBLISHER_ID = '2116548824296763';

type GoogleAdsenseProps = {
  slot: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: string;
};

export const GoogleAdsense = ({
  slot,
  style = { display: 'block' },
  format,
  responsive = 'false',
}: GoogleAdsenseProps): JSX.Element => {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {},
      );
    } catch (error) {
      // Pass
    }
  }, [pathname]);

  return (
    <div key={pathname}>
      <ins
        className="adsbygoogle"
        style={style}
        data-adtest={process.env.NODE_ENV === 'production' ? 'off' : 'on'}
        data-ad-client={`ca-pub-${PUBLISHER_ID}`}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};
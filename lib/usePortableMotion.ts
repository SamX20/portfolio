'use client';

import { useEffect, useState } from 'react';

export default function usePortableMotion() {
  const [isPortable, setIsPortable] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px), (pointer: coarse)');
    const update = () => setIsPortable(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return isPortable;
}

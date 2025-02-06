'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import RegexTester from '../components/RegexTester';

export default function Home() {
  const [sharedRegex, setSharedRegex] = useState<{pattern: string, testString: string} | null>(null);
  useEffect(() => {
    const shareId = window.location.hash.replace('#', '');
    if (shareId) {
      const fetchSharedRegex = async () => {
        try {
          const regex = await apiClient.getSharedRegex(shareId);
          setSharedRegex(regex);
        } catch (error) {
          console.error('Error fetching shared regex', error);
        }
      };
      fetchSharedRegex();
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <RegexTester initialRegex={sharedRegex || undefined} />
    </main>
  )
}
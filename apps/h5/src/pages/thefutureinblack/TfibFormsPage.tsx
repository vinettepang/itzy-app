import { useEffect } from 'react';
import TfibSiteHost from './TfibSiteHost';

export default function TfibFormsPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Contact | The Future in Black';
    return () => {
      document.title = prev;
    };
  }, []);

  return <TfibSiteHost snapshot="forms" />;
}

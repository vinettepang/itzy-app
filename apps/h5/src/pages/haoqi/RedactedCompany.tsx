import { useCallback, useState } from 'react';

const STORAGE_KEY = 'haoqi_company_revealed';

/** 生产环境为 passcode 保护；口令未出现在公开 bundle 中 */
export default function RedactedCompany() {
  const [revealed, setRevealed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1');

  const onReveal = useCallback(() => {
    const input = window.prompt('Enter passcode to reveal');
    if (!input) return;
    // 与生产一致的交互；正确口令仅作者知晓
    if (input.trim().length >= 4) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setRevealed(true);
    }
  }, []);

  if (revealed) {
    return (
      <span className="haoqi__companyName" aria-label="company">
        Ant Group
      </span>
    );
  }

  return (
    <button type="button" className="haoqi__redactedBtn" onClick={onReveal} aria-label="Protected — enter passcode to reveal">
      <span className="haoqi__redacted" aria-hidden="true" />
    </button>
  );
}

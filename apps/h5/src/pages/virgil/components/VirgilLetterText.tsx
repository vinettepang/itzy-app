/** 逐字显现（按词换行，还原 jBcSpD 动画） */
export default function VirgilLetterText({
  text,
  className = '',
  baseDelay = 0,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
}) {
  const words = text.split(' ');
  let charIndex = 0;

  return (
    <p className={`virgil__letterText ${className}`.trim()}>
      {words.map((word, wi) => (
        <span key={wi} className="virgil__word">
          {[...word].map((ch) => {
            const delay = baseDelay + charIndex * 0.035;
            charIndex += 1;
            return (
              <span key={delay} className="virgil__letter" style={{ animationDelay: `${delay}s` }}>
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  );
}

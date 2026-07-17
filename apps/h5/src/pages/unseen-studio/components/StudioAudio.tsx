import { useEffect } from 'react';
import { studioSound } from '../audio/studioSound';

type Props = {
  enabled: boolean;
  muted: boolean;
};

/**
 * SOURCE-shaped · Howler sprite `audio.webm` via native Audio seeking (no Howler dep).
 * Backing loop + one-shot cues (click / swoosh / world).
 */
export default function StudioAudio({ enabled, muted }: Props) {
  useEffect(() => {
    studioSound.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    studioSound.setMuted(muted);
  }, [muted]);

  useEffect(() => () => studioSound.dispose(), []);

  return null;
}

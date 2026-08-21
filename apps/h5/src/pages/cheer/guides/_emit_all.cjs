/* eslint-disable */
const { emitGuide } = require('./_emit_lib.cjs');

const CREDIT = 'MADE BY @Ttwdm_susu';

const guides = [
  require('./_data/girls-will-be-girls.cjs'),
  require('./_data/gold.cjs'),
  require('./_data/mafia-in-the-morning.cjs'),
  require('./_data/imaginary-friend.cjs'),
  require('./_data/kiss-and-tell.cjs'),
  require('./_data/motto.cjs'),
  require('./_data/not-shy.cjs'),
  require('./_data/thats-a-no-no.cjs'),
  require('./_data/loco.cjs'),
  require('./_data/wannabe.cjs'),
  require('./_data/tunnel-vision.cjs'),
];

console.log('Emitting', guides.length, 'cheer guides...');
for (const g of guides) {
  emitGuide({ ...g, credit: CREDIT });
}
console.log('Done.');

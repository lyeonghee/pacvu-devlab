'use strict';

// Approved S001 insert-product contours, normalized from the source SVG units.
// Coordinates are reused from S001_298x61x292_3.insert_(cutpath,bleedpath,foldingline).svg.
const S001_SOURCE_UNIT_TO_MM = 0.3527778112205911;

const S001_APPROVED_CUT_COMMANDS = Object.freeze({
  'bottle-standard-bounds': Object.freeze([
    ['M', 31.181, 0],
    ['L', 124.724, 0],
    ['L', 124.724, 127.813],
    ['C', 124.724, 136.844, 127.615, 145.674, 132.956, 152.957],
    ['L', 147.674, 173.027],
    ['C', 153.015, 180.31, 155.905, 189.141, 155.905, 198.172],
    ['L', 155.905, 581.103],
    ['C', 155.905, 588.927, 149.555, 595.276, 141.732, 595.276],
    ['L', 14.173, 595.276],
    ['C', 6.35, 595.276, 0, 588.927, 0, 581.102],
    ['L', 0, 198.172],
    ['C', 0, 189.14, 2.891, 180.31, 8.232, 173.027],
    ['L', 22.95, 152.957],
    ['C', 28.291, 145.674, 31.181, 136.844, 31.181, 127.813],
    ['Z']
  ]),
  'jar-standard-bounds': Object.freeze([
    ['M', 0, 0],
    ['L', 153.071, 0],
    ['L', 153.071, 348.662],
    ['L', 0, 348.662],
    ['Z']
  ])
});

function S001_fitPathNum(value) {
  return Number(value.toFixed(4)).toString();
}

function S001_mapCommand(command, mapPoint) {
  if (command[0] === 'Z') return ['Z'];
  const mapped = [command[0]];
  for (let index = 1; index < command.length; index += 2) {
    const point = mapPoint(command[index], command[index + 1]);
    mapped.push(point.x, point.y);
  }
  return mapped;
}

function S001_commandsToPath(commands) {
  return commands.map(command => command[0] === 'Z'
    ? 'Z'
    : command[0] + ' ' + command.slice(1).map(S001_fitPathNum).join(' ')
  ).join(' ');
}

function S001_createLocalProductCutPath(cutProfile) {
  const source = S001_APPROVED_CUT_COMMANDS[cutProfile];
  if (!source) throw new Error('Unknown approved cut profile: ' + cutProfile);
  const commands = source.map(command => S001_mapCommand(command, (x, y) => ({
    x: x * S001_SOURCE_UNIT_TO_MM,
    y: y * S001_SOURCE_UNIT_TO_MM
  })));
  return { profileId: cutProfile, commands, d: S001_commandsToPath(commands), rotation: 0 };
}

function S001_placeProductCutPath(localCutPath, centerX, centerY, width, height, rotation) {
  const angle = (Number(rotation) || 0) * Math.PI / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const commands = localCutPath.commands.map(command => S001_mapCommand(command, (x, y) => {
    const localX = x - width / 2;
    const localY = y - height / 2;
    return {
      x: centerX + localX * cos - localY * sin,
      y: centerY + localX * sin + localY * cos
    };
  }));
  return {
    profileId: localCutPath.profileId,
    commands,
    d: S001_commandsToPath(commands),
    rotation: Number(rotation) || 0
  };
}

const S001_PRODUCT_CUT_PATH_API = {
  S001_SOURCE_UNIT_TO_MM,
  S001_APPROVED_CUT_COMMANDS,
  S001_createLocalProductCutPath,
  S001_placeProductCutPath
};
if (typeof module !== 'undefined' && module.exports) module.exports = S001_PRODUCT_CUT_PATH_API;
if (typeof window !== 'undefined') Object.assign(window, S001_PRODUCT_CUT_PATH_API);


// http://jsperf.com/typed-array-min-max/2
// plain for loop for finding min/max is way faster than anything else.
/**
 * @param {TypedArray} array - Subarray of audio to calculate peaks from.
 */
function findMinMax(array) {
  var min = Infinity;
  var max = -Infinity;
  var i = 0;
  var len = array.length;
  var curr;

  for (; i < len; i++) {
    curr = array[i];
    if (min > curr) {
      min = curr;
    }
    if (max < curr) {
      max = curr;
    }
  }

  return {
    min: min,
    max: max
  };
}

/**
 * @param {Number} n - peak to convert from float to Int8, Int16 etc.
 * @param {Number} bits - convert to #bits two's complement signed integer
 */
function convert(n, bits) {
  var max = Math.pow(2, bits - 1);
  var v = n < 0 ? n * max : n * max - 1;

  return Math.max(-max, Math.min(max - 1, v));
}

/**
 * @param {TypedArray} channel - Audio track frames to calculate peaks from.
 * @param {Number} samplesPerPixel - Audio frames per peak
 */
function extractPeaks(channel, samplesPerPixel, bits) {
  var i;
  var chanLength = channel.length;
  var numPeaks = Math.ceil(chanLength / samplesPerPixel);
  var start;
  var end;
  var segment;
  var max;
  var min;
  var extrema;

  // create interleaved array of min,max
  var peaks = new (eval('Int' + bits + 'Array'))(numPeaks * 2);

  for (i = 0; i < numPeaks; i++) {
    start = i * samplesPerPixel;
    end = (i + 1) * samplesPerPixel > chanLength ? chanLength : (i + 1) * samplesPerPixel;

    segment = channel.subarray(start, end);
    extrema = findMinMax(segment);
    min = convert(extrema.min, bits);
    max = convert(extrema.max, bits);

    peaks[i * 2] = min;
    peaks[i * 2 + 1] = max;
  }

  return peaks;
}
